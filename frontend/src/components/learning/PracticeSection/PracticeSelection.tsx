// components/practice/PracticeSelection.tsx
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Grid3x3, Camera, ChevronLeft } from "lucide-react";

type Props = {
    topicTitle: string;
    totalWords: number;
    onBack?: () => void;
    onSelect: (mode: "flashcard" | "multiple-choice" | "vision") => void;
};

export default function PracticeSelection({ topicTitle, totalWords, onBack, onSelect }: Props) {
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {onBack && (
                <Button variant="ghost" onClick={onBack}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Lessons
                </Button>
            )}

            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold text-foreground">Practice Time!</h1>
                <p className="text-muted-foreground text-lg">
                    Choose how you want to practice {totalWords} words from <span className="font-semibold">{topicTitle}</span>
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Flashcard */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card
                        className="cursor-pointer h-full hover:shadow-xl transition-shadow border-2 hover:border-blue-400"
                        onClick={() => onSelect("flashcard")}
                    >
                        <CardHeader className="space-y-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-center">Flashcard Mode</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-center">
                                Watch signs and flip cards to reveal meanings. Perfect for memorization!
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Multiple Choice */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card
                        className="cursor-pointer h-full hover:shadow-xl transition-shadow border-2 hover:border-green-400"
                        onClick={() => onSelect("multiple-choice")}
                    >
                        <CardHeader className="space-y-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                    <Grid3x3 className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-center">Multiple Choice</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-center">
                                Test your knowledge by identifying signs from multiple options.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Vision */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card
                        className="cursor-pointer h-full hover:shadow-xl transition-shadow border-2 hover:border-purple-400"
                        onClick={() => onSelect("vision")}
                    >
                        <CardHeader className="space-y-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                    <Camera className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-center">Vision Mode</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-center">
                                Practice signs with your webcam and get real-time feedback!
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
