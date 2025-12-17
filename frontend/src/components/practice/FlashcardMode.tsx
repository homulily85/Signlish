import type { Lesson } from "@/types/type"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
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
            {/* Card container */}
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
                    {/* FRONT */}
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
                                src={lesson.source}
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

                    {/* BACK */}
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

            <div className="flex justify-center">
                <Button onClick={onNext}>Next</Button>
            </div>
        </div>
    )
}
