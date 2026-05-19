import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";

interface NavbarProps {
  onLogout: () => void;
}

export function Navbar({ onLogout }: NavbarProps) {
  const user = authService.getUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    onLogout();
    navigate("/login");
  };

  const roleBadgeColor: Record<string, string> = {
    ADMIN: "bg-accent text-white",
    EDITOR: "bg-ink-600 text-white",
    USER: "bg-ink-200 text-ink-800",
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-ink-100 bg-cream/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="font-display text-2xl font-bold text-ink tracking-tight"
        >
          Artikel<span className="text-accent">Ku</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden text-sm text-ink-400 sm:block">
                Hai, <strong className="text-ink">{user.name}</strong>
              </span>
              {user.role && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-semibold uppercase tracking-widest ${
                    roleBadgeColor[user.role] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {user.role}
                </span>
              )}
              {(user.role === "ADMIN" || user.role === "EDITOR") && (
                <Link
                  to="/articles/create"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
                >
                  + Tulis
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-ink-400 transition hover:text-ink"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-ink-500 transition hover:text-ink"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
