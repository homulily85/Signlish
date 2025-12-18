import {useEffect, useRef, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import Webcam from "react-webcam";
import {ChevronLeft, Lightbulb} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import type {DictionaryItem} from "@/types/type";

type Props = {
  category: string;
  words?: DictionaryItem[];
  onBack: () => void;
  onComplete: () => void;
};

export default function VisionPractice({
                                             category,
                                             words,
                                             onBack,
                                             onComplete,
                                           }: Props) {
  // --- State Management (from FlashcardPractice) ---
  const [cards, setCards] = useState<DictionaryItem[]>(words ?? []);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- Vision/Interaction State (from VisionMode) ---
  const [showHint, setShowHint] = useState(false);
  const [detectedWord, setDetectedWord] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Refs for simulation logic
  const scenarioRef = useRef(0);

  // 1. Fetch Data if not provided
  useEffect(() => {
    if (words?.length) {
      setCards(words);
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8000/lessons/categories/${category}/vision`)
        .then((res) => res.json())
        .then((data) => {
          setCards(data);
        })
        .catch((err) => {
          console.error("Failed to fetch vision lessons:", err);
        })
        .finally(() => setLoading(false));
  }, [category, words]);

  // 2. Handle Navigation (Next Card)
  const handleNext = () => {
    if (index + 1 >= cards.length) {
      onComplete();
    } else {
      setIndex((i) => i + 1);
      // Reset vision state for next card
      setDetectedWord("");
      setIsCorrect(null);
      setShowHint(false);
    }
  };

  const currentWord = cards[index];

  // 3. Simulation Logic (Adapted from VisionMode)
  useEffect(() => {
    if (!currentWord || !cards.length) return;

    // Reset state when currentWord changes
    setDetectedWord("");
    setIsCorrect(null);

    let isCancelled = false;

    // Helper to get a random wrong word from the list
    const getRandomWord = () => {
      const filtered = cards.filter((w) => w.word !== currentWord.word);
      // Fallback if no other words exist
      if (filtered.length === 0) return "WRONG";
      return filtered[Math.floor(Math.random() * filtered.length)].word;
    };

    const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    const runScenario = async () => {
      // Simulate waiting for user to prepare
      await delay(3000);
      if (isCancelled) return;

      const scenario = scenarioRef.current;
      // Cycle through 3 scenarios: Instant Correct -> 1 Wrong -> 2 Wrong
      scenarioRef.current = (scenarioRef.current + 1) % 3;

      if (scenario === 0) {
        // Scenario 1: Immediate correct detection
        if (isCancelled) return;
        setDetectedWord(currentWord.word);
        setIsCorrect(true);
      } else if (scenario === 1) {
        // Scenario 2: One wrong guess, then correct
        if (isCancelled) return;
        setDetectedWord(getRandomWord());
        setIsCorrect(false);

        await delay(2000);
        if (isCancelled) return;

        setDetectedWord(currentWord.word);
        setIsCorrect(true);
      } else {
        // Scenario 3: Two wrong guesses, then correct
        if (isCancelled) return;
        setDetectedWord(getRandomWord());
        setIsCorrect(false);

        await delay(2000);
        if (isCancelled) return;

        setDetectedWord(getRandomWord());
        setIsCorrect(false);

        await delay(2000);
        if (isCancelled) return;

        setDetectedWord(currentWord.word);
        setIsCorrect(true);
      }

      // Wait a moment after success before moving next
      await delay(3000);
      if (isCancelled) return;
      handleNext();
    };

    runScenario();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord, cards]);

  // --- Render ---

  if (loading) {
    return <div className="p-6 text-center">Loading vision practice...</div>;
  }

  if (!currentWord) return null;

  return (
      <div className="max-w-xl mx-auto p-6 space-y-6">
        {/* Navigation Header */}
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2"/>
          Back
        </Button>

        <div className="text-center text-muted-foreground">
          Card {index + 1} / {cards.length}
        </div>

        {/* Main Interaction Card */}
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-5xl font-bold mb-2">{currentWord.word}</h2>
              <p className="text-muted-foreground">
                Show this sign to your camera
              </p>
            </div>

            <div className="space-y-4">
              {/* Detection Status */}
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

              {/* Webcam View */}
              <div className="flex justify-center">
                <div
                    className="w-full max-w-md aspect-video bg-muted rounded-lg overflow-hidden relative border-2 border-border">
                  <Webcam
                      audio={false}
                      className="w-full h-full object-cover"
                      mirrored
                  />
                </div>
              </div>

              {/* Hint Section */}
              <div className="text-center">
                <Button variant="outline" onClick={() => setShowHint(!showHint)}>
                  <Lightbulb className="w-4 h-4 mr-2"/>
                  {showHint ? "Hide" : "Show"} Hint
                </Button>

                <AnimatePresence>
                  {showHint && (
                      <motion.div
                          initial={{height: 0, opacity: 0}}
                          animate={{height: "auto", opacity: 1}}
                          exit={{height: 0, opacity: 0}}
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
      </div>
  );
}