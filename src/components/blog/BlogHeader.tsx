import React from 'react';
import { ArrowUp } from 'lucide-react';

interface BlogHeaderProps {
  title: string;
  showScrollTop?: boolean;
}

export const BlogHeader: React.FC<BlogHeaderProps> = ({ title, showScrollTop = true }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="relative py-20">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold text-emerald dark:text-sage">
          {title}
        </h1>
        
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 rounded-full bg-emerald text-white 
                     hover:bg-emerald-700 transition-colors duration-300 shadow-lg
                     hover:shadow-xl transform hover:scale-105 z-50"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        )}
      </div>
    </header>
  );
};