import { Card, CardContent } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Lightbulb } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import type { DictionaryItem } from "@/types/type.ts";

export default function VisionMode({
  words,
  index,
  onNext,
}: {
  words: DictionaryItem[];
  index: number;
  onNext: () => void;
}) {
  const [showHint, setShowHint] = useState(false);
  const [detectedWord, setDetectedWord] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Refs for managing non-React DOM elements and intervals
  const videoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentWord = words[index];

  useEffect(()=>{
    if (isCorrect) {
      setTimeout(() => {
        onNext();
        setIsCorrect(false)
      },3000);
    }
  },[isCorrect, onNext]);

  // 1. Cleanup function (stops webcam, socket, and intervals)
  const stopWebcam = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // 2. Start function (initializes webcam and websocket)
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 30 } },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const socket = new WebSocket("ws://localhost:8000/sign-to-text/stream");
      socketRef.current = socket;

      socket.onopen = () => {
        const hiddenCanvas = document.createElement("canvas");
        const ctx = hiddenCanvas.getContext("2d");

        intervalRef.current = setInterval(() => {
          if (videoRef.current && socket.readyState === WebSocket.OPEN && ctx) {
            hiddenCanvas.width = videoRef.current.videoWidth;
            hiddenCanvas.height = videoRef.current.videoHeight;

            ctx.drawImage(videoRef.current, 0, 0);

            hiddenCanvas.toBlob(
              (blob) => {
                if (blob) socket.send(blob);
              },
              "image/jpeg",
              0.7
            );
          }
        }, 100);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.new_prediction) {
          // Logic adapted from your snippet to clean the text
          const lastChar = data.new_prediction.charAt(data.new_prediction.length - 1);
          let rawText = data.new_prediction.toLowerCase();

          if (lastChar >= '0' && lastChar <= '9') {
            rawText = rawText.slice(0, -1);
          }

          // Update state with the single latest detected word
          setDetectedWord(rawText.trim());
        }
      };

      socket.onclose = () => {
        stopWebcam();
      };
    } catch (err) {
      console.error("Error accessing webcam:", err);
      stopWebcam();
    }
  };

  // 3. Effect to manage lifecycle (Mount/Unmount)
  useEffect(() => {
    startWebcam();

    // Cleanup on unmount
    return () => {
      stopWebcam();
    };
  }, []);

  // 4. Effect to check if the detected word matches the target word
  useEffect(() => {
    if (!detectedWord) return;

    // Simple normalization for comparison
    const isMatch = detectedWord.toLowerCase() === currentWord.word.toLowerCase();
    setIsCorrect(isMatch);

    // Optional: Reset logic when word changes or handled by parent
  }, [detectedWord, currentWord]);

  // Reset state when the target word index changes
  useEffect(() => {
      setDetectedWord("");
      setIsCorrect(null);
      setShowHint(false);
  }, [index]);

  return (
    <Card>
      <CardContent className="p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-5xl font-bold mb-2">{currentWord.word}</h2>
          <p className="text-muted-foreground">Show this sign to your camera</p>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Detected:</p>
            <p
              className={`text-3xl font-bold transition-colors ${
                isCorrect === true
                  ? "text-green-600"
                  : isCorrect === false
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              {detectedWord || "Waiting..."}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md aspect-video bg-muted rounded-lg overflow-hidden relative">
              {/* Native Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100" // Mirror effect via CSS
              />
            </div>
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={() => setShowHint(!showHint)}>
              <Lightbulb className="w-4 h-4 mr-2" />
              {showHint ? "Hide" : "Show"} Hint
            </Button>

            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4"
                >
                  <Card className="bg-blue-50 dark:bg-blue-950">
                    <CardContent className="p-4">
                      <p className="text-sm text-foreground">
                        {currentWord.instruction}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}