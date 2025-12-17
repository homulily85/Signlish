// hooks/useTopic.ts
import { useEffect, useState } from "react";

export type Lesson = {
    id: number;
    word: string;
    definition: string;
    instruction?: string;
    source?: string;
};

export type TopicData = {
    id: string;
    title: string;
    lessons: Lesson[];
};

export function useTopic(topicSlug: string, email: string) {
    const [topic, setTopic] = useState<TopicData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTopic() {
            try {
                // 1. Lấy lessons theo category
                const res = await fetch(`http://localhost:8000/lessons/${topicSlug}`);
                if (!res.ok) throw new Error("Topic not found");
                const lessons = await res.json(); // array of Lesson

                setTopic({
                    id: topicSlug,
                    title: topicSlug.charAt(0).toUpperCase() + topicSlug.slice(1),
                    lessons,
                });

                setLoading(false);
            } catch (err) {
                console.error(err);
                setTopic(null);
                setLoading(false);
            }
        }

        fetchTopic();
    }, [topicSlug]);

    return { topic, loading };
}
