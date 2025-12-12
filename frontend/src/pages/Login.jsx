import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:8000/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Login failed");

            // Lưu token vào localStorage
            localStorage.setItem("token", data.token);
            console.log("Login successful:", data);
            // Cập nhật user state
            setUser({ name: data.user.name, email: data.user.email });

            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <form className="max-w-md mx-auto mt-10" onSubmit={handleLogin}>
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <input
                className="border p-2 w-full mb-3"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <input
                className="border p-2 w-full mb-3"
                placeholder="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
                Login
            </button>
        </form>
    );
}
