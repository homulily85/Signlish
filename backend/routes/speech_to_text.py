import asyncio
import os
import logging

from amazon_transcribe.client import TranscribeStreamingClient
from amazon_transcribe.handlers import TranscriptResultStreamHandler
from fastapi import WebSocket, WebSocketDisconnect, APIRouter

router = APIRouter()
logger = logging.getLogger(__name__)


class MyEventHandler(TranscriptResultStreamHandler):
    def __init__(self, transcript_result_stream, websocket: WebSocket):
        super().__init__(transcript_result_stream)
        self.websocket = websocket
        self._closed = False

    async def handle_transcript_event(self, transcript_event):
        if self._closed:
            return

        try:
            results = transcript_event.transcript.results
            for result in results:
                if not result.is_partial:
                    for alt in result.alternatives:
                        # Check if websocket is still connected before sending
                        if self.websocket.client_state.name == "CONNECTED":
                            await self.websocket.send_json(
                                {"transcript": alt.transcript}
                            )
                        else:
                            self._closed = True
                            return
        except (WebSocketDisconnect, asyncio.CancelledError):
            self._closed = True
            raise
        except Exception as e:
            # WebSocket might be closed, don't log as error
            if "after sending 'websocket.close'" not in str(e):
                logger.error(f"Error handling transcript: {e}")
            self._closed = True


@router.websocket("/speech-to-text")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    client = TranscribeStreamingClient(region=os.getenv("AWS_REGION"))
    stream = None
    writer_task = None
    reader_task = None

    try:
        stream = await client.start_stream_transcription(
            language_code="en-US",
            media_sample_rate_hz=16000,
            media_encoding="pcm",
        )

        handler = MyEventHandler(stream.output_stream, websocket)

        async def write_chunks():
            try:
                while True:
                    data = await websocket.receive_bytes()
                    await stream.input_stream.send_audio_event(audio_chunk=data)
            except (WebSocketDisconnect, RuntimeError, asyncio.CancelledError):
                pass

        writer_task = asyncio.create_task(write_chunks())
        reader_task = asyncio.create_task(handler.handle_events())

        # Wait for writer to complete (user disconnects or error)
        await writer_task

    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        # Step 1: Signal handler to stop sending
        if handler:
            handler._closed = True

        # Step 2: End the input stream (signals no more audio coming)
        if stream:
            try:
                await stream.input_stream.end_stream()
            except Exception as e:
                logger.error(f"Error ending stream: {e}")

        # Step 3: Wait for reader to finish processing remaining events
        if reader_task and not reader_task.done():
            try:
                # Give it time to process remaining events after stream ends
                await asyncio.wait_for(reader_task, timeout=3.0)
            except asyncio.TimeoutError:
                logger.warning("Reader task timed out, cancelling")
                reader_task.cancel()
                try:
                    await reader_task
                except asyncio.CancelledError:
                    pass
            except Exception as e:
                logger.error(f"Error waiting for reader: {e}")

        # Step 4: Cancel writer task if somehow still running
        if writer_task and not writer_task.done():
            writer_task.cancel()
            try:
                await writer_task
            except asyncio.CancelledError:
                pass

        # Step 5: Close websocket if still open
        try:
            if websocket.client_state.name == "CONNECTED":
                await websocket.close()
        except Exception:
            pass