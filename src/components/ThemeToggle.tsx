import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className="fixed z-[60] p-2 rounded-full transition-all duration-300
                bg-white dark:bg-[#2F2F2F] shadow-lg hover:shadow-xl
                transform hover:scale-110 focus:outline-none
                border border-emerald/10 dark:border-sage/10
                hover:border-emerald/20 dark:hover:border-sage/20
                md:right-12 md:top-12
                right-1/2 translate-x-1/2 top-7"
      onClick={() => setIsDark(!isDark)}
    >
      <div className="relative w-14 h-7 rounded-full bg-emerald/10 dark:bg-white/10 
                    transition-colors duration-300">
        <div className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-300 
                      ${isDark ? 'right-1 bg-sage' : 'left-1 bg-emerald'}`}>
          {isDark ? (
            <Moon className="w-3 h-3 absolute top-1 left-1 text-emerald" />
          ) : (
            <Sun className="w-3 h-3 absolute top-1 left-1 text-white" />
          )}
        </div>
      </div>
    </button>
  );
};