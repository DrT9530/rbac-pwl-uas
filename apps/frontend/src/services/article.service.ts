import { http } from "./http";

export interface Article {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ArticlePayload {
  title: string;
  content: string;
  published?: boolean;
}

export const articleService = {
  getAll: () => http.get<Article[]>("/articles"),

  getById: (id: string) => http.get<Article>(`/articles/${id}`),

  create: (payload: ArticlePayload) =>
    http.post<Article>("/articles", payload),

  update: (id: string, payload: Partial<ArticlePayload>) =>
    http.put<Article>(`/articles/${id}`, payload),

  delete: (id: string) => http.delete<void>(`/articles/${id}`),
};
