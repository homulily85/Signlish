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
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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

  // Simulate video translation
  const handleTranslateVideo = useCallback(() => {
    if (!videoFile) return

    setIsTranslatingVideo(true)
    setTranslatedText("")

    // Simulate translation process
    setTimeout(() => {
      setTranslatedText("Hello, my name is Sarah. I am learning sign language. Thank you for watching.")
      setIsTranslatingVideo(false)
    }, 2000)
  }, [videoFile])

  // Simulate webcam activation
  const handleWebcamToggle = useCallback(() => {
    if (!isWebcamActive) {
      setIsWebcamActive(true)
      setRealtimeText("")

      // Simulate real-time translation
      const words = ["Hello", "I", "am", "happy", "to", "meet", "you"]
      let index = 0

      const interval = setInterval(() => {
        if (index < words.length) {
          setRealtimeText((prev) => (prev ? `${prev} ${words[index]}` : words[index]))
          index++
        } else {
          clearInterval(interval)
        }
      }, 1500)

      return () => clearInterval(interval)
    } else {
      setIsWebcamActive(false)
      setRealtimeText("")
    }
  }, [isWebcamActive])

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
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setIsListening(true);
      const socket = new WebSocket("ws://localhost:8000/speech-to-text");
      if (!socket) {
        console.error("WebSocket not initialized");
        return;
      }
      socketRef.current = socket;
      socket.onopen = async () => {
        console.log("WebSocket connected");
        const audioContext = new AudioContext({sampleRate: 16000});
        audioContextRef.current = audioContext;
        const input = audioContext.createMediaStreamSource(streamRef.current as MediaStream);

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
    const stream = streamRef.current;
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

    streamRef.current = null;
    socketRef.current = null;
    audioContextRef.current = null;
    setIsListening(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);


  // Simulate text to sign language translation
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

          <Tabs defaultValue="sign-to-text" className="w-full">
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
                              className="relative rounded-lg overflow-hidden bg-muted min-h-[300px] flex items-center justify-center">
                            {isWebcamActive ? (
                                <div
                                    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                                  <Camera className="h-16 w-16 text-muted-foreground animate-pulse"/>
                                </div>
                            ) : (
                                <Camera className="h-16 w-16 text-muted-foreground"/>
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
                          {isWebcamActive && (
                              <p className="text-sm text-muted-foreground text-center">
                                Performing signs... Translation appears automatically
                              </p>
                          )}
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
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Input Text</h2>
                    <div className="space-y-4">
                      <div className="relative">
                        <Textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type or speak the text you want to translate to sign language..."
                            className="min-h-[250px] resize-none text-base leading-relaxed pr-14"
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
                          className="w-full"
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
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Sign Language Video</h2>
                    <div
                        className="relative rounded-lg overflow-hidden bg-muted min-h-[300px] flex items-center justify-center">
                      {!signVideoUrl ? (
                          <div className="text-center p-8">
                            <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
                            <p className="text-muted-foreground">
                              Enter text and click translate to see the sign language video
                            </p>
                          </div>
                      ) : (
                          <div className="relative w-full group">
                            <pose-viewer
                                src={signVideoUrl}
                                autoplay
                                loop
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
