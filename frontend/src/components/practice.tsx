"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, BookOpen, Grid3x3, Camera, Lightbulb, Trophy } from "lucide-react"
import Webcam from "react-webcam"

// Mock practice data
const practiceData = [
  {
    word: "Hello",
    definition: "A greeting used when meeting someone",
    videoUrl: "/placeholder.svg?height=300&width=400",
    instruction: "Wave your hand from side to side near your head",
    wrongOptions: ["Goodbye", "Thank You", "Please"],
  },
  {
    word: "Thank You",
    definition: "An expression of gratitude",
    videoUrl: "/placeholder.svg?height=300&width=400",
    instruction: "Move your hand from your chin outward",
    wrongOptions: ["Hello", "Sorry", "Welcome"],
  },
  {
    word: "Sorry",
    definition: "An expression of apology or regret",
    videoUrl: "/placeholder.svg?height=300&width=400",
    instruction: "Make a circular motion over your chest with your fist",
    wrongOptions: ["Excuse Me", "Hello", "Help"],
  },
  {
    word: "Please",
    definition: "A polite word used when asking for something",
    videoUrl: "/placeholder.svg?height=300&width=400",
    instruction: "Rub your hand in a circular motion on your chest",
    wrongOptions: ["Thank You", "Yes", "No"],
  },
]

type PracticeMode = "selection" | "flashcard" | "multiple-choice" | "vision" | "completion"

export default function Practice() {
  const [mode, setMode] = useState<PracticeMode>("selection")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [detectedWord, setDetectedWord] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const currentWord = practiceData[currentIndex]
  const isLastWord = currentIndex === practiceData.length - 1

  // Simulate AI detection for Vision Mode
  useEffect(() => {
    if (mode === "vision" && currentWord) {
      setDetectedWord("")
      setIsCorrect(null)

      // Simulate successful detection after 3 seconds
      const timer = setTimeout(() => {
        setDetectedWord(currentWord.word)
        setIsCorrect(true)

        // Auto-advance after showing success
        setTimeout(() => {
          handleNext()
        }, 1500)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [mode, currentIndex])

  const handleModeSelect = (selectedMode: PracticeMode) => {
    setMode(selectedMode)
    setCurrentIndex(0)
    resetState()
  }

  const resetState = () => {
    setIsFlipped(false)
    setSelectedAnswer(null)
    setShowHint(false)
    setDetectedWord("")
    setIsCorrect(null)
  }

  const handleNext = () => {
    if (isLastWord) {
      setMode("completion")
    } else {
      setCurrentIndex(currentIndex + 1)
      resetState()
    }
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
    setIsCorrect(answer === currentWord.word)
  }

  const handleBackToPractice = () => {
    setMode("selection")
    setCurrentIndex(0)
    resetState()
  }

  // Generate multiple choice options
  const getMultipleChoiceOptions = () => {
    const options = [currentWord.word, ...currentWord.wrongOptions]
    return options.sort(() => Math.random() - 0.5)
  }

  if (mode === "selection") {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Practice Mode</h1>
            <p className="text-muted-foreground text-lg">Choose your learning style</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card
                className="cursor-pointer h-full hover:shadow-xl transition-shadow"
                onClick={() => handleModeSelect("flashcard")}
              >
                <CardHeader>
                  <BookOpen className="w-12 h-12 mb-4 text-blue-600" />
                  <CardTitle className="text-2xl">Flashcard Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Watch signs and flip cards to reveal meanings. Perfect for memorization!
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card
                className="cursor-pointer h-full hover:shadow-xl transition-shadow"
                onClick={() => handleModeSelect("multiple-choice")}
              >
                <CardHeader>
                  <Grid3x3 className="w-12 h-12 mb-4 text-green-600" />
                  <CardTitle className="text-2xl">Multiple Choice</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Test your knowledge by identifying signs from multiple options.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card
                className="cursor-pointer h-full hover:shadow-xl transition-shadow"
                onClick={() => handleModeSelect("vision")}
              >
                <CardHeader>
                  <Camera className="w-12 h-12 mb-4 text-purple-600" />
                  <CardTitle className="text-2xl">Vision Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Practice signs with your webcam and get real-time feedback!</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (mode === "completion") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md text-center">
            <CardHeader>
              <Trophy className="w-24 h-24 mx-auto text-yellow-500 mb-4" />
              <CardTitle className="text-3xl">Congratulations!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 text-lg">
                You've completed all {practiceData.length} words! Great job practicing your sign language skills.
              </p>
              <Button onClick={handleBackToPractice} size="lg">
                Back to Menu
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={handleBackToPractice} className="mb-6">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Practice
        </Button>

        <div className="mb-6 flex items-center justify-between">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {currentIndex + 1} / {practiceData.length}
          </Badge>
        </div>

        {mode === "flashcard" && (
          <div className="space-y-6">
            <div className="perspective-1000">
              <motion.div
                className="relative w-full"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: "preserve-3d" }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <Card className="cursor-pointer min-h-[500px] flex flex-col">
                  <AnimatePresence mode="wait">
                    {!isFlipped ? (
                      <motion.div key="front" className="flex flex-col h-full" style={{ backfaceVisibility: "hidden" }}>
                        <CardHeader>
                          <CardTitle className="text-2xl text-center">What's this sign?</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center">
                          <img
                            src={currentWord.videoUrl || "/placeholder.svg"}
                            alt="Sign language gesture"
                            className="w-full max-w-md rounded-lg"
                          />
                        </CardContent>
                        <div className="p-6 text-center text-muted-foreground">Click to reveal answer</div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="back"
                        className="flex flex-col h-full justify-center"
                        style={{
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <CardContent className="text-center space-y-6 py-12">
                          <h2 className="text-5xl font-bold text-foreground">{currentWord.word}</h2>
                          <p className="text-xl text-muted-foreground max-w-md mx-auto">{currentWord.definition}</p>
                        </CardContent>
                        <div className="p-6 text-center text-muted-foreground">Click to flip back</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleNext} size="lg">
                Next
              </Button>
            </div>
          </div>
        )}

        {mode === "multiple-choice" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">What's this sign?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <img
                    src={currentWord.videoUrl || "/placeholder.svg"}
                    alt="Sign language gesture"
                    className="w-full max-w-md rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {getMultipleChoiceOptions().map((option) => {
                    const isSelected = selectedAnswer === option
                    const isCorrectAnswer = option === currentWord.word
                    const showAsCorrect = selectedAnswer && isCorrectAnswer
                    const showAsWrong = isSelected && !isCorrectAnswer

                    return (
                      <Button
                        key={option}
                        variant="outline"
                        size="lg"
                        onClick={() => !selectedAnswer && handleAnswerSelect(option)}
                        disabled={!!selectedAnswer}
                        className={`h-20 text-lg ${showAsCorrect
                          ? "bg-green-500 text-white hover:bg-green-500"
                          : showAsWrong
                            ? "bg-red-500 text-white hover:bg-red-500"
                            : ""
                          }`}
                      >
                        {option}
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {selectedAnswer && (
              <div className="flex justify-center">
                <Button onClick={handleNext} size="lg">
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {mode === "vision" && (
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
                    className={`text-3xl font-bold transition-colors ${isCorrect === true
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
                  <div className="w-full max-w-md aspect-video bg-muted rounded-lg overflow-hidden">
                    <Webcam audio={false} className="w-full h-full object-cover" mirrored />
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
                            <p className="text-sm text-foreground">{currentWord.instruction}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
