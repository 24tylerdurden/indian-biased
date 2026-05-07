import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { articleApi, type Article } from '@/lib/api-articles';
import { Newspaper, Clock, ArrowRight, RefreshCw } from 'lucide-react';

const CATEGORIES = ['All', 'Politics', 'Economy', 'Society', 'World', 'Opinion'];

const ArticleRow = ({ article, index }: { article: Article; index: number }) => {
  const isFeature = index === 0;

  if (isFeature) {
    return (
      <Link to={`/articles/${article.slug}`} className="block group">
        <div className="grid md:grid-cols-3 border border-gray-900 bg-white hover:bg-gray-50 transition-colors duration-200">
          {/* Big number */}
          <div className="hidden md:flex items-center justify-center border-r border-gray-900 py-10 px-8">
            <span
              className="text-[8rem] font-black text-gray-100 leading-none select-none group-hover:text-gray-200 transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              01
            </span>
          </div>

          {/* Content */}
          <div className="md:col-span-2 p-8 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-white bg-gray-900 px-2.5 py-1">
                  Featured
                </span>
                {article.categoryType && (
                  <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-gray-500">
                    {article.categoryType}
                  </span>
                )}
              </div>
              <h2
                className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4 group-hover:underline decoration-2 underline-offset-4"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {article.topic}
              </h2>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {new Date(article.published_at || article.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold border border-red-500 text-red-600 px-2 py-0.5 rounded-sm">LEFT</span>
                  <span className="text-[10px] font-bold border border-blue-600 text-blue-700 px-2 py-0.5 rounded-sm">RIGHT</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5 group-hover:gap-3 transition-all duration-200">
                Read both sides <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/articles/${article.slug}`} className="block group">
      <div className="flex items-stretch border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-150 py-5 px-6 gap-6">
        {/* Index number */}
        <div className="flex-shrink-0 w-10 flex items-start pt-1">
          <span
            className="text-xl font-black text-gray-200 leading-none"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200 flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between gap-3">
          <div>
            {article.categoryType && (
              <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-gray-400 block mb-1.5">
                {article.categoryType}
              </span>
            )}
            <h3
              className="text-lg font-bold text-gray-900 leading-snug group-hover:underline decoration-1 underline-offset-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {article.topic}
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {new Date(article.published_at || article.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
            <div className="flex gap-2 items-center">
              <span className="text-[9px] font-bold text-red-500">L</span>
              <span className="text-gray-300 text-xs">|</span>
              <span className="text-[9px] font-bold text-blue-600">R</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 flex items-center self-center">
          <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>
    </Link>
  );
};

export const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await articleApi.getArticles({ status: 'published', limit: 50 });
      setArticles(data.articles);
    } catch (err: any) {
      setError('Failed to load articles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeCategory === 'All'
    ? articles
    : articles.filter(a => a.categoryType?.toLowerCase() === activeCategory.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f2] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400">Loading stories…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f7f2] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-sm">{error}</p>
          <Button
            onClick={fetchArticles}
            variant="outline"
            className="rounded-none border-gray-900 text-xs tracking-widest uppercase font-bold"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f2]">

      {/* Page header */}
      <div className="border-b border-gray-900 bg-[#f8f7f2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[9px] tracking-[0.4em] uppercase font-bold text-gray-400 mb-2">
                Biased India
              </p>
              <h1
                className="text-4xl sm:text-5xl font-black text-gray-900 leading-none"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                All Stories
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">
                {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
              </p>
              <p className="text-[9px] tracking-widest uppercase text-gray-300">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0 overflow-x-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  px-4 py-2.5 text-[10px] uppercase tracking-[0.25em] font-bold whitespace-nowrap border-b-2 transition-colors duration-150
                  ${activeCategory === cat
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-700'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Newspaper className="h-10 w-10 text-gray-200 mb-4" />
            <p className="text-sm text-gray-400">No stories found in this category</p>
            <button
              onClick={() => setActiveCategory('All')}
              className="mt-3 text-xs underline text-gray-400 hover:text-gray-700"
            >
              View all stories
            </button>
          </div>
        ) : (
          <div>
            {/* Featured article */}
            <div className="mb-0">
              <ArticleRow article={filtered[0]} index={0} />
            </div>

            {/* Divider */}
            {filtered.length > 1 && (
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-[9px] tracking-[0.35em] uppercase font-bold text-gray-400">
                  More Stories
                </span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>
            )}

            {/* Rest of articles */}
            {filtered.length > 1 && (
              <div className="border border-gray-200 border-b-0">
                {filtered.slice(1).map((article, i) => (
                  <ArticleRow key={article.id} article={article} index={i + 1} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom legend */}
        {filtered.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-400">
            <span className="tracking-widest uppercase">Each story includes</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                Left perspective
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                Right perspective
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};