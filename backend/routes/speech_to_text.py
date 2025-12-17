import asyncio
import os

from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from amazon_transcribe.client import TranscribeStreamingClient
from amazon_transcribe.handlers import TranscriptResultStreamHandler
from amazon_transcribe.model import TranscriptEvent

router = APIRouter()

# 1. Define a handler to process results from AWS
class MyEventHandler(TranscriptResultStreamHandler):
    def __init__(self, transcript_result_stream, websocket: WebSocket):
        # Pass the AWS stream to the parent class so it can handle the connection
        super().__init__(transcript_result_stream)
        # Store the frontend websocket for our own use
        self.websocket = websocket

    async def handle_transcript_event(self, transcript_event: TranscriptEvent):
        results = transcript_event.transcript.results
        for result in results:
            if not result.is_partial:
                for alt in result.alternatives:
                    # Now self.websocket is actually the FastAPI WebSocket
                    await self.websocket.send_json({"transcript": alt.transcript})

@router.websocket("/speech-to-text")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    client = TranscribeStreamingClient(region=os.getenv("AWS_REGION"))

    # Start the stream
    stream = await client.start_stream_transcription(
        language_code="en-US",
        media_sample_rate_hz=16000,
        media_encoding="pcm"
    )

    # Internal helper to write audio chunks to AWS
    async def write_chunks():
        try:
            while True:
                # Receive raw binary audio data from frontend
                data = await websocket.receive_bytes()
                # Send to AWS
                await stream.input_stream.send_audio_event(audio_chunk=data)
        except WebSocketDisconnect:
            print("Client disconnected")
        except Exception as e:
            print(f"Error in write_chunks: {e}")
        finally:
            await stream.input_stream.end_stream()

    # Internal helper to handle the response from AWS
    handler = MyEventHandler(stream.output_stream, websocket)

    try:
        # Run both the writer (mic -> AWS) and reader (AWS -> frontend) concurrently
        await asyncio.gather(write_chunks(), handler.handle_events())
    except Exception as e:
        print(f"Stream error: {e}")
