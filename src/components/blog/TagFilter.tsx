import React from 'react';
import { X } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onTagRemove: (tag: string) => void;
}

export const TagFilter = ({ tags, selectedTags, onTagSelect, onTagRemove }: TagFilterProps) => {
  return (
    <div className="space-y-4">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <button
              key={tag}
              onClick={() => onTagRemove(tag)}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald dark:bg-sage
                       text-white hover:bg-emerald-700 dark:hover:bg-sage/80
                       transition-colors duration-300"
            >
              {tag}
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {tags.filter(tag => !selectedTags.includes(tag)).map(tag => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className="px-3 py-1 rounded-full bg-emerald/10 dark:bg-sage/10
                     text-emerald dark:text-sage hover:bg-emerald/20 dark:hover:bg-sage/20
                     transition-colors duration-300"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};