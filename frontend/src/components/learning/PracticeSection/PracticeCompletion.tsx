// components/practice/PracticeCompletion.tsx
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

type Props = {
    totalWords: number;
    topicTitle: string;
    onRetry: () => void;
    onBack?: () => void;
};

export default function PracticeCompletion({
    totalWords,
    topicTitle,
    onRetry,
    onBack,
}: Props) {
    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                <Card className="max-w-md text-center">
                    <CardHeader>
                        <Trophy className="w-20 h-20 mx-auto text-yellow-500" />
                        <CardTitle className="text-3xl">Congratulations!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            You’ve completed {totalWords} words from{" "}
                            <strong>{topicTitle}</strong>
                        </p>
                        <Button onClick={onRetry}>Practice Again</Button>
                        {onBack && (
                            <Button variant="outline" onClick={onBack}>
                                Back to Lessons
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
