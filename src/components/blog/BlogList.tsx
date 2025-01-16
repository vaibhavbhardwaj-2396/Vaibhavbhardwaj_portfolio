import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Clock, Tag, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoadingBuffer } from '../LoadingBuffer';
import { BlogFilter } from './BlogFilter';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featured_image: string;
  read_time: number;
  published_at: string;
  post_categories: string[];
  post_tags: string[];
  author: {
    name: string;
    role: string;
  };
}

export const BlogList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tag } = useParams();
  const [searchParams] = useSearchParams();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:author_id (
            name,
            role
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Filter posts based on URL parameters
  const filterPosts = useCallback((posts: Post[]) => {
    let filtered = [...posts];
    
    // Filter by tag from URL parameter
    if (tag) {
      filtered = filtered.filter(post => 
        post.post_tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
    }

    // Filter by year
    const year = searchParams.get('year');
    if (year) {
      filtered = filtered.filter(post => 
        new Date(post.published_at).getFullYear() === parseInt(year)
      );
    }

    // Filter by month
    const month = searchParams.get('month');
    if (month) {
      filtered = filtered.filter(post => 
        (new Date(post.published_at).getMonth() + 1).toString().padStart(2, '0') === month
      );
    }

    // Filter by read time
    const readTime = searchParams.get('readTime');
    if (readTime) {
      const readTimeNum = parseInt(readTime);
      filtered = filtered.filter(post => {
        if (readTimeNum === 15) {
          return post.read_time >= 15;
        }
        return post.read_time === readTimeNum;
      });
    }

    // Filter by category
    const category = searchParams.get('category');
    if (category) {
      filtered = filtered.filter(post => 
        post.post_categories.some(c => c.toLowerCase() === category.toLowerCase())
      );
    }

    // Filter by tags
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    if (tags.length > 0) {
      filtered = filtered.filter(post =>
        tags.every(tag => 
          post.post_tags.some(t => t.toLowerCase() === tag.toLowerCase())
        )
      );
    }

    return filtered;
  }, [tag, searchParams]);

  if (loading) {
    return <LoadingBuffer message="Loading blog posts..." />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  const filteredPosts = filterPosts(posts);
  const featuredPost = !tag ? filteredPosts[0] : null;
  const regularPosts = !tag ? filteredPosts.slice(1) : filteredPosts;

  return (
    <div className="space-y-8">
      {/* Blog Filter */}
      <BlogFilter
        selectedFilters={{
          year: searchParams.get('year') || '',
          month: searchParams.get('month') || '',
          category: searchParams.get('category') || '',
          readTime: searchParams.get('readTime') || '',
          tags: searchParams.get('tags')?.split(',').filter(Boolean) || []
        }}
        onFilterChange={(type, value) => {
          const newParams = new URLSearchParams(searchParams);
          if (Array.isArray(value)) {
            if (value.length > 0) {
              newParams.set('tags', value.join(','));
            } else {
              newParams.delete('tags');
            }
          } else if (value) {
            newParams.set(type, value);
          } else {
            newParams.delete(type);
          }
          window.history.pushState({}, '', `?${newParams.toString()}`);
          window.dispatchEvent(new Event('popstate'));
        }}
        onResetFilters={() => {
          window.history.pushState({}, '', window.location.pathname);
          window.dispatchEvent(new Event('popstate'));
        }}
      />

      {/* Featured Post */}
      {featuredPost && (
        <Link to={`/blog/${featuredPost.slug}`} className="block group">
          <article className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-dark-bg">
            <div className="aspect-[21/9]">
              <img
                src={featuredPost.featured_image}
                alt={featuredPost.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {featuredPost.post_tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm bg-white/20 text-white backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-montserrat font-bold text-white mb-3 
                           group-hover:text-sage transition-colors duration-300">
                {featuredPost.title}
              </h2>
              <p className="text-white/80 mb-3 line-clamp-2">{featuredPost.excerpt}</p>
              <div className="flex items-center gap-4 text-white/60">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {featuredPost.read_time} min read
                </div>
                <span>•</span>
                <time>
                  {new Date(featuredPost.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </div>
          </article>
        </Link>
      )}

      {/* Regular Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularPosts.map(post => (
          <Link key={post.id} to={`/blog/${post.slug}`} className="block group">
            <article className="h-full rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-dark-bg p-4">
              <div className="aspect-[16/9] rounded-lg overflow-hidden mb-3">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {post.post_tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-smbg-emerald/10 dark:bg-sage/10 text-emerald dark:text-sage">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-xl font-montserrat font-bold text-emerald dark:text-sage mb-2 group-hover:text-emerald-700 dark:group-hover:text-white transition-colors duration-300">
                {post.title}
              </h2>
              <p className="text-emerald/60 dark:text-sage/60 mb-3 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-sm text-emerald/60 dark:text-sage/60">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.read_time} min read
                </div>
                <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </article>
          </Link>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-lg text-emerald dark:text-sage">No posts found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};