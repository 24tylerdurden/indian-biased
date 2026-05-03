import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { articleApi, type ArticleWithPerspectives, type Perspective } from '@/lib/api-articles';
import { ArrowLeft, Clock, ExternalLink, Scale } from 'lucide-react';

export const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleWithPerspectives | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchArticle(slug);
    }
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

  const renderPerspective = (perspective: Perspective, colorClass: string) => (
    <div className={`border rounded-lg p-6 ${colorClass}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-1 rounded-full bg-current" />
        <h3 className="text-xl font-semibold capitalize">{perspective.lean} Perspective</h3>
        {perspective.lean_score !== undefined && (
          <span className="text-sm px-2 py-1 rounded bg-current/20">
            Score: {perspective.lean_score}
          </span>
        )}
      </div>
      <h4 className="font-medium mb-3 text-lg">{perspective.headline}</h4>
      <p className="text-sm leading-relaxed mb-4">{perspective.summary}</p>
      {perspective.body && (
        <div className="text-sm leading-relaxed mb-4 prose prose-sm max-w-none">
          {perspective.body}
        </div>
      )}
      {perspective.source_name && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Source:</span>
          {perspective.source_url ? (
            <a
              href={perspective.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              {perspective.source_name}
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span>{perspective.source_name}</span>
          )}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Article not found'}</p>
          <Link to="/articles">
            <Button>Back to Articles</Button>
          </Link>
        </div>
      </div>
    );
  }

  const leftPerspective = article.perspectives.find(p => p.lean === 'left');
  const rightPerspective = article.perspectives.find(p => p.lean === 'right');
  const otherPerspectives = article.perspectives.filter(p => p.lean !== 'left' && p.lean !== 'right');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Link to="/articles">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Balanced News
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">{article.topic}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {new Date(article.published_at || article.created_at).toLocaleDateString()}
              </span>
            </div>
            {article.category && (
              <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground">
                {article.category.name}
              </span>
            )}
            {article.tags && article.tags.length > 0 && (
              <div className="flex gap-2">
                {article.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 rounded bg-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {article.original_url && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <a
                href={article.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Original Source</span>
              </a>
            </CardContent>
          </Card>
        )}

        {/* Main Perspectives - Side by Side on Desktop */}
        {(leftPerspective || rightPerspective) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {leftPerspective && (
              <div>
                {renderPerspective(leftPerspective, 'bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400')}
              </div>
            )}
            {rightPerspective && (
              <div>
                {renderPerspective(rightPerspective, 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400')}
              </div>
            )}
          </div>
        )}

        {/* Mobile Tabs for Perspectives */}
        <div className="md:hidden mb-8">
          <Tabs defaultValue={leftPerspective ? 'left' : rightPerspective ? 'right' : 'other'}>
            <TabsList className="grid w-full grid-cols-3">
              {leftPerspective && <TabsTrigger value="left">Left</TabsTrigger>}
              {rightPerspective && <TabsTrigger value="right">Right</TabsTrigger>}
              {otherPerspectives.length > 0 && <TabsTrigger value="other">Other</TabsTrigger>}
            </TabsList>
            {leftPerspective && (
              <TabsContent value="left">
                {renderPerspective(leftPerspective, 'bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400')}
              </TabsContent>
            )}
            {rightPerspective && (
              <TabsContent value="right">
                {renderPerspective(rightPerspective, 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400')}
              </TabsContent>
            )}
            {otherPerspectives.length > 0 && (
              <TabsContent value="other">
                {otherPerspectives.map((p) => (
                  <div key={p.id} className="mb-4">
                    {renderPerspective(p, 'bg-gray-50/50 dark:bg-gray-950/20 text-gray-700 dark:text-gray-400')}
                  </div>
                ))}
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Other Perspectives */}
        {otherPerspectives.length > 0 && (
          <div className="hidden md:block">
            <h2 className="text-2xl font-semibold mb-4">Other Perspectives</h2>
            <div className="grid gap-6">
              {otherPerspectives.map((p) => (
                <div key={p.id}>
                  {renderPerspective(p, 'bg-gray-50/50 dark:bg-gray-950/20 text-gray-700 dark:text-gray-400')}
                </div>
              ))}
            </div>
          </div>
        )}

        {article.perspectives.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Scale className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No perspectives available for this article yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
