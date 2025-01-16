import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, AlertTriangle, GitMerge } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

interface MergeConfirmation {
  source: Category;
  target: Category;
}

export const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [mergeConfirmation, setMergeConfirmation] = useState<MergeConfirmation | null>(null);
  const [showMergeUI, setShowMergeUI] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();

    const subscription = supabase
      .channel('blog_categories_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'blog_categories' 
        }, 
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
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
        .from('blog_categories')
        .insert([{
          name: newCategory.name,
          description: newCategory.description,
          slug: generateSlug(newCategory.name)
        }]);

      if (error) throw error;
      
      setNewCategory({ name: '', description: '' });
      setShowAddForm(false);
      await fetchCategories();
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err.message);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_categories')
        .update({
          name: editedName,
          description: editedDescription,
          slug: generateSlug(editedName)
        })
        .eq('id', id);

      if (error) throw error;
      
      setEditingId(null);
      setEditedName('');
      setEditedDescription('');
      await fetchCategories();
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.message);
    }
  };

  const handleMergeCategories = async (sourceId: string, targetId: string) => {
    try {
      // First, update all posts that use the source category to use the target category
      const { data: postsWithSourceCategory } = await supabase
        .from('blog_posts')
        .select('id, post_categories')
        .contains('post_categories', [sourceId]);

      if (postsWithSourceCategory) {
        for (const post of postsWithSourceCategory) {
          const updatedCategories = post.post_categories.map((category: string) => 
            category === sourceId ? targetId : category
          );

          await supabase
            .from('blog_posts')
            .update({ post_categories: updatedCategories })
            .eq('id', post.id);
        }
      }

      // Then delete the source category
      const { error: deleteError } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', sourceId);

      if (deleteError) throw deleteError;

      setMergeConfirmation(null);
      setShowMergeUI(false);
      setSelectedCategories([]);
      await fetchCategories();
    } catch (err) {
      console.error('Error merging categories:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-emerald dark:text-sage">Categories</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowMergeUI(!showMergeUI)}
            className={`px-4 py-2 flex items-center gap-2 rounded-lg transition-colors duration-200
                     ${showMergeUI 
                       ? 'bg-emerald text-white' 
                       : 'bg-emerald/10 text-emerald dark:text-sage hover:bg-emerald/20'}`}
          >
            <GitMerge className="w-4 h-4" />
            {showMergeUI ? 'Cancel Merge' : 'Merge Categories'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-emerald text-white rounded-lg hover:bg-emerald-700
                     transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="p-4 border border-emerald/20 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Enter category name"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                       focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              placeholder="Enter category description"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                       focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                       dark:hover:bg-gray-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newCategory.name.trim()}
              className="px-4 py-2 bg-emerald text-white rounded-lg hover:bg-emerald-700
                       transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Category
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
                Description
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
            {categories.map(category => (
              <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {showMergeUI && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCategories.some(c => c.id === category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (selectedCategories.length < 2) {
                            setSelectedCategories([...selectedCategories, category]);
                          }
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c.id !== category.id));
                        }
                      }}
                      disabled={selectedCategories.length >= 2 && !selectedCategories.some(c => c.id === category.id)}
                      className="rounded border-gray-300 text-emerald focus:ring-emerald"
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                  {editingId === category.id ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-700
                               focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {category.name}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === category.id ? (
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-700
                               focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
                    />
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {category.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {category.slug}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {editingId === category.id ? (
                    <>
                      <button
                        onClick={() => handleEdit(category.id)}
                        className="text-emerald hover:text-emerald-700"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditedName('');
                          setEditedDescription('');
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
                          setEditingId(category.id);
                          setEditedName(category.name);
                          setEditedDescription(category.description);
                        }}
                        className="text-emerald hover:text-emerald-700"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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

      {showMergeUI && selectedCategories.length === 2 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-emerald dark:text-sage mb-4">
              Confirm Category Merge
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to merge "{selectedCategories[0].name}" into "{selectedCategories[1].name}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setMergeConfirmation(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMergeCategories(selectedCategories[0].id, selectedCategories[1].id)}
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