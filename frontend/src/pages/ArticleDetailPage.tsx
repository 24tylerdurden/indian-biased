import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { articleApi, type ArticleWithPerspectives, type Perspective } from '@/lib/api-articles';
import { ArrowLeft, Clock, ExternalLink, Scale, ChevronRight } from 'lucide-react';

const sanitizeHtml = (html: string): string => {
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/ (<\/li>)/g, '$1') 
    .replace(/ (<\/p>)/g, '$1');
};

const PerspectiveCard = ({
  perspective,
  side,
}: {
  perspective: Perspective;
  side: 'left' | 'right' | 'other';
}) => {
  const isLeft = side === 'left';
  const isRight = side === 'right';

  const accentColor = isLeft
    ? '#c0392b'
    : isRight
    ? '#1a56db'
    : '#4b5563';

  const badgeStyle = isLeft
    ? 'bg-red-100 text-red-700 border border-red-200'
    : isRight
    ? 'bg-blue-100 text-blue-700 border border-blue-200'
    : 'bg-gray-100 text-gray-600 border border-gray-200';

  const headerBg = isLeft
    ? 'from-red-50 to-white'
    : isRight
    ? 'from-blue-50 to-white'
    : 'from-gray-50 to-white';

  const label = isLeft ? 'Left' : isRight ? 'Right' : perspective.lean;

  return (
    <article
      className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white flex flex-col h-full"
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      {/* Colored top stripe */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />

      {/* Header */}
      <div className={`bg-gradient-to-b ${headerBg} px-6 pt-5 pb-4`}>
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${badgeStyle}`}
          >
            {label} Perspective
          </span>
          {perspective.lean_score !== undefined && (
            <span className="text-xs text-gray-400 font-mono">
              bias score: {perspective.lean_score}
            </span>
          )}
        </div>
        <h3
          className="text-xl font-bold leading-snug"
          style={{ color: accentColor }}
        >
          {perspective.headline}
        </h3>
      </div>


      <div className="px-6 py-5 flex flex-col gap-4 flex-1">
        {perspective.summary && (
          <p className="text-sm text-gray-500 italic leading-relaxed border-l-2 pl-3" style={{ borderColor: accentColor }}>
            {perspective.summary}
          </p>
        )}

        {perspective.body && (
          <div
            className="text-sm text-gray-700 leading-relaxed prose-perspective"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(perspective.body) }}
          />
        )}
      </div>

      {perspective.source_name && (
        <div className="px-6 pb-5 mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="font-medium uppercase tracking-wide">Source</span>
            <ChevronRight className="h-3 w-3" />
            {perspective.source_url ? (
              <a
                href={perspective.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1"
                style={{ color: accentColor }}
              >
                {perspective.source_name}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span>{perspective.source_name}</span>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleWithPerspectives | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) fetchArticle(slug);
  }, [slug]);

  const fetchArticle = async (articleSlug: string) => {
    try {
      setLoading(true);
      const data = await articleApi.getArticleBySlug(articleSlug);
      setArticle(data);
    } catch (err: any) {
      setError('Failed to load article');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800 mx-auto" />
          <p className="text-sm text-gray-400 tracking-wide">Loading article…</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error || 'Article not found'}</p>
          <Link to="/articles">
            <Button variant="outline">Back to Articles</Button>
          </Link>
        </div>
      </div>
    );
  }

  const leftPerspective = article.perspectives?.find(p => p.lean === 'left');
  const rightPerspective = article.perspectives?.find(p => p.lean === 'right');
  const otherPerspectives = article.perspectives?.filter(
    p => p.lean !== 'left' && p.lean !== 'right'
  );

  return (
    <>
      {/* Inject prose styles for rich HTML content */}
      <style>{`
        .prose-perspective ol {
          list-style-type: decimal;
          padding-left: 1.25rem;
          margin: 0.25rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .prose-perspective ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin: 0.25rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .prose-perspective li {
          line-height: 1.6;
        }
        .prose-perspective p {
          margin-bottom: 0.5rem;
        }
        .prose-perspective strong { font-weight: 600; }
        .prose-perspective em { font-style: italic; }
        .prose-perspective a { text-decoration: underline; }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10">

          
          <Link to="/articles">
            <Button variant="ghost" size="sm" className="mb-8 text-gray-500 hover:text-gray-900 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Articles
            </Button>
          </Link>

          
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Balanced News
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4 capitalize">
              {article.topic}
            </h1>

            {article.image_url && (
              <img
                src={article.image_url}
                alt={article.topic}
                className="w-full h-auto rounded-lg mb-6 object-cover"
              />
            )}

            {article.description && (
              <div className="text-gray-600 leading-relaxed mb-6 prose-perspective">
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.description) }} />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>

              {article.category && (
                <span className="px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium text-xs uppercase tracking-wide">
                  {article.category.name}
                </span>
              )}

              {article.tags?.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500 text-xs">
                  #{tag}
                </span>
              ))}
            </div>

            {article.original_url && (
              <a
                href={article.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-xs text-blue-600 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View original source
              </a>
            )}
          </header>

          
          {(leftPerspective || rightPerspective) && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                Perspectives
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          
          {(leftPerspective || rightPerspective) && (
            <div className="grid md:grid-cols-2 gap-5 mb-8">
              {leftPerspective && (
                <PerspectiveCard perspective={leftPerspective} side="left" />
              )}
              {rightPerspective && (
                <PerspectiveCard perspective={rightPerspective} side="right" />
              )}
            </div>
          )}

          
          {otherPerspectives?.length > 0 && (
            <>
              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                  Other Perspectives
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {otherPerspectives?.map(p => (
                  <PerspectiveCard key={p.id} perspective={p} side="other" />
                ))}
              </div>
            </>
          )}

          {(!article.perspectives) && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Scale className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">No perspectives available for this article yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};