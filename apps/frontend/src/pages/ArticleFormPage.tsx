import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toast } from "../components/Toast";
import { articleService, ArticlePayload } from "../services/article.service";

interface ArticleFormPageProps {
  mode: "create" | "edit";
}

export function ArticleFormPage({ mode }: ArticleFormPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === "edit");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      articleService
        .getById(id)
        .then((a) => {
          setTitle(a.title);
          setContent(a.content);
          setPublished(a.published);
        })
        .catch(() => navigate("/"))
        .finally(() => setFetching(false));
    }
  }, [mode, id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    const payload: ArticlePayload = { title, content, published };

    try {
      if (mode === "create") {
        const created = await articleService.create(payload);
        navigate(`/articles/${created.id}`);
      } else if (id) {
        await articleService.update(id, payload);
        setToast({ message: "Artikel diperbarui!", type: "success" });
        setTimeout(() => navigate(`/articles/${id}`), 1000);
      }
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : "Gagal menyimpan",
        type: "error",
      });
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 animate-pulse space-y-4">
        <div className="h-8 w-1/2 rounded-xl bg-ink-50" />
        <div className="h-12 rounded-xl bg-ink-50" />
        <div className="h-64 rounded-xl bg-ink-50" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 animate-fade-in">
      <h1 className="mb-8 font-display text-4xl font-bold text-ink">
        {mode === "create" ? "Tulis Artikel Baru" : "Edit Artikel"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Judul
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Judul artikel yang menarik..."
            className="w-full rounded-xl border border-ink-100 bg-white px-4 py-3 font-display text-lg text-ink placeholder-ink-300 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Konten
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={14}
            placeholder="Tulis isi artikelmu di sini..."
            className="w-full resize-none rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm text-ink placeholder-ink-300 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10 leading-relaxed"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={published}
            onClick={() => setPublished((p) => !p)}
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
              published ? "bg-accent" : "bg-ink-200"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                published ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-ink">
            {published ? "Dipublikasikan" : "Simpan sebagai Draft"}
          </span>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
          >
            {loading
              ? "Menyimpan…"
              : mode === "create"
              ? "Publikasikan"
              : "Simpan Perubahan"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-ink-100 px-6 py-3 text-sm font-medium text-ink-500 transition hover:bg-ink-50"
          >
            Batal
          </button>
        </div>
      </form>

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
