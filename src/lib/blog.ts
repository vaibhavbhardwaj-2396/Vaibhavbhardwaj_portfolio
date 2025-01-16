import { supabase } from './supabase';

// Calculate read time based on content length
export const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readTime); // Ensure minimum 1 minute read time
};

// Get random loading message
export const getRandomLoadingMessage = (): string => {
  const messages = [
    'Loading your article...',
    'Preparing content...',
    'Almost there...',
    'Just a moment...',
    'Getting things ready...'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

// Fetch a single article by slug
export const fetchArticle = async (slug: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:author_id (
        name,
        role,
        avatar_url
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) throw error;
  return data;
};

// Get filter options for blog list
export const getFilterOptions = async () => {
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('published_at, read_time, post_categories, post_tags')
      .eq('status', 'published');

    if (!posts) return null;

    const years = new Set<string>();
    const months = new Set<string>();
    const categories = new Set<string>();
    const readTimes = new Set<number>();
    const tags = new Set<string>();

    posts.forEach(post => {
      if (post.published_at) {
        const date = new Date(post.published_at);
        years.add(date.getFullYear().toString());
        months.add((date.getMonth() + 1).toString().padStart(2, '0'));
      }
      if (Array.isArray(post.post_categories)) {
        post.post_categories.forEach((cat: string) => categories.add(cat));
      }
      if (Array.isArray(post.post_tags)) {
        post.post_tags.forEach((tag: string) => tags.add(tag));
      }
      if (post.read_time) {
        readTimes.add(post.read_time);
      }
    });

    return {
      years: Array.from(years).sort().reverse(),
      months: Array.from(months).sort(),
      categories: Array.from(categories).sort(),
      readTimes: Array.from(readTimes).sort((a, b) => a - b),
      tags: Array.from(tags).sort()
    };
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return null;
  }
};