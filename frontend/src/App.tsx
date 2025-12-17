import "./App.css"
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import LoginPage from "@/pages/auth/Login"
import SignupPage from "./pages/auth/Register"
import Landing from "./components/landing/Landing"
import PasswordResetPage from "./pages/auth/PasswordReset"
import Error404 from "./components/errors/404"
import Error500 from "./components/errors/500"
import Error503 from "./components/errors/503"
import Error403 from "./components/errors/403"
import Error401 from "./components/errors/401"
import Footer from "@/components/common/Footer"
import { Navbar01 } from "@/components/common/Navbar"
import NavBar from "./features/navigation-menu"
import Dictionary from "./pages/Dictionary"
import TranslatePage from "./pages/Translate"
import Home from "./pages/Home"
import ExploreCourses from "./pages/ExploreCourses"
import PracticePage from "./pages/Practice"
import { AuthProvider } from "./context/AuthContext"

import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import React from "react"
import ProfilePage from "./pages/Setting"

function PrivateRoute({ element }: { element: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  if (loading) return null
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return element;
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Routes>
        {/* Nhóm các trang CÓ Navbar VÀ Footer */}
        <Route
          element={
            <>
              <NavBar />
              <main className="flex-1 pt-16">
                <Outlet />
              </main>
              <Footer />
            </>
          }
        >
          <Route path="/" element={<Landing />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/translate" element={<TranslatePage />} />
          <Route path="/practice" element={<PracticePage />} />
        </Route>

        {/* Nhóm các trang CÓ Navbar KHÔNG CÓ Footer */}
        <Route
          element={
            <>
              <NavBar />
              <main className="flex-1 pt-16">
                <Outlet />
              </main>
            </>
          }
        >
          <Route path="/settings" element={<ProfilePage />} />
          <Route path="/learn" element={<ExploreCourses />} />
          <Route path="/practice" element={<PracticePage />} />
          {/* <Route path="/home" element={<Home />} /> */}
          <Route path="/home" element={<PrivateRoute element={<Home />} />} />
          <Route path="500" element={<Error500 />} />
          <Route path="503" element={<Error503 />} />
          <Route path="403" element={<Error403 />} />
          <Route path="401" element={<Error401 />} />
          <Route path="*" element={<Error404 />} />
        </Route>

        {/* Nhóm các trang KHÔNG CÓ Navbar (Auth pages) */}
        <Route
          element={
            <main className="flex-1">
              <Outlet />
            </main>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/password_reset" element={<PasswordResetPage />} />
        </Route>
      </Routes>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
