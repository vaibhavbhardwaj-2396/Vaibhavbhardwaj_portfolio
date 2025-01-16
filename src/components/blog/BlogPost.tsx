import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, Tag, ArrowLeft, Share2, Linkedin, Mail, Twitter,
  MessageSquare, User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchArticle, getRandomLoadingMessage } from '../../lib/blog';
import { RelatedArticlesPanel } from './RelatedArticlesPanel';
import { LoadingBuffer } from '../LoadingBuffer';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image: string;
  read_time: number;
  published_at: string;
  post_tags: string[];
  author: {
    name: string;
    role: string;
    avatar_url: string;
  } | null;
}

export const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loadingMessage] = useState(getRandomLoadingMessage);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const post = await fetchArticle(slug);
        
        if (!post) {
          navigate('/blog');
          return;
        }
        
        setPost(post);
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, navigate]);

  if (loading) {
    return <LoadingBuffer message={loadingMessage} />;
  }

  if (error || !post) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-red-500 dark:text-red-400">
          {error || 'Article not found'}
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const authorName = post.author?.name || 'Vaibhav Bhardwaj';

  return (
    <article className="mx-auto px-4 sm:px-6 lg:px-8 w-full lg:w-[80%]">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-emerald dark:text-sage 
                 hover:text-emerald-700 dark:hover:text-white transition-colors duration-300 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </Link>

      {post.featured_image && (
        <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-emerald dark:text-sage mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-emerald/60 dark:text-sage/60 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {post.read_time} min read
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {authorName}
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            {new Date(post.published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {post.post_tags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className="px-4 py-2 rounded-full bg-emerald/10 dark:bg-sage/10
                       text-emerald dark:text-sage hover:bg-emerald/20 dark:hover:bg-sage/20
                       transition-colors duration-300 flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              {tag}
            </button>
          ))}
        </div>
      </header>

      <div 
        className="prose dark:prose-invert max-w-none mb-12 blog-content w-full"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="flex items-center gap-4 border-t border-emerald/10 dark:border-sage/10 pt-8">
        <span className="text-emerald dark:text-sage">Share this article:</span>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="share-button"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-button"
            title="Share on Twitter"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-button"
            title="Share on LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(window.location.href)}`}
            className="share-button"
            title="Share via Email"
          >
            <Mail className="w-5 h-5" />
          </a>
        </div>
      </div>

      {selectedTag && (
        <RelatedArticlesPanel
          tag={selectedTag}
          onClose={() => setSelectedTag(null)}
        />
      )}
    </article>
  );
};