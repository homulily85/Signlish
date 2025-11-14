import asyncio
import os

import cv2
from dotenv import load_dotenv
from fastapi import APIRouter, Request
from openai import OpenAI
from service.SignLanguageProcessor.sign_language_processor_service import SignLanguageProcessor
from service.SignLanguageProcessor.utils.camera_manager import CameraManager
from starlette.responses import HTMLResponse, StreamingResponse

router = APIRouter(prefix="/processor", tags=["Users"])


def get_client(env_path='.env'):
    load_dotenv(dotenv_path=env_path)
    return OpenAI(api_key=os.getenv("API_KEY"))


client = get_client()  # Load your OpenAI client
processor = SignLanguageProcessor(
    model_path='./service/SignLanguageProcessor/models/best_model200.keras',
    encoder_path='./service/SignLanguageProcessor/models/index_to_gloss_200.json',
    client=client
)

camera_manager = CameraManager(device_index=0)


# Streaming generator used by the endpoint
async def mjpeg_stream_generator(request: Request):
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        return

    try:
        while True:
            # stop immediately if browser tab closed
            if await request.is_disconnected():
                break

            success, frame = cap.read()
            if not success:
                break

            # 👉 Send frame through your model
            annotated_frame = processor.process_and_annotate_frame(frame)

            # Encode processed frame to JPEG
            ret, buffer = cv2.imencode('.jpg', annotated_frame)
            if not ret:
                continue

            frame_bytes = buffer.tobytes()

            # yield frame in MJPEG format
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

            # small async sleep to avoid tight loop
            await asyncio.sleep(0.03)

    except Exception as e:
        print("Error during streaming:", e)
    finally:
        cap.release()


@router.get("/")
async def read_root():
    """Serve the main HTML page."""
    with open("./service/SignLanguageProcessor/index.html") as f:
        return HTMLResponse(content=f.read(), status_code=200)


@router.get("/video_feed")
async def video_feed(request: Request):
    """Stream processed video with model annotations."""
    return StreamingResponse(
        mjpeg_stream_generator(request),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.post("/interpret")
async def interpret():
    """Endpoint to trigger the LLM interpretation."""
    processor.trigger_interpretation()
    return {"status": "interpretation started"}


@router.post("/delete_last")
async def delete_last():
    """Endpoint to delete the last prediction."""
    processor.delete_last_prediction()
    return {"status": "last prediction deleted"}
