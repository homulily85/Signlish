import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

export function useWeeklySigns() {
    const [data, setData] = useState<any[]>([])
    const [summary, setSummary] = useState<any>(null)

    useEffect(() => {
        apiFetch("/dashboard/weekly-signs")
            .then(res => {
                setData(res.data)
                setSummary(res)
            })
    }, [])

    return { data, summary }
}
