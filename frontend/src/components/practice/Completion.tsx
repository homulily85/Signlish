// components/practice/Completion.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Completion({ onBack }: { onBack: () => void }) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="text-center max-w-md">
                <CardHeader>
                    <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
                    <CardTitle className="text-3xl">Congratulations!</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={onBack}>Back to Menu</Button>
                </CardContent>
            </Card>
        </div>
    )
}
