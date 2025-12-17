// components/practice/modes/FlashcardPractice.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import type { Lesson } from "@/types/type"; // Import kiểu Lesson

type Props = {
    category: string;
    words?: Lesson[]; // Đảm bảo sử dụng kiểu Lesson
    onBack: () => void;
    onComplete: () => void;
};

export default function FlashcardPractice({
    category,
    words,
    onBack,
    onComplete,
}: Props) {
    const [cards, setCards] = useState<Lesson[]>(words ?? []); // Dữ liệu flashcard
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [loading, setLoading] = useState(true);

    const email = "test@example.com"; // TODO: lấy từ auth context

    // Lấy dữ liệu flashcards nếu chưa có từ props
    useEffect(() => {
        if (words?.length) {
            setLoading(false);
            return;
        }

        fetch(`/api/lessons/categories/${category}/flashcards`)
            .then((res) => res.json())
            .then(setCards)
            .finally(() => setLoading(false));
    }, [category, words]);

    // Xử lý chuyển sang thẻ tiếp theo
    const next = () => {
        setFlipped(false);
        if (index + 1 >= cards.length) {
            onComplete();
        } else {
            setIndex((i) => i + 1);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading flashcards...</div>;
    }

    const lesson = cards[index]; // Thẻ flashcard hiện tại

    return (
        <div className="max-w-xl mx-auto p-6 space-y-6">
            <Button variant="ghost" onClick={onBack}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <div className="text-center text-muted-foreground">
                Card {index + 1} / {cards.length}
            </div>

            {/* Card container with flip effect */}
            <div
                className="relative w-full h-[520px] perspective-1000"
                onClick={() => setFlipped(!flipped)}
            >
                <motion.div
                    className="relative w-full h-full"
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {/* FRONT (video) */}
                    <Card
                        className="absolute inset-0 flex flex-col"
                        style={{ backfaceVisibility: "hidden" }}
                    >
                        <CardHeader>
                            <CardTitle className="text-center text-2xl">
                                What's this sign?
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 flex items-center justify-center">
                            <video
                                key={lesson.id}
                                src={lesson.source} // Lấy video từ source
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="rounded-lg w-full max-w-md"
                            />
                        </CardContent>

                        <div className="p-4 text-center text-muted-foreground">
                            Click to reveal answer
                        </div>
                    </Card>

                    {/* BACK (information) */}
                    <Card
                        className="absolute inset-0 flex flex-col justify-center"
                        style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                        }}
                    >
                        <CardContent className="text-center space-y-6">
                            <h2 className="text-5xl font-bold">{lesson.word}</h2>
                            <p className="text-xl text-muted-foreground max-w-md mx-auto">
                                {lesson.instruction}
                            </p>
                        </CardContent>

                        <div className="p-4 text-center text-muted-foreground">
                            Click to flip back
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Next Button */}
            <div className="flex justify-center">
                <Button onClick={next}>Next</Button>
            </div>
        </div>
    );
}
