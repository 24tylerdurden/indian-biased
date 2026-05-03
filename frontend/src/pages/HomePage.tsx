import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { articleApi, type Article } from '@/lib/api-articles';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Scale, Newspaper, Clock } from 'lucide-react';

export const HomePage = () => {
  const { user } = useAuth();
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentArticles();
  }, []);

  const fetchRecentArticles = async () => {
    try {
      const data = await articleApi.getArticles({ status: 'published', limit: 3 });
      setRecentArticles(data.articles);
    } catch (err) {
      console.error('Failed to fetch recent articles:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">Biased India</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            See news from multiple perspectives. We present neutral facts alongside left and right viewpoints so you can make informed decisions.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/articles">
              <Button size="lg">
                {user ? 'Browse Articles' : 'Get Started'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {!user && (
              <Link to="/signup">
                <Button size="lg" variant="outline">
                  Sign Up Free
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Articles Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Recent Articles</h2>
            <Link to="/articles">
              <Button variant="ghost">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : recentArticles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No articles published yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {recentArticles.map((article) => (
                <Link key={article.id} to={`/articles/${article.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-xl line-clamp-2">{article.topic}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(article.published_at || article.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click to read perspectives from multiple viewpoints
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Why Biased India?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Neutral Facts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Verified, source-backed facts presented without editorial bias
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Multiple Perspectives</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Compare left and right viewpoints side by side
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informed Decisions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Make your own conclusions based on complete information
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
