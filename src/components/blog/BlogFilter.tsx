import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Tag } from 'lucide-react';
import { getFilterOptions } from '../../lib/blog';
import { useNavigate, useLocation } from 'react-router-dom';

interface FilterOption {
  label: string;
  value: string;
}

interface BlogFilterProps {
  selectedFilters: {
    year: string;
    month: string;
    category: string;
    readTime: string;
    tags: string[];
  };
  onFilterChange: (filterType: string, value: string | string[]) => void;
  onResetFilters: () => void;
}

export const BlogFilter: React.FC<BlogFilterProps> = ({
  selectedFilters,
  onFilterChange,
  onResetFilters,
}) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [options, setOptions] = useState<{
    years: FilterOption[];
    months: FilterOption[];
    categories: FilterOption[];
    readTimes: FilterOption[];
    tags: FilterOption[];
  }>({
    years: [],
    months: [],
    categories: [],
    readTimes: [],
    tags: []
  });

  useEffect(() => {
    const loadOptions = async () => {
      const filterOptions = await getFilterOptions();
      if (filterOptions) {
        setOptions({
          years: filterOptions.years.map(year => ({ label: year, value: year })),
          months: filterOptions.months.map(month => ({
            label: new Date(2024, parseInt(month) - 1).toLocaleString('default', { month: 'long' }),
            value: month
          })),
          categories: filterOptions.categories.map(cat => ({ label: cat, value: cat.toLowerCase() })),
          readTimes: filterOptions.readTimes.map(time => ({ 
            label: `${time} min read`, 
            value: time.toString() 
          })),
          tags: filterOptions.tags.map(tag => ({ label: tag, value: tag.toLowerCase() }))
        });
      }
    };

    loadOptions();
  }, []);

  const handleFilterChange = (type: string, value: string | string[]) => {
    const searchParams = new URLSearchParams(location.search);
    
    if (Array.isArray(value)) {
      if (value.length > 0) {
        searchParams.set('tags', value.join(','));
      } else {
        searchParams.delete('tags');
      }
    } else if (value) {
      searchParams.set(type, value);
    } else {
      searchParams.delete(type);
    }
    
    navigate(`/blog?${searchParams.toString()}`);
    onFilterChange(type, value);
  };

  const handleResetFilters = () => {
    navigate('/blog');
    onResetFilters();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const FilterDropdown = ({ 
    options, 
    value, 
    onChange, 
    type,
    label
  }: { 
    options: FilterOption[], 
    value: string, 
    onChange: (value: string) => void,
    type: string,
    label: string
  }) => {
    const isOpen = openFilter === type;

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-emerald dark:text-sage mb-2">
          {label}
        </label>
        <button
          onClick={() => setOpenFilter(isOpen ? null : type)}
          className="w-full px-4 py-2 rounded-lg bg-emerald/5 dark:bg-sage/5 
                   text-left flex items-center justify-between
                   hover:bg-emerald/10 dark:hover:bg-sage/10 transition-colors duration-300
                   border border-emerald/10 dark:border-sage/10"
        >
          <span className="text-emerald dark:text-sage">
            {value ? options.find(opt => opt.value === value)?.label : label}
          </span>
          <ChevronDown className={`w-4 h-4 text-emerald dark:text-sage transition-transform duration-300
                                ${isOpen ? 'transform rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-surface 
                        rounded-lg shadow-lg border border-emerald/10 dark:border-sage/10 py-2 z-50
                        max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value === value ? '' : option.value);
                  setOpenFilter(null);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-emerald/5 dark:hover:bg-sage/5
                          ${option.value === value
                            ? 'text-emerald dark:text-sage font-medium bg-emerald/5 dark:bg-sage/5' 
                            : 'text-emerald/80 dark:text-sage/80'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={filterRef} className="space-y-8">
      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FilterDropdown
          type="year"
          label="Year"
          options={options.years}
          value={selectedFilters.year}
          onChange={(value) => handleFilterChange('year', value)}
        />
        
        {selectedFilters.year && (
          <FilterDropdown
            type="month"
            label="Month"
            options={options.months}
            value={selectedFilters.month}
            onChange={(value) => handleFilterChange('month', value)}
          />
        )}

        <FilterDropdown
          type="category"
          label="Category"
          options={options.categories}
          value={selectedFilters.category}
          onChange={(value) => handleFilterChange('category', value)}
        />

        <FilterDropdown
          type="readTime"
          label="Read Time"
          options={options.readTimes}
          value={selectedFilters.readTime}
          onChange={(value) => handleFilterChange('readTime', value)}
        />
      </div>

      {/* Tags Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-emerald dark:text-sage">
          Tags
        </label>
        <div className="flex flex-wrap gap-3">
          {options.tags.map(tag => (
            <button
              key={tag.value}
              onClick={() => {
                const newTags = selectedFilters.tags.includes(tag.value)
                  ? selectedFilters.tags.filter(t => t !== tag.value)
                  : [...selectedFilters.tags, tag.value];
                handleFilterChange('tags', newTags);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full
                       transition-all duration-300 shadow-sm hover:shadow-md
                       ${selectedFilters.tags.includes(tag.value)
                         ? 'bg-emerald dark:bg-sage text-white'
                         : 'bg-emerald/10 dark:bg-sage/10 text-emerald dark:text-sage hover:bg-emerald/20 dark:hover:bg-sage/20'
                       }`}
            >
              <Tag className="w-4 h-4" />
              {tag.label}
              {selectedFilters.tags.includes(tag.value) && (
                <X className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      {(Object.values(selectedFilters).some(Boolean) || selectedFilters.tags.length > 0) && (
        <div className="flex justify-end">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-emerald dark:text-sage hover:bg-emerald/10 
                     dark:hover:bg-sage/10 rounded-lg transition-colors duration-300"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};