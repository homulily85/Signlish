import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

export function useLessonProgress() {
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        apiFetch("/dashboard/lesson-progress")
            .then(setData)
    }, [])

    return data
}
