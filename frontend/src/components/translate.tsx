"use client"

import React, {useCallback, useEffect, useRef, useState} from "react"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Card, CardContent} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Textarea} from "@/components/ui/textarea"
import {Camera, Loader2, Mic, RefreshCcw, Upload, Video} from "lucide-react"

type InputMode = "upload" | "webcam"

export default function TranslatePage() {
  // Tab 1: Sign Language to Text
  const [inputMode, setInputMode] = useState<InputMode>("upload")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>("")
  const [isTranslatingVideo, setIsTranslatingVideo] = useState(false)
  const [translatedText, setTranslatedText] = useState("")
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [realtimeText, setRealtimeText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tab 2: Text to Sign Language
  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isTranslatingText, setIsTranslatingText] = useState(false)
  const [signVideoUrl, setSignVideoUrl] = useState("")

  const lastTranslatedRef = useRef("");
  const mediaRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle video file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
      setTranslatedText("")
    }
  }

  const handleUpload = useCallback(async () => {
    if (!videoFile) return;

    setIsTranslatingVideo(true);

    try {
      const formData = new FormData();
      formData.append("file", videoFile);

      const response = await fetch(
          "http://localhost:8000/sign-to-text/video",
          {
            method: "POST",
            body: formData,
          }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (Array.isArray(data.prediction)) {
        const cleaned = data.prediction.map((s: string) =>
            s.toLowerCase().replace(/\d$/, "")
        );

        setTranslatedText(cleaned.join(" "));
      }
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setIsTranslatingVideo(false);
    }
  }, [videoFile]);


  const handleTranslateVideo = useCallback(async () => {
    if (!videoFile) return;
    await handleUpload();
  }, [videoFile, handleUpload]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {width: 640, height: 480, frameRate: {ideal: 30}}
      });

      mediaRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const socket = new WebSocket("ws://localhost:8000/sign-to-text/stream");
      socketRef.current = socket;

      socket.onopen = () => {
        setIsWebcamActive(true);

        const hiddenCanvas = document.createElement('canvas');
        const ctx = hiddenCanvas.getContext('2d');

        intervalRef.current = setInterval(() => {
          if (videoRef.current && socket.readyState === WebSocket.OPEN && ctx) {
            hiddenCanvas.width = videoRef.current.videoWidth;
            hiddenCanvas.height = videoRef.current.videoHeight;

            ctx.drawImage(videoRef.current, 0, 0);

            hiddenCanvas.toBlob((blob) => {
              if (blob) socket.send(blob);
            }, 'image/jpeg', 0.7);
          }
        }, 100);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.new_prediction) {
          setRealtimeText(prevState => {
            const lastChar = data.new_prediction.charAt(data.new_prediction.length - 1);
            let rawText = data.new_prediction.toLowerCase()
            if (lastChar >= '0' && lastChar <= '9') {
              rawText = rawText.slice(0, -1);
            }
            return prevState + ' ' + rawText;
          });
        }
      };

      socket.onclose = () => {
        stopWebcam();
      };

    } catch (err) {
      console.error("Error accessing webcam:", err);
      stopWebcam();
    }
  }

  const stopWebcam = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (mediaRef.current) {
      mediaRef.current.getTracks().forEach(track => track.stop());
      mediaRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsWebcamActive(false);
  }

  const handleWebcamToggle = () => {
    if (isWebcamActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
      stopMicrophone()
    };
  }, []);
  // Handle uploading different video
  const handleUploadDifferent = () => {
    setVideoFile(null)
    setVideoPreview("")
    setTranslatedText("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleVoiceInput = () => {
    if (isListening) {
      stopMicrophone();
    } else {
      startMicrophone();
    }
  };

  const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  }

  const startMicrophone = async () => {
    try {
      mediaRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      const socket = new WebSocket("ws://localhost:8000/speech-to-text");
      if (!socket) {
        console.error("WebSocket not initialized");
        return;
      }
      socketRef.current = socket;
      socket.onopen = async () => {
        setIsListening(true);
        console.log("WebSocket connected");
        const audioContext = new AudioContext({sampleRate: 16000});
        audioContextRef.current = audioContext;
        const input = audioContext.createMediaStreamSource(mediaRef.current as MediaStream);

        // 4. Create a processor to intercept audio chunks
        // bufferSize 4096 means we process ~0.25s of audio at a time
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        input.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert Float32 (browser) to Int16 (AWS)
          const pcmData = floatTo16BitPCM(inputData);

          if (socket.readyState === WebSocket.OPEN) {
            socket.send(pcmData);
          }
        };
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // setInputText(inputText.concat(data.transcript))
        setInputText(prev => prev + " " + data.transcript);
      };
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopMicrophone = () => {
    const stream = mediaRef.current;
    const socket = socketRef.current;
    const audioContext = audioContextRef.current;

    if (socket) {
      socket.close()
    }
    if (audioContext) {
      audioContext.close()
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    mediaRef.current = null;
    socketRef.current = null;
    audioContextRef.current = null;
    setIsListening(false);
  };

  useEffect(() => {
    return () => {
      if (mediaRef.current) {
        mediaRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleTranslateText = useCallback(async () => {
    if (!inputText.trim()) return

    if (inputText === lastTranslatedRef.current) return;

    lastTranslatedRef.current = inputText;

    const payload = {text: inputText.trim()}

    setIsTranslatingText(true)

    const res = await fetch("http://localhost:8000/text-to-sign/", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      // Handle error
      setIsTranslatingText(false)
      console.log(res.statusText)
      return
    }

    const blob = await res.blob();
    const videoUrl = URL.createObjectURL(blob);

    setIsTranslatingText(false)
    setSignVideoUrl(videoUrl)

  }, [inputText])

  return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">Sign Language Translator</h1>
            <p className="text-muted-foreground">Learn and translate sign language with ease</p>
          </header>

          <Tabs defaultValue="sign-to-text" className="w-full"
                onValueChange={(value) => {
                  setTranslatedText("")
                  setRealtimeText("")
                  if (value !== "text-to-sign" && isListening) {
                    stopMicrophone()
                  }
                  if (value !== "sign-to-text" && isWebcamActive) {
                    stopWebcam()
                  }
                }}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="sign-to-text">Sign to Text</TabsTrigger>
              <TabsTrigger value="text-to-sign">Text to Sign</TabsTrigger>
            </TabsList>

            {/* Tab 1: Sign Language to Text */}
            <TabsContent value="sign-to-text" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Pane: Input Source */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Input</h2>
                      <div className="flex gap-2">
                        <Button
                            variant={inputMode === "upload" ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              if (isWebcamActive) {
                                stopWebcam()
                                setTranslatedText("")
                                setRealtimeText("")
                              }
                              setInputMode("upload")
                              setIsWebcamActive(false)
                              setRealtimeText("")
                            }}
                        >
                          <Upload className="h-4 w-4 mr-2"/>
                          Upload
                        </Button>
                        <Button
                            variant={inputMode === "webcam" ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setInputMode("webcam")
                              setVideoFile(null)
                              setVideoPreview("")
                              setTranslatedText("")
                            }}
                        >
                          <Camera className="h-4 w-4 mr-2"/>
                          Webcam
                        </Button>
                      </div>
                    </div>

                    {/* Upload Video Mode */}
                    {inputMode === "upload" && (
                        <div className="space-y-4">
                          <input
                              ref={fileInputRef}
                              type="file"
                              accept="video/*"
                              onChange={handleFileChange}
                              className="hidden"
                              id="video-upload"
                          />

                          {!videoFile ? (
                              <label
                                  htmlFor="video-upload"
                                  className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                              >
                                <Upload className="h-12 w-12 text-muted-foreground mb-4"/>
                                <p className="text-muted-foreground text-center">Click to upload a sign language
                                  video</p>
                                <p className="text-sm text-muted-foreground mt-2">MP4, MOV, AVI (Max 100MB)</p>
                              </label>
                          ) : (
                              <div className="space-y-4">
                                <div
                                    className="relative rounded-lg overflow-hidden bg-black min-h-[300px] flex items-center justify-center">
                                  <video
                                      src={videoPreview}
                                      className="w-full h-full max-h-[400px] object-contain"
                                      controls
                                      autoPlay
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" onClick={handleUploadDifferent}
                                          className="flex-1 bg-transparent">
                                    <RefreshCcw className="h-4 w-4 mr-2"/>
                                    Upload Different
                                  </Button>
                                  <Button onClick={handleTranslateVideo} disabled={isTranslatingVideo}
                                          className="flex-1">
                                    {isTranslatingVideo ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                          Translating...
                                        </>
                                    ) : (
                                        "Translate"
                                    )}
                                  </Button>
                                </div>
                              </div>
                          )}
                        </div>
                    )}

                    {/* Webcam Mode */}
                    {inputMode === "webcam" && (
                        <div className="space-y-4">
                          <div
                              className="relative rounded-lg overflow-hidden bg-muted min-h-[300px] flex items-center justify-center bg-black">
                            {/* VIDEO ELEMENT FOR WEBCAM */}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full object-cover transform scale-x-[-1] ${!isWebcamActive && 'hidden'}`}
                            />

                            {!isWebcamActive && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Camera className="h-16 w-16 text-muted-foreground"/>
                                </div>
                            )}

                            {isWebcamActive && (
                                <div
                                    className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                  <span className="h-2 w-2 bg-white rounded-full animate-pulse"/>
                                  LIVE
                                </div>
                            )}
                          </div>

                          <Button
                              onClick={handleWebcamToggle}
                              className="w-full"
                              variant={isWebcamActive ? "destructive" : "default"}
                          >
                            {isWebcamActive ? "Stop Webcam" : "Start Webcam"}
                          </Button>
                        </div>
                    )}
                  </CardContent>
                </Card>

                {/* Right Pane: Output Text */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Translated Text</h2>
                    <Textarea
                        value={inputMode === "upload" ? translatedText : realtimeText}
                        readOnly
                        placeholder="Translated text will appear here..."
                        className="min-h-[360px] resize-none text-base leading-relaxed"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab 2: Text to Sign Language */}
            <TabsContent value="text-to-sign" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Pane: Text Input */}
                <Card className="h-[600px]">
                  <CardContent className="p-6 flex flex-col h-full">
                    <h2 className="text-xl font-semibold mb-4">Input Text</h2>
                    <div className="space-y-4 flex-1 flex flex-col min-h-0">
                      <div className="relative flex-1 min-h-0">
                        <Textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type or speak the text you want to translate to sign language..."
                            className="h-full resize-none text-base leading-relaxed pr-14"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleVoiceInput}
                            className={"absolute bottom-3 right-3"}
                        >
                          {isListening ? <Mic className="h-5 w-5 animate-pulse text-red-500 "/> :
                              <Mic className="h-5 w-5"/>}
                        </Button>
                      </div>
                      <Button
                          onClick={handleTranslateText}
                          disabled={!inputText.trim() || isTranslatingText}
                          className="w-full flex-shrink-0"
                      >
                        {isTranslatingText ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                              Translating...
                            </>
                        ) : (
                            "Translate to Sign Language"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Pane: Sign Language Video Output */}
                <Card className="h-[600px]">
                  <CardContent className="p-6 flex flex-col h-full">
                    <h2 className="text-xl font-semibold mb-4">Sign Language Video</h2>
                    <div
                        className="relative rounded-lg overflow-hidden bg-muted flex-1 min-h-0 flex items-center justify-center">
                      {!signVideoUrl ? (
                          <div className="text-center p-8">
                            <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
                            <p className="text-muted-foreground">
                              Enter text and click translate to see the sign language video
                            </p>
                          </div>
                      ) : (
                          <div className="relative w-full h-full group">
                            <pose-viewer
                                src={signVideoUrl}
                                autoplay
                                loop
                                className="w-full h-full"
                            />
                          </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  )
}
