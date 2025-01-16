import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, Clock, ArrowUpDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featured_image: string;
  read_time: number;
  published_at: string;
}

interface RelatedArticlesPanelProps {
  tag: string;
  onClose: () => void;
}

export const RelatedArticlesPanel: React.FC<RelatedArticlesPanelProps> = ({ tag, onClose }) => {
  const [articles, setArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'relevance'>('date');
  const [page, setPage] = useState(1);
  const articlesPerPage = 10;

  useEffect(() => {
    fetchArticles();
  }, [tag, sortBy]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, featured_image, read_time, published_at')
        .eq('status', 'published')
        .contains('post_tags', [tag])
        .order(sortBy === 'date' ? 'published_at' : 'relevance', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.error('Error fetching related articles:', err);
      setError('Failed to load related articles');
    } finally {
      setLoading(false);
    }
  };

  const displayedArticles = showAll 
    ? articles.slice((page - 1) * articlesPerPage, page * articlesPerPage)
    : articles.slice(0, 3);

  const totalPages = Math.ceil(articles.length / articlesPerPage);

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-dark-surface 
                shadow-2xl transform transition-transform duration-300 z-50
                ${showAll ? 'translate-x-0' : 'translate-x-0'}`}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-playfair font-bold text-emerald dark:text-sage">
              Articles tagged with "{tag}"
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {showAll && (
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => setSortBy(sortBy === 'date' ? 'relevance' : 'date')}
                className="flex items-center gap-2 text-sm text-emerald dark:text-sage
                         hover:text-emerald-700 dark:hover:text-white"
              >
                <ArrowUpDown className="w-4 h-4" />
                Sort by {sortBy === 'date' ? 'relevance' : 'date'}
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-emerald dark:text-sage">Loading articles...</div>
            </div>
          ) : error ? (
            <div className="text-red-500 dark:text-red-400">{error}</div>
          ) : articles.length === 0 ? (
            <div className="text-emerald dark:text-sage">No related articles found.</div>
          ) : (
            <div className="space-y-6">
              {displayedArticles.map(article => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug}`}
                  onClick={onClose}
                  className="block group"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-playfair font-bold text-emerald dark:text-sage
                                 group-hover:text-emerald-700 dark:group-hover:text-white
                                 transition-colors duration-300">
                        {article.title}
                      </h3>
                      <p className="text-sm text-emerald/60 dark:text-sage/60 mt-1 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-emerald/60 dark:text-sage/60">
                        <Clock className="w-4 h-4" />
                        {article.read_time} min read
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-emerald/40 dark:text-sage/40
                                         group-hover:text-emerald dark:group-hover:text-sage
                                         transition-colors duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {articles.length > 3 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {showAll ? (
              <div className="space-y-4">
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                      <button
                        key={num}
                        onClick={() => setPage(num)}
                        className={`w-8 h-8 rounded-full ${
                          page === num
                            ? 'bg-emerald text-white'
                            : 'text-emerald dark:text-sage hover:bg-emerald/10 dark:hover:bg-sage/10'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowAll(false)}
                  className="w-full px-4 py-2 text-emerald dark:text-sage border border-emerald/20
                           dark:border-sage/20 rounded-lg hover:bg-emerald/10 dark:hover:bg-sage/10
                           transition-colors duration-300"
                >
                  Show Less
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAll(true)}
                className="w-full px-4 py-2 bg-emerald text-white rounded-lg
                         hover:bg-emerald-700 transition-colors duration-300"
              >
                See All Articles ({articles.length})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};