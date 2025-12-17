export function getAuth() {
    if (typeof window === "undefined") return null

    const rawUser = localStorage.getItem("user")
    const token = localStorage.getItem("access_token")

    if (!rawUser || !token) return null

    return {
        user: JSON.parse(rawUser),
        token,
    }
}
