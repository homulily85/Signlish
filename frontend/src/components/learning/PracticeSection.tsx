import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Grid3x3, Camera, Trophy, ChevronLeft } from "lucide-react";
import Practice from "@/components/practice";
import type { VocabularyWord } from "@/types/lesson";

type PracticeMode = "selection" | "flashcard" | "multiple-choice" | "vision" | "completion";

type PracticeSectionProps = {
  vocabularyWords: VocabularyWord[];
  topicTitle: string;
  onBack?: () => void;
};

export default function PracticeSection({ vocabularyWords, topicTitle, onBack }: PracticeSectionProps) {
  const [mode, setMode] = useState<PracticeMode>("selection");

  const handleModeSelect = (selectedMode: PracticeMode) => {
    setMode(selectedMode);
  };

  const handleBackToSelection = () => {
    setMode("selection");
  };

  const handleCompletion = () => {
    setMode("completion");
  };

  if (mode === "selection") {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Back Button */}
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Button>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Practice Time!</h1>
          <p className="text-muted-foreground text-lg">
            Choose how you want to practice {vocabularyWords.length} words from <span className="font-semibold">{topicTitle}</span>
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card
              className="cursor-pointer h-full hover:shadow-xl transition-shadow border-2 hover:border-blue-400"
              onClick={() => handleModeSelect("flashcard")}
            >
              <CardHeader className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">Flashcard Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Watch signs and flip cards to reveal meanings. Perfect for memorization!
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card
              className="cursor-pointer h-full hover:shadow-xl transition-shadow border-2 hover:border-green-400"
              onClick={() => handleModeSelect("multiple-choice")}
            >
              <CardHeader className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Grid3x3 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">Multiple Choice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Test your knowledge by identifying signs from multiple options.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card
              className="cursor-pointer h-full hover:shadow-xl transition-shadow border-2 hover:border-purple-400"
              onClick={() => handleModeSelect("vision")}
            >
              <CardHeader className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">Vision Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Practice signs with your webcam and get real-time feedback!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (mode === "completion") {
    return (
      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
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
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-lg">
                You've completed all {vocabularyWords.length} words from <span className="font-semibold">{topicTitle}</span>! 
                Great job practicing your sign language skills.
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={handleBackToSelection} size="lg" variant="default">
                  Practice Again
                </Button>
                {onBack && (
                  <Button onClick={onBack} size="lg" variant="outline">
                    Back to Lessons
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Render the Practice component for flashcard, multiple-choice, or vision modes
  return (
    <div className="relative">
      <Practice
        mode={mode}
        vocabularyWords={vocabularyWords}
        onComplete={handleCompletion}
        onBack={handleBackToSelection}
      />
    </div>
  );
}
