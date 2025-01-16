import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Save, Image, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CategoryTagManager } from './CategoryTagManager';
import { calculateReadTime } from '../../lib/blog';
import { uploadImage } from '../../lib/cloudinary';

interface BlogPostEditorProps {
  postId?: string | null;
  onClose: () => void;
}

export const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ postId, onClose }) => {
  const [post, setPost] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft',
    read_time: 5,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    meta_author: 'Vaibhav Bhardwaj',
    meta_image: '',
    post_categories: [] as string[],
    post_tags: [] as string[],
    published_at: null as string | null
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaveMessage, setAutoSaveMessage] = useState('');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (post.title && post.content) {
      autoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          await handleSave(true);
          setAutoSaveMessage('Draft saved ' + new Date().toLocaleTimeString());
        } catch (err) {
          console.error('Auto-save error:', err);
          setAutoSaveMessage('Auto-save failed');
        }
      }, 30000); // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [post]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;
      if (data) {
        setPost(data);
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.message);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const imageUrl = await uploadImage(file);
      
      if (!imageUrl) {
        throw new Error('No URL received from upload');
      }

      setPost(prev => ({
        ...prev,
        featured_image: imageUrl,
        meta_image: imageUrl
      }));
    } catch (err) {
      console.error('Error handling image:', err);
      setError(err instanceof Error ? err.message : 'Failed to handle image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setPost(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      meta_title: title
    }));
  };

  const handleSave = async (isDraft = false) => {
    if (!isDraft) {
      setSaving(true);
    }
    setError(null);

    try {
      const readTime = calculateReadTime(post.content);
      const now = new Date().toISOString();

      const postData = {
        ...post,
        read_time: readTime,
        meta_title: post.meta_title || post.title,
        meta_description: post.meta_description || post.excerpt,
        meta_image: post.meta_image || post.featured_image,
        published_at: post.status === 'published' ? (post.published_at || now) : null,
        updated_at: now
      };

      if (postId) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', postId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
      }

      if (!isDraft) {
        onClose();
      }
    } catch (err) {
      console.error('Error saving post:', err);
      setError(err.message);
    } finally {
      if (!isDraft) {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-emerald dark:text-sage">
          {postId ? 'Edit Post' : 'New Post'}
        </h2>
        <div className="flex items-center gap-4">
          {autoSaveMessage && (
            <span className="text-sm text-emerald/60 dark:text-sage/60">
              {autoSaveMessage}
            </span>
          )}
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 text-emerald dark:text-sage hover:bg-emerald/10 
                     dark:hover:bg-sage/10 rounded-lg flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={post.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                     focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content (HTML)
            </label>
            <div className="space-y-2">
              <textarea
                value={post.content}
                onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
                rows={20}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                         focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg
                         font-mono text-sm"
                placeholder="Enter your HTML content here..."
              />
              <p className="text-sm text-emerald/60 dark:text-sage/60">
                Tip: You can paste formatted HTML content here. Use proper HTML tags for formatting.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Featured Image
            </label>
            <div className="space-y-4">
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt="Featured"
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div className="flex gap-4">
                <label className={`
                  flex-1 px-4 py-2 bg-emerald text-white rounded-lg hover:bg-emerald-700
                  transition-colors duration-200 cursor-pointer text-center
                  ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Image className="w-4 h-4 inline-block mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </label>
                <input
                  type="url"
                  value={post.featured_image}
                  onChange={(e) => setPost({ ...post, featured_image: e.target.value })}
                  placeholder="Or enter image URL"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                           focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Excerpt
            </label>
            <textarea
              value={post.excerpt}
              onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                       focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categories
            </label>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {post.post_categories?.map(category => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
                             bg-emerald/10 dark:bg-sage/10 text-emerald dark:text-sage"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => setPost(prev => ({
                        ...prev,
                        post_categories: prev.post_categories?.filter(cat => cat !== category) || []
                      }))}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryManager(true)}
                className="w-full px-4 py-2 bg-emerald/10 dark:bg-sage/10 text-emerald dark:text-sage
                         rounded-lg hover:bg-emerald/20 dark:hover:bg-sage/20 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 inline-block mr-2" />
                Add Category
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {post.post_tags?.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
                             bg-emerald/10 dark:bg-sage/10 text-emerald dark:text-sage"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setPost(prev => ({
                        ...prev,
                        post_tags: prev.post_tags?.filter(t => t !== tag) || []
                      }))}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowTagManager(true)}
                className="w-full px-4 py-2 bg-emerald/10 dark:bg-sage/10 text-emerald dark:text-sage
                         rounded-lg hover:bg-emerald/20 dark:hover:bg-sage/20 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 inline-block mr-2" />
                Add Tag
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Publishing
            </label>
            <div className="space-y-4">
              <select
                value={post.status}
                onChange={(e) => setPost(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                         focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              {post.status === 'published' && (
                <input
                  type="datetime-local"
                  value={post.published_at?.slice(0, 16) || ''}
                  onChange={(e) => setPost({ ...post, published_at: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                           focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                       dark:hover:bg-gray-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-4 py-2 bg-emerald text-white rounded-lg hover:bg-emerald-700
                       transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </div>
      </div>

      {showCategoryManager && (
        <CategoryTagManager
          type="category"
          onAdd={(category) => {
            setPost(prev => ({
              ...prev,
              post_categories: [...(prev.post_categories || []), category.name]
            }));
            setShowCategoryManager(false);
          }}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      {showTagManager && (
        <CategoryTagManager
          type="tag"
          onAdd={(tag) => {
            setPost(prev => ({
              ...prev,
              post_tags: [...(prev.post_tags || []), tag.name]
            }));
            setShowTagManager(false);
          }}
          onClose={() => setShowTagManager(false)}
        />
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-emerald dark:text-sage">
                  Preview
                </h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <h1>{post.title}</h1>
                {post.featured_image && (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};