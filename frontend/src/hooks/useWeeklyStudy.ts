import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { getAuth } from "@/lib/auth"

export function useWeeklyStudy() {
    const [data, setData] = useState<any[]>([])
    const [summary, setSummary] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const auth = getAuth()
        if (!auth) return

        apiFetch("/dashboard/weekly-study")
            .then(res => {
                setData(res.data)
                setSummary(res)
            })
            .finally(() => setLoading(false))
    }, [])

    return { data, summary, loading }
}
