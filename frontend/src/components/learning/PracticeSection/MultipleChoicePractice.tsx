"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

type Question = {
    id: number;
    video: string;
    answer: string;
    choices: string[];
};

type Props = {
    category: string;
    onBack: () => void;
    onComplete: () => void;
};

export default function MultipleChoicePractice({
    category,
    onBack,
    onComplete,
}: Props) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [index, setIndex] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const q = questions[index];

    /* ================= FETCH QUESTIONS ================= */
    useEffect(() => {
        setLoading(true);
        fetch(
            `http://localhost:8000/lessons/categories/${category}/questions`
        )
            .then((res) => res.json())
            .then((data) => {
                setQuestions(data);
                setIndex(0);
            })
            .finally(() => setLoading(false));
    }, [category]);

    /* ================= RESET WHEN QUESTION CHANGES ================= */
    useEffect(() => {
        setSelected(null);
    }, [index]);

    /* ================= NEXT / FINISH ================= */
    const next = async () => {
        if (!q || !selected) return;

        if (selected !== q.answer) {
            alert("Wrong answer, try again!");
            return;
        }

        if (index + 1 >= questions.length) {
            await fetch(
                `http://localhost:8000/lessons/categories/${category}/questions/complete`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: "test@example.com" }),
                }
            );
            onComplete();
        } else {
            setIndex((i) => i + 1);
        }
    };

    /* ================= LOADING ================= */
    if (loading || !q) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                Loading questions...
            </div>
        );
    }

    /* ================= UI ================= */
    return (
        <div className="max-w-xl mx-auto p-6 space-y-6">
            {/* ===== Back button ===== */}
            <Button variant="ghost" onClick={onBack}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            {/* ===== Progress ===== */}
            <div className="text-center text-muted-foreground">
                Question {index + 1} / {questions.length}
            </div>

            {/* ===== Question Card ===== */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        What's this sign?
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Video */}
                    <video
                        key={q.id}
                        src={q.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="mx-auto rounded-lg w-full max-w-md"
                    />

                    {/* Choices */}
                    <div className="grid grid-cols-2 gap-4">
                        {q.choices.map((choice) => {
                            const correct =
                                selected && choice === q.answer;
                            const wrong =
                                selected === choice &&
                                choice !== q.answer;

                            return (
                                <Button
                                    key={choice}
                                    size="lg"
                                    disabled={!!selected}
                                    onClick={() => setSelected(choice)}
                                    className={
                                        correct
                                            ? "bg-green-500 text-white"
                                            : wrong
                                                ? "bg-red-500 text-white"
                                                : ""
                                    }
                                >
                                    {choice}
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* ===== Next / Finish ===== */}
            {selected && (
                <div className="flex justify-center">
                    <Button onClick={next}>
                        {index + 1 < questions.length
                            ? "Next"
                            : "Finish"}
                    </Button>
                </div>
            )}
        </div>
    );
}
