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
    const [questions, setQuestions] = useState<Question[]>([]); // Lưu tất cả câu hỏi
    const [selected, setSelected] = useState<string | null>(null); // Câu trả lời được chọn
    const [index, setIndex] = useState<number>(0); // Chỉ số câu hỏi hiện tại
    const [checking, setChecking] = useState(false); // Cờ kiểm tra câu trả lời

    // Fetch câu hỏi từ API
    useEffect(() => {
        fetch(`http://localhost:8000/lessons/categories/${category}/questions`)
            .then((res) => res.json())
            .then(setQuestions);
    }, [category]);

    // Reset khi chuyển sang câu hỏi tiếp theo
    useEffect(() => {
        setSelected(null);
    }, [index]);

    const q = questions[index]; // Câu hỏi hiện tại

    // Hàm để kiểm tra câu trả lời
    const submit = async () => {
        if (!q || !selected) return;

        setChecking(true);

        // Kiểm tra câu trả lời
        if (selected === q.answer) {
            // Gửi thông tin hoàn thành bài kiểm tra
            await fetch(`http://localhost:8000/lessons/categories/${category}/questions/complete`, {
                method: "POST",
                body: JSON.stringify({ email: "test@example.com" }), // Cần gửi email của người dùng
            });
            onComplete(); // Kết thúc bài tập
        } else {
            alert("Wrong answer, try again!"); // Nếu trả lời sai
        }

        setChecking(false);
    };

    // Nếu chưa có câu hỏi, hiển thị loading
    if (questions.length === 0) {
        return <div className="p-6 text-center">Loading questions...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Hiển thị video câu hỏi */}
            <Card>
                <CardContent>
                    <video
                        key={q.id}
                        src={q.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="mx-auto rounded-lg w-full max-w-md"
                    />
                </CardContent>
            </Card>

            {/* Hiển thị các lựa chọn câu trả lời */}
            <div className="grid grid-cols-2 gap-4">
                {q.choices.map((choice) => {
                    const correct = selected && choice === q.answer;
                    const wrong = selected === choice && choice !== q.answer;

                    return (
                        <Button
                            key={choice}
                            size="lg"
                            disabled={!!selected} // Vô hiệu hóa khi đã chọn đáp án
                            onClick={() => setSelected(choice)}
                            className={
                                correct ? "bg-green-500 text-white" : wrong ? "bg-red-500 text-white" : ""
                            }
                        >
                            {choice}
                        </Button>
                    );
                })}
            </div>

            {/* Nút Next hoặc Finish */}
            {selected && (
                <div className="flex justify-center">
                    <Button
                        disabled={checking}
                        onClick={() => {
                            if (index + 1 < questions.length) {
                                setIndex(index + 1); // Chuyển sang câu hỏi tiếp theo
                            } else {
                                onComplete(); // Hoàn thành bài kiểm tra khi hết câu hỏi
                            }
                        }}
                    >
                        {index + 1 < questions.length ? "Next" : "Finish"}
                    </Button>
                </div>
            )}
        </div>
    );
}
