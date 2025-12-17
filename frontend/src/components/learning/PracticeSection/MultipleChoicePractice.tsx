// components/practice/modes/MultipleChoicePractice.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    const [question, setQuestion] = useState<Question | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);

    const email = "test@example.com"; // TODO: auth context

    /* ---------------- fetch question ---------------- */
    useEffect(() => {
        fetch(`/api/lessons/${category}/question`)
            .then(res => res.json())
            .then(setQuestion);
    }, [category]);

    /* ---------------- submit ---------------- */
    const submit = async () => {
        if (!question || !selected) return;

        setChecking(true);

        if (selected === question.answer) {
            await fetch(
                `/api/lessons/${category}/question/complete?email=${email}`,
                { method: "POST" }
            );
            onComplete();
        } else {
            alert("Wrong answer, try again!");
        }

        setChecking(false);
    };

    if (!question) {
        return <div className="p-6 text-center">Loading question...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <Button variant="ghost" onClick={onBack}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            {/* Video */}
            <Card>
                <CardContent className="p-4">
                    <video
                        src={question.video}
                        controls
                        className="w-full rounded"
                    />
                </CardContent>
            </Card>

            {/* Choices */}
            <div className="grid gap-3">
                {question.choices.map(choice => (
                    <Button
                        key={choice}
                        variant={selected === choice ? "default" : "outline"}
                        onClick={() => setSelected(choice)}
                    >
                        {choice}
                    </Button>
                ))}
            </div>

            <Button
                disabled={!selected || checking}
                onClick={submit}
                size="lg"
            >
                Submit
            </Button>
        </div>
    );
}
