import type { Question } from "@/types/type"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function MultipleChoiceMode({
    data,
    index,
    onNext,
}: {
    data: Question[]
    index: number
    onNext: () => void
}) {
    const q = data[index]
    const [selected, setSelected] = useState<string | null>(null)

    // 🔥 RESET khi sang câu mới
    useEffect(() => {
        setSelected(null)
    }, [index])

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        What's this sign?
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <video
                        key={q.id}
                        src={q.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="mx-auto rounded-lg w-full max-w-md"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        {q.choices.map((c) => {
                            const correct = selected && c === q.answer
                            const wrong = selected === c && c !== q.answer

                            return (
                                <Button
                                    key={c}
                                    size="lg"
                                    disabled={!!selected}
                                    onClick={() => setSelected(c)}
                                    className={
                                        correct
                                            ? "bg-green-500 text-white"
                                            : wrong
                                                ? "bg-red-500 text-white"
                                                : ""
                                    }
                                >
                                    {c}
                                </Button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {selected && (
                <div className="flex justify-center">
                    <Button onClick={onNext}>Next</Button>
                </div>
            )}
        </div>
    )
}
