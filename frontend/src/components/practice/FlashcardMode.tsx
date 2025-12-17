// components/practice/FlashcardMode.tsx

import type { Lesson } from "@/types/type"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export default function FlashcardMode({
    data,
    index,
    onNext,
}: {
    data: Lesson[]
    index: number
    onNext: () => void
}) {
    const [flipped, setFlipped] = useState(false)
    const lesson = data[index]

    return (
        <div className="space-y-6">
            <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: "preserve-3d" }}
                onClick={() => setFlipped(!flipped)}
            >
                <Card className="min-h-[500px] cursor-pointer">
                    <AnimatePresence mode="wait">
                        {!flipped ? (
                            <div style={{ backfaceVisibility: "hidden" }}>
                                <CardHeader>
                                    <CardTitle className="text-center text-2xl">
                                        What's this sign?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex justify-center">
                                    <video src={lesson.source} controls className="rounded-lg" />
                                </CardContent>
                            </div>
                        ) : (
                            <div
                                style={{
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                }}
                            >
                                <CardContent className="text-center py-20">
                                    <h2 className="text-5xl font-bold">{lesson.word}</h2>
                                    <p className="mt-4 text-muted-foreground">
                                        {lesson.instruction}
                                    </p>
                                </CardContent>
                            </div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>

            <div className="flex justify-center">
                <Button onClick={onNext}>Next</Button>
            </div>
        </div>
    )
}
