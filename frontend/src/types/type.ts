export type DictionaryItem = {
    id: string;
    word: string;
    definition: string;
    instruction: string;
    source: string;
    category: string;
}

export interface Lesson {
    id: number
    word: string
    instruction: string
    source?: string
    category: string
}

export interface Question {
    id: number
    video: string
    answer: string
    choices: string[]
    category: string
}

export type PracticeMode =
    | "selection"
    | "flashcard"
    | "multiple-choice"
    | "vision"
    | "completion"
