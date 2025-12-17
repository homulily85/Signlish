"use client"

import { useEffect, useState } from "react"
import { fetchFlashcards, fetchQuestions } from "@/lib/practice.api"
import type { Lesson, Question, PracticeMode } from "@/types/type"
import PracticeMenu from "./PracticeMenu"
import FlashcardMode from "./FlashcardMode"
import MultipleChoiceMode from "./MultipleChoiceMode"
import Completion from "./Completion"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function Practice() {
    const [mode, setMode] = useState<PracticeMode>("selection")
    const [index, setIndex] = useState(0)
    const [flashcards, setFlashcards] = useState<Lesson[]>([])
    const [questions, setQuestions] = useState<Question[]>([])

    useEffect(() => {
        fetchFlashcards().then(setFlashcards)
        fetchQuestions().then(setQuestions)
    }, [])

    const next = (length: number) => {
        if (index + 1 >= length) setMode("completion")
        else setIndex(index + 1)
    }

    if (mode === "selection") return <PracticeMenu onSelect={setMode} />

    if (mode === "completion")
        return <Completion onBack={() => setMode("selection")} />

    return (
        <div className="min-h-screen p-6 max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setMode("selection")}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            {mode === "flashcard" && (
                <FlashcardMode
                    data={flashcards}
                    index={index}
                    onNext={() => next(flashcards.length)}
                />
            )}

            {mode === "multiple-choice" && (
                <MultipleChoiceMode
                    data={questions}
                    index={index}
                    onNext={() => next(questions.length)}
                />
            )}
        </div>
    )
}
