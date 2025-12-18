import json
import os
import shutil
import tempfile

import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, UploadFile, File
from service.SignLanguageProcessor.sign_language_processor_service import SignLanguageProcessor
from tensorflow.keras.models import load_model

router = APIRouter(prefix="/sign-to-text")

global_model = load_model('./service/SignLanguageProcessor/models/best_model_200_new.keras')
with open('./service/SignLanguageProcessor/models/index_to_gloss_200_new.json', 'r') as f:
    global_encoder = json.load(f)


@router.websocket("/stream")
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


def process_video_file(file_path: str):
    """
    Reads a video file frame by frame and runs the SignLanguageProcessor.
    Returns the sequence of detected signs.
    """
    # Instantiate a FRESH processor for this specific video
    # This ensures state (counter, landmarks history) is clean
    processor = SignLanguageProcessor(global_model, global_encoder)

    cap = cv2.VideoCapture(file_path)
    detected_words = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Process the frame using your existing method
        results = processor.process_frame_get_results(frame)

        # Check if a new word was predicted in this specific frame
        new_word = results.get("new_prediction")
        if new_word:
            detected_words.append(new_word)

    cap.release()

    return {
        "prediction": detected_words,
    }


# ---------------------------------------------------------
# 3. ENDPOINT: Handle the Upload
# ---------------------------------------------------------
@router.post("/video")
async def analyze_sign_video(file: UploadFile = File(...)):
    # 1. Create a temporary file to save the uploaded video
    # OpenCV requires a file path to read video
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
        try:
            # Write the upload stream to the temp file
            shutil.copyfileobj(file.file, temp_video)
            temp_path = temp_video.name

            # 2. Process the video
            # (Ideally, offload this to a background task if videos are long)
            result = process_video_file(temp_path)

            return {
                "filename": file.filename,
                "prediction": result["prediction"]
            }

        finally:
            # 3. Cleanup: Close file and delete from disk
            temp_video.close()
            if os.path.exists(temp_path):
                os.remove(temp_path)
