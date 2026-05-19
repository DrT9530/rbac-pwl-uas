import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ArticleDetailPage } from "./pages/ArticleDetailPage";
import { ArticleFormPage } from "./pages/ArticleFormPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RegisterPage } from "./pages/RegisterPage";
import { authService } from "./services/auth.service";

export default function App() {
  // trigger re-render on login/logout to update Navbar
  const [, setAuthVersion] = useState(0);

  const handleAuthChange = () => setAuthVersion((v) => v + 1);

  const isLoggedIn = authService.isLoggedIn();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream">
        <Navbar onLogout={handleAuthChange} />

        <main>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                isLoggedIn ? (
                  <HomePage />
                ) : (
                  <LoginPage onLogin={handleAuthChange} />
                )
              }
            />
            <Route
              path="/register"
              element={
                isLoggedIn ? (
                  <HomePage />
                ) : (
                  <RegisterPage onLogin={handleAuthChange} />
                )
              }
            />

            {/* Article detail - public */}
            <Route path="/articles/:id" element={<ArticleDetailPage />} />

            {/* Protected - ADMIN & EDITOR only */}
            <Route
              path="/articles/create"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "EDITOR"]}>
                  <ArticleFormPage mode="create" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/articles/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "EDITOR"]}>
                  <ArticleFormPage mode="edit" />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <footer className="mt-16 border-t border-ink-100 py-8 text-center text-xs text-ink-300 font-mono">
          ArtikelKu © {new Date().getFullYear()} — RBAC PWL UAS
        </footer>
      </div>
    </BrowserRouter>
  );
}
