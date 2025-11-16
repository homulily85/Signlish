import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";

export default function AppRoutes() {
    const [user, setUser] = useState(null);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing user={user} />} />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register setUser={setUser} />} />
            </Routes>
        </BrowserRouter>
    );
}
