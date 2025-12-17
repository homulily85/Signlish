import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

export function useStreak() {
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        apiFetch("/dashboard/streak")
            .then(setData)
    }, [])

    return data
}
