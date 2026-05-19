import { Link } from "react-router-dom";
import { Article } from "../services/article.service";

interface ArticleCardProps {
  article: Article;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function excerpt(text: string, maxLen = 120) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

export function ArticleCard({ article, onDelete, canEdit }: ArticleCardProps) {
  return (
    <article className="group animate-slide-up rounded-2xl border border-ink-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-ink-400 font-mono">
          {article.author && <span>{article.author.name}</span>}
          {article.author && <span>·</span>}
          <time>{formatDate(article.createdAt)}</time>
        </div>
        {!article.published && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            Draft
          </span>
        )}
      </div>

      <Link to={`/articles/${article.id}`}>
        <h2 className="mb-2 font-display text-xl font-bold text-ink leading-snug transition group-hover:text-accent">
          {article.title}
        </h2>
      </Link>

      <p className="mb-4 text-sm text-ink-400 leading-relaxed">
        {excerpt(article.content)}
      </p>

      <div className="flex items-center justify-between">
        <Link
          to={`/articles/${article.id}`}
          className="text-sm font-medium text-accent transition hover:text-accent-hover"
        >
          Baca selengkapnya →
        </Link>

        {canEdit && (
          <div className="flex gap-2">
            <Link
              to={`/articles/${article.id}/edit`}
              className="rounded-lg border border-ink-100 px-3 py-1 text-xs font-medium text-ink-500 transition hover:border-ink hover:text-ink"
            >
              Edit
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(article.id)}
                className="rounded-lg border border-red-100 px-3 py-1 text-xs font-medium text-red-400 transition hover:border-red-300 hover:text-red-600"
              >
                Hapus
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
