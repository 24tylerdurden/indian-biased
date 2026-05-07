import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { articleApi, type Article } from '@/lib/api-articles';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Clock, TrendingUp, Eye, Shield } from 'lucide-react';

export const HomePage = () => {
  const { user } = useAuth();
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentArticles();
  }, []);

  const truncateDescription = (html: string | undefined, wordCount: number = 50): string => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    const words = text.split(/\s+/).filter(word => word.length > 0);
    return words.slice(0, wordCount).join(' ') + (words.length > wordCount ? '...' : '');
  };

  const fetchRecentArticles = async () => {
    try {
      const data = await articleApi.getArticles({ status: 'published', limit: 6 });
      console.log("the data informations is : ", data)
      setRecentArticles(data.articles);
    } catch (err) {
      console.error('Failed to fetch recent articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const featuredArticle = recentArticles[0];
  const secondaryArticles = recentArticles.slice(1, 4);
  const smallArticles = recentArticles.slice(4, 6);

  return (
    <div className="min-h-screen bg-[#f8f7f2]">

      <header className="border-b border-gray-900 bg-[#f8f7f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-2 border-b border-gray-200 text-xs text-gray-500">
            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <div className="flex items-center gap-4">
              {!user ? (
                <>
                  <Link to="/login" className="hover:text-gray-900 transition-colors">Sign in</Link>
                  <Link to="/signup">
                    <span className="bg-gray-900 text-white px-3 py-1 text-xs font-medium hover:bg-gray-700 transition-colors cursor-pointer">
                      Subscribe Free
                    </span>
                  </Link>
                </>
              ) : (
                <Link to="/articles" className="hover:text-gray-900 transition-colors">My Feed</Link>
              )}
            </div>
          </div>

          <div className="py-5 text-center">
            <div className="inline-flex items-center gap-3 mb-1">
              <div className="h-px w-16 bg-gray-900" />
              <span className="text-[10px] tracking-[0.35em] uppercase font-medium text-gray-500">Est. 2026</span>
              <div className="h-px w-16 bg-gray-900" />
            </div>
            <h1
              className="text-5xl sm:text-7xl font-black tracking-tight text-gray-900 leading-none"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Biased India
            </h1>
            <p className="mt-2 text-xs tracking-[0.25em] uppercase text-gray-500 font-medium">
              Every story. Every angle. You decide.
            </p>
          </div>

          <nav className="flex items-center justify-center gap-6 pb-3 text-xs font-semibold uppercase tracking-widest text-gray-600 overflow-x-auto">
            {['Politics', 'Economy', 'Society', 'World', 'Opinion'].map(cat => (
              <Link
                key={cat}
                to={`/articles?category=${cat.toLowerCase()}`}
                className="whitespace-nowrap hover:text-gray-900 transition-colors pb-1 border-b-2 border-transparent hover:border-gray-900"
              >
                {cat}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="bg-gray-900 text-white py-3 px-4 text-center">
        <p className="text-xs tracking-widest uppercase font-medium text-gray-300">
          <span className="text-amber-400 font-bold mr-2">New</span>
          We present every story from Left &amp; Right — no echo chamber
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {!loading && recentArticles.length > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-900 border-b-2 border-gray-900 pb-0.5">
                Latest Coverage
              </span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-gray-900">

              {featuredArticle && (
                <Link
                  to={`/articles/${featuredArticle.slug}`}
                  className="lg:col-span-2 block group border-b lg:border-b-0 lg:border-r border-gray-900"
                >
                  <div className="p-6 sm:p-8 h-full flex flex-col justify-between min-h-[320px] bg-white hover:bg-gray-50 transition-colors">
                    {featuredArticle.image_url && (
                      <img
                        src={featuredArticle.image_url}
                        alt={featuredArticle.topic}
                        className="w-full h-48 object-cover rounded mb-4"
                      />
                    )}
                    <div>
                      {featuredArticle.categoryType && (
                        <span className="inline-block text-[10px] uppercase tracking-[0.25em] font-bold text-white bg-gray-900 px-2 py-0.5 mb-4">
                          {featuredArticle.categoryType}
                        </span>
                      )}
                      {featuredArticle.description && (
                        <p className="text-gray-600 leading-relaxed mb-6">
                          {truncateDescription(featuredArticle.description, 50)}
                        </p>
                      )}
                      <h2
                        className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4 group-hover:underline decoration-2 underline-offset-4"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {featuredArticle.topic}
                      </h2>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(featuredArticle.published_at || featuredArticle.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-xs border border-red-600 text-red-600 px-2 py-1 rounded-sm font-medium">
                          <span className="h-2 w-2 rounded-full bg-red-600 inline-block" />
                          Left
                        </div>
                        <div className="flex items-center gap-1.5 text-xs border border-blue-700 text-blue-700 px-2 py-1 rounded-sm font-medium">
                          <span className="h-2 w-2 rounded-full bg-blue-700 inline-block" />
                          Right
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read both sides <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              <div className="flex flex-col divide-y divide-gray-900 border-t lg:border-t-0 border-gray-900">
                {secondaryArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/articles/${article.slug}`}
                    className="block group flex-1 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-5 h-full flex flex-col justify-between">
                      {article.categoryType && (
                        <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">
                          {article.categoryType}
                        </span>
                      )}
                      <h3
                        className="text-base font-bold text-gray-900 leading-snug group-hover:underline decoration-1 underline-offset-2 mb-3 flex-1"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {article.topic}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(article.published_at || article.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="flex gap-1.5">
                          <span className="text-red-500 font-bold">L</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-blue-600 font-bold">R</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {smallArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-x border-b border-gray-900 mt-0">
                {smallArticles.map((article, i) => (
                  <Link
                    key={article.id}
                    to={`/articles/${article.slug}`} mb-2
                    className={`block group bg-white hover:bg-gray-50 transition-colors p-5 ${i === 0 ? 'border-r border-gray-900' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className="text-3xl font-black text-gray-200 leading-none"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        {article.description && (
                          <p className="text-gray-500 text-xs leading-relaxed">
                            {truncateDescription(article.description, 20)}
                          </p>
                        )}
                        {String(i + 5).padStart(2, '0')}
                      </span>
                      <div>
                        {article.categoryType && (
                          <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 block mb-1">
                            {article.categoryType}
                          </span>
                        )}
                        <h4
                          className="text-sm font-bold text-gray-900 leading-snug group-hover:underline decoration-1 underline-offset-2"
                          style={{ fontFamily: 'Georgia, serif' }}
                        >
                          {article.topic}
                        </h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Link to="/articles">
                <Button
                  variant="outline"
                  className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors rounded-none px-8 text-xs tracking-widest uppercase font-bold"
                >
                  All Stories <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </>
        ) : loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
              <p className="text-xs tracking-widest text-gray-400 uppercase">Loading stories…</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-32">
            <p className="text-gray-400 text-sm">No articles published yet</p>
          </div>
        )}

        <div className="flex items-center gap-4 my-14">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-[10px] tracking-[0.35em] uppercase font-bold text-gray-400">Why Biased India</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <div className="grid sm:grid-cols-3 gap-0 border border-gray-900">
          {[
            {
              icon: Eye,
              title: 'See Both Sides',
              desc: 'Every article is presented with a left-leaning and right-leaning perspective — side by side, no spin.',
              accent: 'border-l-4 border-gray-900',
            },
            {
              icon: Shield,
              title: 'Source-Backed Facts',
              desc: 'All perspectives link to their original sources so you can verify and go deeper.',
              accent: 'border-l-4 border-red-600',
            },
            {
              icon: TrendingUp,
              title: 'You Decide',
              desc: 'No algorithmic bubble. No hidden agenda. Just information to help you form your own opinion.',
              accent: 'border-l-4 border-blue-700',
            },
          ].map(({ icon: Icon, title, desc, accent }, i) => (
            <div
              key={title}
              className={`p-7 bg-white ${accent} ${i < 2 ? 'border-r border-gray-900' : ''}`}
            >
              <Icon className="h-5 w-5 text-gray-700 mb-4" />
              <h3
                className="text-lg font-bold text-gray-900 mb-2"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        
        {!user && (
          <div className="mt-14 bg-gray-900 text-white px-8 py-12 text-center">
            <p className="text-[10px] tracking-[0.35em] uppercase font-bold text-gray-400 mb-3">Get Started</p>
            <h2
              className="text-3xl sm:text-4xl font-black mb-4 leading-tight"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Read the news differently.
            </h2>
            <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
              Join readers who want the full picture — free, no paywall, no bias labels.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/signup">
                <Button className="bg-white text-gray-900 hover:bg-gray-100 rounded-none px-8 font-bold text-xs tracking-widest uppercase">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/articles">
                <Button variant="ghost" className="text-gray-400 hover:text-white rounded-none text-xs tracking-widest uppercase px-8">
                  Browse First →
                </Button>
              </Link>
            </div>
          </div>
        )}

      </main>

      <footer className="border-t border-gray-300 mt-16 py-8 text-center text-xs text-gray-400">
        <p className="tracking-wider">© {new Date().getFullYear()} Biased India — All perspectives, all the time.</p>
      </footer>
    </div>
  );
};