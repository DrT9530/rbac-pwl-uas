import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Toast } from "../components/Toast";
import { articleService, Article } from "../services/article.service";
import { authService } from "../services/auth.service";

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const user = authService.getUser();
  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";

  useEffect(() => {
    if (!id) return;
    articleService
      .getById(id)
      .then(setArticle)
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!article || !confirm("Yakin ingin menghapus artikel ini?")) return;
    try {
      await articleService.delete(article.id);
      setToast({ message: "Artikel dihapus", type: "success" });
      setTimeout(() => navigate("/"), 1000);
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : "Gagal menghapus",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-3/4 rounded-xl bg-ink-50" />
          <div className="h-4 w-1/3 rounded-lg bg-ink-50" />
          <div className="mt-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 rounded-lg bg-ink-50" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 animate-fade-in">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-ink-400 transition hover:text-ink"
      >
        ← Kembali
      </Link>

      <div className="mb-2 flex items-center gap-3">
        {!article.published && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            Draft
          </span>
        )}
        {article.author && (
          <span className="text-xs font-mono text-ink-400">
            oleh {article.author.name}
          </span>
        )}
        <span className="text-xs text-ink-300">·</span>
        <time className="text-xs font-mono text-ink-400">
          {new Date(article.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </div>

      <h1 className="mb-8 font-display text-4xl font-bold text-ink leading-tight">
        {article.title}
      </h1>

      <div className="mb-8 h-px bg-ink-100" />

      <div className="prose-custom whitespace-pre-wrap text-ink-700 leading-relaxed text-[1.05rem]">
        {article.content}
      </div>

      {canEdit && (
        <div className="mt-12 flex gap-3 border-t border-ink-100 pt-8">
          <Link
            to={`/articles/${article.id}/edit`}
            className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-white"
          >
            Edit Artikel
          </Link>
          <button
            onClick={handleDelete}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500 hover:text-white"
          >
            Hapus Artikel
          </button>
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
