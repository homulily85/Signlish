// hooks/useTopics.ts
import { useEffect, useState } from "react";

export type Topic = {
    id: string;
    title: string;
    image: string;
    lessons: number;
    progress?: number;
    hours?: number;
};

export function useTopics(email: string) {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Lấy danh sách category
                const resCategories = await fetch("http://localhost:8000/lessons/");
                const categories: string[] = await resCategories.json();

                // 2. Lấy progress user
                const resProgress = await fetch(`http://localhost:8000/lessons/users/${email}/progress`);

                const progressData = await resProgress.json();

                // 3. Tạo topic array
                const topicsData = categories.map((cat) => {
                    const progress = progressData[cat];
                    const completed = progress?.completed ?? 0;
                    const total = progress?.total ?? 0;
                    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                    return {
                        id: cat,
                        title: cat.charAt(0).toUpperCase() + cat.slice(1), // capitalize
                        image: `/images/${cat}.jpg`, // bạn tự map image
                        lessons: total,
                        progress: percentage,
                        hours: Math.round(total * 0.1), // ví dụ 0.1h mỗi lesson
                    };
                });

                setTopics(topicsData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        }

        fetchData();
    }, [email]);

    return { topics, loading };
}
