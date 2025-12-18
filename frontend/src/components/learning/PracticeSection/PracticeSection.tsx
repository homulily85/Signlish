// components/practice/PracticeSection.tsx
import { useState } from "react";
import type { VocabularyWord } from "@/types/lesson";
import type { PracticeMode } from "@/types/type";

import PracticeSelection from "./PracticeSelection";
import PracticeCompletion from "./PracticeCompletion";
import FlashcardPractice from "./FlashcardPractice";
import MultipleChoicePractice from "./MultipleChoicePractice";
import VisionPractice from "@/components/learning/PracticeSection/VisonPractice.tsx";

type Props = {
    category: string;
    topicTitle: string;
    vocabularyWords?: VocabularyWord[]; // ✅ optional
    onBack?: () => void;
};

export default function PracticeSection({
    vocabularyWords = [], // ✅ fallback
    topicTitle,
    category,
    onBack,
}: Props) {
    const [mode, setMode] = useState<PracticeMode>("selection");

    /* ---------------- Selection ---------------- */
    if (mode === "selection") {
        return (
            <PracticeSelection
                topicTitle={topicTitle}
                totalWords={vocabularyWords.length} // an toàn
                onBack={onBack}
                onSelect={setMode}
            />
        );
    }

    /* ---------------- Completion ---------------- */
    if (mode === "completion") {
        return (
            <PracticeCompletion
                totalWords={vocabularyWords.length}
                topicTitle={topicTitle}
                onRetry={() => setMode("selection")}
                onBack={onBack}
            />
        );
    }

    /* ---------------- Flashcard ---------------- */
    if (mode === "flashcard") {
        return (
            <FlashcardPractice
                category={category}
                words={vocabularyWords.length ? vocabularyWords : undefined}
                onBack={() => setMode("selection")}
                onComplete={() => setMode("completion")}
            />
        );
    }

    /* ---------------- Multiple Choice ---------------- */
    if (mode === "multiple-choice") {
        return (
            <MultipleChoicePractice
                category={category}
                onBack={() => setMode("selection")}
                onComplete={() => setMode("completion")}
            />
        );
    }

    /* ---------------- Vision ---------------- */
    if (mode === "vision") {
        return (
            <VisionPractice
                category={category}
                words={vocabularyWords}
                onBack={() => setMode("selection")}
                onComplete={() => setMode("completion")}
            />
        );
    }

    return null;
}
