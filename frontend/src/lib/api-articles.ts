import api from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Perspective {
  id: string;
  article_id: string;
  lean: 'left' | 'right' | 'center' | 'neutral';
  lean_score?: number;
  headline: string;
  summary: string;
  body?: string;
  source_name?: string;
  source_url?: string;
  sentiment?: string;
  created_at: string;
}

export interface Article {
  id: string;
  slug: string;
  original_url?: string;
  topic: string;
  category_id?: string;
  status: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ArticleWithPerspectives extends Article {
  category?: Category;
  perspectives: Perspective[];
}

export const articleApi = {
  getArticles: async (params?: {
    status?: string;
    category_id?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get<{ articles: Article[]; count: number }>('/articles', { params });
    return response.data;
  },

  getArticleBySlug: async (slug: string) => {
    const response = await api.get<ArticleWithPerspectives>(`/articles/${slug}`);
    return response.data;
  },

  createArticle: async (data: {
    slug: string;
    original_url?: string;
    topic: string;
    category_id?: string;
    status?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }) => {
    const response = await api.post<Article>('/articles', data);
    return response.data;
  },

  publishArticle: async (id: string) => {
    const response = await api.post(`/articles/${id}/publish`);
    return response.data;
  },

  createPerspective: async (data: {
    article_id: string;
    lean: string;
    lean_score?: number;
    headline: string;
    summary: string;
    body?: string;
    source_name?: string;
    source_url?: string;
    sentiment?: string;
  }) => {
    const response = await api.post<Perspective>('/perspectives', data);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },
};
