import asyncio
import json

import cv2
import numpy as np
from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect
from service.SignLanguageProcessor.sign_language_processor_service import SignLanguageProcessor
from tensorflow.keras.models import load_model

router = APIRouter()

global_model = load_model('./service/SignLanguageProcessor/models/best_model200.keras')
with open('./service/SignLanguageProcessor/models/index_to_gloss_200.json', 'r') as f:
    global_encoder = json.load(f)

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


@router.websocket("/sign-to-text")
async def websocket_predict(websocket: WebSocket):
    await websocket.accept()
    # Create a fresh processor for this user
    session_processor = SignLanguageProcessor(
        model=global_model,
        encoder=global_encoder,
    )

    try:
        while True:
            data = await websocket.receive_bytes()
            nparr = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None: continue

            result_data = session_processor.process_frame_get_results(frame)

            await websocket.send_json(result_data)

    except WebSocketDisconnect:
        print("Client disconnected")