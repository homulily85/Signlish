import asyncio
import os

from amazon_transcribe.client import TranscribeStreamingClient
from amazon_transcribe.handlers import TranscriptResultStreamHandler
from fastapi import WebSocket, WebSocketDisconnect, APIRouter

router = APIRouter()


class MyEventHandler(TranscriptResultStreamHandler):
    def __init__(self, transcript_result_stream, websocket: WebSocket):
        super().__init__(transcript_result_stream)
        self.websocket = websocket

    async def handle_transcript_event(self, transcript_event):
        try:
            results = transcript_event.transcript.results
            for result in results:
                if not result.is_partial:
                    for alt in result.alternatives:
                        await self.websocket.send_json(
                            {"transcript": alt.transcript}
                        )
        except WebSocketDisconnect:
            return
        except asyncio.CancelledError:
            raise


@router.websocket("/speech-to-text")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    client = TranscribeStreamingClient(region=os.getenv("AWS_REGION"))

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
        except (WebSocketDisconnect, RuntimeError):
            pass
        finally:
            await stream.input_stream.end_stream()

    writer_task = asyncio.create_task(write_chunks())
    reader_task = asyncio.create_task(handler.handle_events())

    try:
        await writer_task
    except Exception:
        pass
    finally:
        try:
            await asyncio.wait_for(reader_task, timeout=5.0)
        except asyncio.TimeoutError:
            reader_task.cancel()
            try:
                await reader_task
            except asyncio.CancelledError:
                pass
        except Exception:
            pass