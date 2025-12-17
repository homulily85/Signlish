// components/practice/api.ts

import type { Lesson, Question } from "@/types/type"

const API_BASE = "http://localhost:8000"

export async function fetchFlashcards(): Promise<Lesson[]> {
    const res = await fetch(`${API_BASE}/practice/flashcards`)
    if (!res.ok) throw new Error("Failed to load flashcards")
    return res.json()
}

export async function fetchQuestions(): Promise<Question[]> {
    const res = await fetch(`${API_BASE}/practice/question`)
    if (!res.ok) throw new Error("Failed to load questions")
    return res.json()
}
