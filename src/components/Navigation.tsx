import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const menuItems = [
    { name: 'About', path: '/#about' },
    { name: 'Experience', path: '/#experience' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/#contact' }
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-[60] flex justify-center">
      <nav 
        className={`
          transition-all duration-[500ms] ease-in-out origin-center w-full
          ${isScrolled 
            ? 'md:w-[600px] mt-4 rounded-2xl bg-gradient-to-r from-emerald/90 to-emerald-700/90 backdrop-blur-sm py-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)] border border-white/10 dark:border-white/5' 
            : 'bg-transparent py-6'
          }
        `}
      >
        <div className={`
          px-6 flex justify-between items-center mx-auto relative
          ${isScrolled ? 'max-w-full' : 'max-w-7xl'}
        `}>
          <Link 
            to="/"
            onClick={scrollToTop}
            className={`font-playfair text-xl transition-colors duration-[400ms]
              ${isScrolled 
                ? 'text-white hover:text-sage' 
                : 'text-emerald dark:text-sage hover:text-emerald-700 dark:hover:text-white'}`}
          >
            Vaibhav
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm dark:bg-dark-surface/10"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-emerald dark:text-sage'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-emerald dark:text-sage'}`} />
            )}
          </button>

          <div className={`
            md:flex items-center space-x-8
            ${isMenuOpen 
              ? 'absolute top-full left-0 w-full bg-emerald/95 dark:bg-dark-surface/95 backdrop-blur-sm mt-2 p-4 space-y-4 md:space-y-0 shadow-lg border border-white/10' 
              : 'hidden md:flex'
            }
          `}>
            {menuItems.map(item => (
              item.path.startsWith('/#') ? (
                <a
                  key={item.name}
                  href={item.path}
                  onClick={(e) => scrollToSection(e, item.path.substring(2))}
                  className={`transition-colors duration-[500ms]
                    ${isScrolled || isMenuOpen
                      ? 'text-white hover:text-sage' 
                      : 'text-emerald dark:text-sage hover:text-emerald-700 dark:hover:text-white'
                    }`}
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`transition-colors duration-[500ms]
                    ${isScrolled || isMenuOpen
                      ? 'text-white hover:text-sage' 
                      : 'text-emerald dark:text-sage hover:text-emerald-700 dark:hover:text-white'
                    } ${location.pathname === item.path ? 'font-semibold' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};