import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const BlogNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'About the Writer', path: '/#about' },
    { name: 'Contact', path: '/#contact' }
  ];

  const handleNavClick = (path: string) => {
    setIsOpen(false);
    if (path.startsWith('/#')) {
      const element = document.getElementById(path.substring(2));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If element not found on current page, navigate to home with hash
        window.location.href = path;
      }
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-emerald shadow-lg' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/blog" 
            className={`text-2xl font-montserrat font-bold ${
              isScrolled ? 'text-white' : 'text-emerald dark:text-sage'
            }`}
          >
            Blog
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-md ${
              isScrolled ? 'text-white hover:bg-white/10' : 'text-emerald dark:text-sage hover:bg-emerald/10'
            }`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                className={`${
                  isScrolled 
                    ? 'text-white hover:text-sage' 
                    : 'text-emerald dark:text-sage hover:text-emerald-700 dark:hover:text-white'
                } transition-colors duration-300 ${
                  location.pathname === item.path ? 'font-semibold' : ''
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ${
        isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
      }`}>
        <div className={`px-4 py-2 ${isScrolled ? 'bg-emerald' : 'bg-white dark:bg-dark-surface'} shadow-lg space-y-2`}>
          {navItems.map(item => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.path)}
              className={`block w-full text-left py-2 ${
                isScrolled 
                  ? 'text-white hover:text-sage' 
                  : 'text-emerald dark:text-sage hover:text-emerald-700 dark:hover:text-white'
              } transition-colors duration-300 ${
                location.pathname === item.path ? 'font-semibold' : ''
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};