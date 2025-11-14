import json
import threading

import cv2
import mediapipe as mp
import numpy as np
from tensorflow.keras.models import load_model

from .utils import preprocessing_split as preprocessing


class SignLanguageProcessor:
    def __init__(self, model_path, encoder_path, client, threshold=1.2, complexity_setting=0):
        # --- Initialization ---
        self.model = load_model(model_path)
        with open(encoder_path, 'r') as f:
            self.encoder = json.load(f)
        self.client = client
        self.threshold = threshold

        # --- MediaPipe Initialization ---
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_holistic = mp.solutions.holistic
        self.holistic = self.mp_holistic.Holistic(
            static_image_mode=False,
            model_complexity=complexity_setting,
            enable_segmentation=False,
            refine_face_landmarks=False,
            min_detection_confidence=0.6,
            min_tracking_confidence=0.9
        )

        # --- State Variables ---
        self.landmark_stored = []
        self.last_predictions = []
        self.counter = 0
        self.ema_score = None
        self.current_interpretation = ""
        self.interpreting = False

        # --- Concurrency Lock ---
        # To prevent race conditions when modifying state from different threads
        self.lock = threading.Lock()

    # --- Landmark Extraction and Preprocessing Methods ---
    def extract_landmarks(self, results):
        important_face_landmarks = [
            33, 133, 159, 145, 153, 144, 362, 263, 386, 374, 380, 373,
            70, 63, 105, 66, 107, 295, 282, 320, 285, 318, 1, 168, 197, 4,
            78, 308, 13, 14, 81, 311
        ]
        pose_indices_to_remove = set(list(range(23, 33)) + list(range(0, 11)))
        pose_indices_to_keep = [i for i in range(33) if i not in pose_indices_to_remove]

        pose = [(lm.x, lm.y) for i, lm in enumerate(results.pose_landmarks.landmark) if
                i in pose_indices_to_keep] if results.pose_landmarks else [(0, 0)] * len(pose_indices_to_keep)
        face = [(results.face_landmarks.landmark[i].x, results.face_landmarks.landmark[i].y) for i in
                important_face_landmarks] if results.face_landmarks else [(0, 0)] * len(important_face_landmarks)
        left_hand = [(lm.x, lm.y) for lm in
                     results.left_hand_landmarks.landmark] if results.left_hand_landmarks else [(0, 0)] * 21
        right_hand = [(lm.x, lm.y) for lm in
                      results.right_hand_landmarks.landmark] if results.right_hand_landmarks else [(0, 0)] * 21

        return np.array(pose + left_hand + right_hand + face)

    def preprocess(self, X):
        neck = abs(X[0] + X[1]) / 2
        X[:] = preprocessing.AnchorNorm(X[:], preprocessing.distance(X[0], X[1]), neck)
        X[54:] = preprocessing.AnchorNorm(X[54:], preprocessing.distance(X[0], X[1]), X[79])
        X[[2, 4, 6, 8, 10]] = preprocessing.AnchorNorm(X[[2, 4, 6, 8, 10]], preprocessing.distance(X[0], X[2]), X[0])
        X[[3, 5, 7, 9, 11]] = preprocessing.AnchorNorm(X[[3, 5, 7, 9, 11]], preprocessing.distance(X[1], X[3]), X[1])
        X[12:33] = preprocessing.hand_normalize(X[12:33])
        X[33:54] = preprocessing.hand_normalize(X[33:54])
        return X

    # --- Core Logic Methods ---
    def movement_score(self, landmarks_frames, hand_weight=3):
        hand_indices = list(range(12, 54))
        if len(landmarks_frames) < 2: return 0
        diffs = np.linalg.norm(landmarks_frames[1:] - landmarks_frames[:-1], axis=2)
        weighted_diffs = diffs.copy()
        weighted_diffs[:, hand_indices] *= hand_weight
        return np.mean(np.sum(weighted_diffs, axis=1))

    def update_ema(self, new_score, alpha=0.3):
        if self.ema_score is None:
            self.ema_score = new_score
        else:
            self.ema_score = alpha * new_score + (1 - alpha) * self.ema_score
        return self.ema_score

    def _interpret_gloss_sequence_thread(self, gloss_list, max_tokens=30):
        gloss_string = " + ".join(gloss_list)
        response = self.client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "developer",
                 "content": "You are a sign language interpreter. Convert input into well-formed English. Preserve whether the input is a question or a statement. If it ends with you, it is likely a question. Do not add your own commentary or questions."},
                {"role": "user", "content": gloss_string}
            ],
            stream=True, max_tokens=max_tokens
        )
        interpretation = ""
        for chunk in response:
            content = chunk.choices[0].delta.content
            if content:
                interpretation += content
                with self.lock:
                    self.current_interpretation = interpretation
        with self.lock:
            self.interpreting = False

    # --- Public Methods for API Interaction ---
    def trigger_interpretation(self):
        with self.lock:
            if not self.interpreting and self.last_predictions:
                gloss_input = self.last_predictions.copy()
                self.last_predictions.clear()
                self.interpreting = True
                threading.Thread(target=self._interpret_gloss_sequence_thread, args=(gloss_input,), daemon=True).start()

    def delete_last_prediction(self):
        with self.lock:
            if self.last_predictions:
                self.last_predictions.pop()

    # --- Frame Processing and Annotation ---
    def process_and_annotate_frame(self, frame):
        # 1. Process Frame for Landmarks
        frame = cv2.flip(frame, 1)
        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.holistic.process(image_rgb)
        self.mp_drawing.draw_landmarks(frame, results.left_hand_landmarks, self.mp_holistic.HAND_CONNECTIONS)
        self.mp_drawing.draw_landmarks(frame, results.right_hand_landmarks, self.mp_holistic.HAND_CONNECTIONS)

        numpy_data = self.extract_landmarks(results)
        data_processed = self.preprocess(numpy_data)

        with self.lock:
            self.landmark_stored.append(data_processed)
            self.landmark_stored = self.landmark_stored[-30:]

            # 2. Handle Capture Logic
            status_text = "Not Capturing"
            status_color = (0, 0, 255)  # Red
            if len(self.landmark_stored) > 5:
                score = self.movement_score(np.array(self.landmark_stored[-5:]))
                smoothed_score = self.update_ema(score)
                if smoothed_score > self.threshold:
                    self.counter += 1
                    status_text = "Capturing"
                    status_color = (0, 255, 0)  # Green
                else:
                    if self.counter > 0:
                        landmark_array = np.array(self.landmark_stored)
                        padded_array = preprocessing.pad_video(landmark_array)
                        reshape_array = padded_array.reshape(padded_array.shape[0], -1)
                        model_input = np.expand_dims(reshape_array, axis=0)
                        prediction = self.model.predict(model_input, verbose=0)
                        predicted_index = np.argmax(prediction)
                        prediction_result = self.encoder[str(predicted_index)]
                        self.counter = 0
                        self.last_predictions.append(prediction_result)
                        if len(self.last_predictions) > 10:
                            self.last_predictions.pop(0)

            # 3. Draw Overlays on Frame
            # Status circle and text
            cv2.circle(frame, (40, 40), 20, status_color, -1)
            cv2.putText(frame, status_text, (70, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, status_color, 2, cv2.LINE_AA)

            # Draw last predictions
            if self.last_predictions:
                self.draw_last_predictions(frame, self.last_predictions)

            # Draw interpretation
            if self.current_interpretation:
                self.show_interpreted_text(frame, self.current_interpretation)

            # Show "Interpreting..." status
            if self.interpreting:
                cv2.putText(frame, "Interpreting...", (frame.shape[1] - 220, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                            (255, 0, 0), 1, cv2.LINE_AA)

        return frame

    def draw_last_predictions(self, frame, predictions, x=10, y=70, line_height=30, font_scale=0.7, thickness=2):
        overlay = frame.copy()
        font = cv2.FONT_HERSHEY_SIMPLEX
        width = max(cv2.getTextSize(p, font, font_scale, thickness)[0][0] for p in predictions) if predictions else 0
        height = line_height * len(predictions) + 20
        cv2.rectangle(overlay, (x - 10, y - 20), (x + width + 10, y + height - 10), (0, 0, 0), -1)
        alpha = 0.6
        cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)
        for i, word in enumerate(predictions):
            cv2.putText(frame, word, (x, y + i * line_height), font, font_scale, (255, 255, 255), thickness,
                        cv2.LINE_AA)

    def show_interpreted_text(self, frame, text):
        font, font_scale, thickness, color, bg_color = cv2.FONT_HERSHEY_SIMPLEX, 1, 3, (0, 255, 255), (50, 50, 50)
        text_w, text_h = cv2.getTextSize(text, font, font_scale, thickness)[0]
        text_x = (frame.shape[1] - text_w) // 2
        text_y = frame.shape[0] - 40
        cv2.rectangle(frame, (text_x - 20, text_y - text_h - 20), (text_x + text_w + 20, text_y + 20), bg_color, -1)
        cv2.putText(frame, text, (text_x, text_y), font, font_scale, color, thickness, cv2.LINE_AA)
