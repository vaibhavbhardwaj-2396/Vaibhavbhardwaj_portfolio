import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, AlertTriangle, GitMerge } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

interface MergeConfirmation {
  source: Tag;
  target: Tag;
}

export const TagManager = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [mergeConfirmation, setMergeConfirmation] = useState<MergeConfirmation | null>(null);
  const [showMergeUI, setShowMergeUI] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetchTags();

    const subscription = supabase
      .channel('blog_tags_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'blog_tags' 
        }, 
        () => {
          fetchTags();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('blog_tags')
        .insert([{
          name: newTagName,
          slug: generateSlug(newTagName)
        }]);

      if (error) throw error;
      
      setNewTagName('');
      setShowAddForm(false);
      await fetchTags();
    } catch (err) {
      console.error('Error adding tag:', err);
      setError(err.message);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_tags')
        .update({
          name: editedName,
          slug: generateSlug(editedName)
        })
        .eq('id', id);

      if (error) throw error;
      
      setEditingId(null);
      setEditedName('');
      await fetchTags();
    } catch (err) {
      console.error('Error updating tag:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;

    try {
      const { error } = await supabase
        .from('blog_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTags();
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError(err.message);
    }
  };

  const handleMergeTags = async (sourceId: string, targetId: string) => {
    try {
      // First, update all posts that use the source tag to use the target tag
      const { data: postsWithSourceTag } = await supabase
        .from('blog_posts')
        .select('id, post_tags')
        .contains('post_tags', [sourceId]);

      if (postsWithSourceTag) {
        for (const post of postsWithSourceTag) {
          const updatedTags = post.post_tags.map((tag: string) => 
            tag === sourceId ? targetId : tag
          );

          await supabase
            .from('blog_posts')
            .update({ post_tags: updatedTags })
            .eq('id', post.id);
        }
      }

      // Then delete the source tag
      const { error: deleteError } = await supabase
        .from('blog_tags')
        .delete()
        .eq('id', sourceId);

      if (deleteError) throw deleteError;

      setMergeConfirmation(null);
      setShowMergeUI(false);
      setSelectedTags([]);
      await fetchTags();
    } catch (err) {
      console.error('Error merging tags:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Loading tags...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-emerald dark:text-sage">Tags</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowMergeUI(!showMergeUI)}
            className={`px-4 py-2 flex items-center gap-2 rounded-lg transition-colors duration-200
                     ${showMergeUI 
                       ? 'bg-emerald text-white' 
                       : 'bg-emerald/10 text-emerald dark:text-sage hover:bg-emerald/20'}`}
          >
            <GitMerge className="w-4 h-4" />
            {showMergeUI ? 'Cancel Merge' : 'Merge Tags'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-emerald text-white rounded-lg hover:bg-emerald-700
                     transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Tag
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="p-4 border border-emerald/20 rounded-lg">
          <div className="flex gap-4">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter tag name"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                       focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-emerald text-white rounded-lg hover:bg-emerald-700
                       transition-colors duration-200"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-dark-surface rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {showMergeUI && (
                <th className="w-12 px-6 py-3">
                  <span className="sr-only">Select</span>
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tags.map(tag => (
              <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {showMergeUI && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTags.some(t => t.id === tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (selectedTags.length < 2) {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        } else {
                          setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
                        }
                      }}
                      disabled={selectedTags.length >= 2 && !selectedTags.some(t => t.id === tag.id)}
                      className="rounded border-gray-300 text-emerald focus:ring-emerald"
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                  {editingId === tag.id ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-700
                               focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {tag.name}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {tag.slug}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {editingId === tag.id ? (
                    <>
                      <button
                        onClick={() => handleEdit(tag.id)}
                        className="text-emerald hover:text-emerald-700"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditedName('');
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(tag.id);
                          setEditedName(tag.name);
                        }}
                        className="text-emerald hover:text-emerald-700"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showMergeUI && selectedTags.length === 2 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-emerald dark:text-sage mb-4">
              Confirm Tag Merge
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to merge "{selectedTags[0].name}" into "{selectedTags[1].name}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setSelectedTags([]);
                  setMergeConfirmation(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMergeTags(selectedTags[0].id, selectedTags[1].id)}
                className="px-4 py-2 bg-emerald text-white rounded-lg"
              >
                Confirm Merge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};