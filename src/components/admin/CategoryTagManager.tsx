import React, { useState, useEffect } from 'react';
import { Plus, X, Search, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CategoryTagManagerProps {
  type: 'category' | 'tag';
  onAdd: (item: { name: string; slug: string }) => void;
  onClose: () => void;
}

interface Suggestion {
  id: string;
  name: string;
  slug: string;
}

export const CategoryTagManager: React.FC<CategoryTagManagerProps> = ({ type, onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (name.trim().length >= 2) {
      searchExisting(name);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [name]);

  const searchExisting = async (searchTerm: string) => {
    try {
      setLoading(true);
      const table = type === 'category' ? 'blog_categories' : 'blog_tags';
      
      const { data, error } = await supabase
        .from(table)
        .select('id, name, slug')
        .ilike('name', `%${searchTerm}%`)
        .limit(5);

      if (error) throw error;
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const slug = generateSlug(name);
      const table = type === 'category' ? 'blog_categories' : 'blog_tags';

      // First check if the slug already exists
      const { data: existingBySlug, error: slugError } = await supabase
        .from(table)
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();

      if (slugError) throw slugError;

      // Also check if the name exists (case-insensitive)
      const { data: existingByName, error: nameError } = await supabase
        .from(table)
        .select('name')
        .ilike('name', name.trim())
        .maybeSingle();

      if (nameError) throw nameError;

      if (existingBySlug || existingByName) {
        throw new Error(`This ${type} already exists`);
      }

      // If no duplicate found, insert the new item
      const insertData = {
        name: name.trim(),
        slug
      };

      // Only add description for categories
      if (type === 'category') {
        insertData['description'] = `Articles about ${name.trim()}`;
      }

      const { data, error: insertError } = await supabase
        .from(table)
        .insert([insertData])
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') { // Unique violation
          throw new Error(`This ${type} already exists`);
        }
        throw insertError;
      }

      if (!data) {
        throw new Error(`Failed to create ${type}`);
      }

      onAdd({ name: data.name, slug: data.slug });
      onClose();
    } catch (err) {
      console.error(`Error creating ${type}:`, err);
      setError(err.message || `Failed to create ${type}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    onAdd({ name: suggestion.name, slug: suggestion.slug });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-emerald dark:text-sage">
              Add New {type.charAt(0).toUpperCase() + type.slice(1)}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                           focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg"
                  placeholder={`Search or enter new ${type} name`}
                  required
                  maxLength={50}
                  pattern="[A-Za-z0-9\s\-]+"
                  title="Only letters, numbers, spaces, and hyphens are allowed"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-surface rounded-lg shadow-lg 
                             border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full px-4 py-2 text-left flex items-center justify-between
                               hover:bg-emerald/5 dark:hover:bg-sage/5 transition-colors duration-200"
                    >
                      <span className="text-emerald dark:text-sage">{suggestion.name}</span>
                      <ChevronRight className="w-4 h-4 text-emerald/60 dark:text-sage/60" />
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="mt-2 text-sm text-emerald/60 dark:text-sage/60">
                  Searching...
                </div>
              )}
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
                type="submit"
                disabled={saving || !name.trim()}
                className="px-4 py-2 bg-emerald text-white rounded-lg hover:bg-emerald-700
                         transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-2"
              >
                {saving ? 'Saving...' : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add {type}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};