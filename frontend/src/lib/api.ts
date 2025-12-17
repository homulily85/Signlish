import { getAuth } from "./auth"

const API_BASE = "http://localhost:8000"

export async function apiFetch(
    url: string,
    options: RequestInit = {}
) {
    const auth = getAuth()

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    }

    if (auth?.token) {
        headers["Authorization"] = `Bearer ${auth.token}`
    }

    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
    })

    if (!res.ok) {
        throw new Error(await res.text())
    }

    return res.json()
}
