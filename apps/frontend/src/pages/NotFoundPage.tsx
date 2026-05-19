import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center animate-fade-in">
      <div className="mb-4 font-mono text-8xl font-bold text-ink-100">404</div>
      <h1 className="font-display text-3xl font-bold text-ink">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mt-2 text-ink-400">
        Maaf, halaman yang kamu cari tidak ada.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
