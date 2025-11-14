import threading
import time

import cv2


class CameraManager:
    def __init__(self, device_index=0, warmup_seconds=0.5):
        self.device_index = device_index
        self.warmup_seconds = warmup_seconds
        self._cap = None
        self._thread = None
        self._running = threading.Event()
        self._frame_lock = threading.Lock()
        self._latest_frame = None  # bytes (jpeg)
        self._last_read_time = 0

    def start(self):
        if self._thread and self._thread.is_alive():
            return
        self._running.set()
        self._thread = threading.Thread(target=self._capture_loop, daemon=True)
        self._thread.start()

    def _capture_loop(self):
        try:
            self._cap = cv2.VideoCapture(self.device_index)
            if not self._cap.isOpened():
                print(f"CameraManager: could not open camera {self.device_index}")
                self._running.clear()
                return
            # optional warmup
            time.sleep(self.warmup_seconds)
            while self._running.is_set():
                ret, frame = self._cap.read()
                if not ret:
                    # if read fails, wait a bit and retry
                    time.sleep(0.05)
                    continue

                # optionally process frame here (or return raw frame and let processor handle)
                # encode as JPEG bytes
                ret2, buffer = cv2.imencode(".jpg", frame)
                if not ret2:
                    continue
                frame_bytes = buffer.tobytes()
                with self._frame_lock:
                    self._latest_frame = frame_bytes
                    self._last_read_time = time.time()
        except Exception as e:
            print("CameraManager capture loop exception:", e)
        finally:
            try:
                if self._cap is not None:
                    self._cap.release()
            except Exception:
                pass
            self._cap = None
            self._running.clear()
            print("CameraManager: capture thread exiting, camera released.")

    def get_frame(self):
        with self._frame_lock:
            return self._latest_frame

    def stop(self):
        self._running.clear()
        # allow thread to exit cleanly
        if self._thread:
            self._thread.join(timeout=1.0)
        # capture_release handled in the thread finally block