// components/practice/modes/FlashcardPractice.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import type { VocabularyWord } from "@/types/lesson";

type Props = {
    category: string;
    words?: VocabularyWord[]; // optional nếu fetch từ API
    onBack: () => void;
    onComplete: () => void;
};

export default function FlashcardPractice({
    category,
    words,
    onBack,
    onComplete,
}: Props) {
    const [cards, setCards] = useState<VocabularyWord[]>(words ?? []);
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [loading, setLoading] = useState(true);

    const email = "test@example.com"; // TODO: lấy từ auth context

    /* ---------------- fetch flashcards ---------------- */
    useEffect(() => {
        if (words?.length) {
            setLoading(false);
            return;
        }

        fetch(`/api/lessons/${category}/flashcards`)
            .then(res => res.json())
            .then(setCards)
            .finally(() => setLoading(false));
    }, [category, words]);

    /* ---------------- mark completed ---------------- */
    const completeWord = async (wordId: number) => {
        await fetch(
            `/api/lessons/user/progress/complete?email=${email}&category=${category}&word_id=${wordId}`,
            { method: "POST" }
        );
    };

    /* ---------------- next card ---------------- */
    const next = async () => {
        await completeWord(cards[index].id);
        setFlipped(false);

        if (index + 1 >= cards.length) {
            onComplete();
        } else {
            setIndex(i => i + 1);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading flashcards...</div>;
    }

    const card = cards[index];

    return (
        <div className="max-w-xl mx-auto p-6 space-y-6">
            <Button variant="ghost" onClick={onBack}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <div className="text-center text-muted-foreground">
                Card {index + 1} / {cards.length}
            </div>

            {/* Flashcard */}
            <motion.div
                onClick={() => setFlipped(f => !f)}
                whileTap={{ scale: 0.97 }}
                className="cursor-pointer"
            >
                <Card className="h-64 flex items-center justify-center text-3xl font-bold">
                    <CardContent>
                        {flipped ? card.definition : card.word}
                    </CardContent>
                </Card>
            </motion.div>

            <div className="flex justify-between">
                <Button variant="outline" onClick={() => setFlipped(f => !f)}>
                    Flip
                </Button>
                <Button onClick={next}>
                    {index + 1 === cards.length ? "Finish" : "Next"}
                </Button>
            </div>
        </div>
    );
}
