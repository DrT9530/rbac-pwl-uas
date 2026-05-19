import { useEffect, useState } from "react";
import { ArticleCard } from "../components/ArticleCard";
import { Toast } from "../components/Toast";
import { articleService, Article } from "../services/article.service";
import { authService } from "../services/auth.service";

export function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const user = authService.getUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await articleService.getAll();
      setArticles(data);
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : "Gagal memuat artikel",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus artikel ini?")) return;
    try {
      await articleService.delete(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setToast({ message: "Artikel berhasil dihapus", type: "success" });
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : "Gagal menghapus",
        type: "error",
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Hero */}
      <div className="mb-12 animate-fade-in">
        <h1 className="font-display text-5xl font-bold text-ink leading-tight">
          Semua <em>Artikel</em>
        </h1>
        <p className="mt-3 text-ink-400">
          {articles.length} artikel tersedia · Bacaan pilihan hari ini
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-ink-50"
            />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 text-5xl">📄</div>
          <h2 className="font-display text-2xl font-bold text-ink">
            Belum ada artikel
          </h2>
          <p className="mt-2 text-ink-400">
            {canEdit
              ? "Mulai tulis artikel pertamamu!"
              : "Artikel akan segera hadir."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              canEdit={canEdit}
              onDelete={canEdit ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
