import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BlogPostEditor } from './BlogPostEditor';
import { TagManager } from './TagManager';
import { CategoryManager } from './CategoryManager';
import { Edit, Trash2, Plus, Eye, EyeOff, Tag, Folder } from 'lucide-react';
import { LoadingBuffer } from '../LoadingBuffer';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  published_at: string | null;
  read_time: number;
}

export const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all');

  useEffect(() => {
    fetchPosts();

    const subscription = supabase
      .channel('blog_posts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'blog_posts' 
        }, 
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'published') {
        query = query.eq('status', 'published');
      } else if (filter === 'drafts') {
        query = query.eq('status', 'draft');
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err.message);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      await fetchPosts();
    } catch (err) {
      console.error('Error updating post status:', err);
      setError(err.message);
    }
  };

  if (showTagManager) {
    return (
      <>
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowTagManager(false)}
            className="text-emerald dark:text-sage hover:underline"
          >
            ← Back to Posts
          </button>
        </div>
        <TagManager />
      </>
    );
  }

  if (showCategoryManager) {
    return (
      <>
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowCategoryManager(false)}
            className="text-emerald dark:text-sage hover:underline"
          >
            ← Back to Posts
          </button>
        </div>
        <CategoryManager />
      </>
    );
  }

  if (showEditor) {
    return <BlogPostEditor postId={editingPostId} onClose={() => setShowEditor(false)} />;
  }

  if (loading) {
    return <LoadingBuffer message="Loading blog posts..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              filter === 'all'
                ? 'bg-emerald text-white'
                : 'bg-emerald/10 text-emerald dark:text-sage hover:bg-emerald/20'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              filter === 'published'
                ? 'bg-emerald text-white'
                : 'bg-emerald/10 text-emerald dark:text-sage hover:bg-emerald/20'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter('drafts')}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              filter === 'drafts'
                ? 'bg-emerald text-white'
                : 'bg-emerald/10 text-emerald dark:text-sage hover:bg-emerald/20'
            }`}
          >
            Drafts
          </button>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCategoryManager(true)}
            className="px-4 py-2 bg-emerald/10 text-emerald dark:text-sage rounded-lg 
                     hover:bg-emerald/20 transition-colors duration-200 flex items-center gap-2"
          >
            <Folder className="w-5 h-5" />
            Manage Categories
          </button>
          <button
            onClick={() => setShowTagManager(true)}
            className="px-4 py-2 bg-emerald/10 text-emerald dark:text-sage rounded-lg 
                     hover:bg-emerald/20 transition-colors duration-200 flex items-center gap-2"
          >
            <Tag className="w-5 h-5" />
            Manage Tags
          </button>
          <button
            onClick={() => {
              setEditingPostId(null);
              setShowEditor(true);
            }}
            className="px-4 py-2 bg-emerald text-white rounded-lg hover:bg-emerald-700
                     transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Post
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-dark-surface rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Published
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Read Time
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map(post => (
              <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {post.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {post.slug}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${post.status === 'published'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : '-'
                    }
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {post.read_time} min
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditingPostId(post.id);
                      setShowEditor(true);
                    }}
                    className="text-emerald hover:text-emerald-700"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleStatusToggle(post.id, post.status)}
                    className="text-emerald hover:text-emerald-700"
                  >
                    {post.status === 'published' ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};