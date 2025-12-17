// components/practice/PracticeMenu.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { BookOpen, Grid3x3, Camera } from "lucide-react"
import type { PracticeMode } from "@/types/type"

export default function PracticeMenu({
    onSelect,
}: {
    onSelect: (mode: PracticeMode) => void
}) {
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Practice Mode</h1>
                    <p className="text-muted-foreground text-lg">
                        Choose your learning style
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Card
                            className="cursor-pointer h-full"
                            onClick={() => onSelect("flashcard")}
                        >
                            <CardHeader>
                                <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
                                <CardTitle className="text-2xl">Flashcard Mode</CardTitle>
                            </CardHeader>
                            <CardContent>
                                Memorize signs by flipping cards
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Card
                            className="cursor-pointer h-full"
                            onClick={() => onSelect("multiple-choice")}
                        >
                            <CardHeader>
                                <Grid3x3 className="w-12 h-12 text-green-600 mb-4" />
                                <CardTitle className="text-2xl">Multiple Choice</CardTitle>
                            </CardHeader>
                            <CardContent>
                                Choose correct word from options
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Card
                            className="cursor-pointer h-full"
                            onClick={() => onSelect("vision")}
                        >
                            <CardHeader>
                                <Camera className="w-12 h-12 text-purple-600 mb-4" />
                                <CardTitle className="text-2xl">Vision Mode</CardTitle>
                            </CardHeader>
                            <CardContent>
                                Practice with webcam (demo)
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
