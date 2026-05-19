import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";

interface RegisterPageProps {
  onLogin: () => void;
}

export function RegisterPage({ onLogin }: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.register({ name, email, password });
      authService.saveSession(res);
      onLogin();
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold text-ink">Daftar</h1>
          <p className="mt-2 text-ink-400">Buat akun baru untuk mulai menulis</p>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Nama
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nama lengkap"
                className="w-full rounded-xl border border-ink-100 bg-cream px-4 py-3 text-sm text-ink placeholder-ink-300 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="kamu@email.com"
                className="w-full rounded-xl border border-ink-100 bg-cream px-4 py-3 text-sm text-ink placeholder-ink-300 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min. 6 karakter"
                className="w-full rounded-xl border border-ink-100 bg-cream px-4 py-3 text-sm text-ink placeholder-ink-300 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? "Memproses…" : "Buat Akun"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-400">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-medium text-accent hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
