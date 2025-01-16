import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BlogNavigation } from './BlogNavigation';
import { BlogFooter } from './BlogFooter';
import { ThemeToggle } from '../ThemeToggle';
import { CTABanner } from './CTABanner';
import { NewsletterModal } from './NewsletterModal';

const CTA_INITIAL_DELAY = 10000; // 10 seconds
const CTA_INTERVAL = 300000; // 5 minutes
const CTA_SESSION_KEY = 'lastCTATime';

export const BlogLayout = () => {
  const [showCTA, setShowCTA] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Clear session when component unmounts (user leaves blog)
    return () => {
      sessionStorage.removeItem(CTA_SESSION_KEY);
    };
  }, []);

  useEffect(() => {
    const lastCTATime = sessionStorage.getItem(CTA_SESSION_KEY);
    const currentTime = Date.now();

    const showCTAPrompt = () => {
      setShowCTA(true);
      sessionStorage.setItem(CTA_SESSION_KEY, currentTime.toString());
    };

    // Initial CTA display
    const initialTimer = setTimeout(() => {
      if (!lastCTATime) {
        showCTAPrompt();
      }
    }, CTA_INITIAL_DELAY);

    // Recurring CTA display
    const intervalTimer = setInterval(() => {
      const lastTime = sessionStorage.getItem(CTA_SESSION_KEY);
      if (!lastTime || (currentTime - parseInt(lastTime)) >= CTA_INTERVAL) {
        showCTAPrompt();
      }
    }, CTA_INTERVAL);

    // Reset timers when location changes
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [location]);

  const handleContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#contact';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-bg transition-colors duration-300">
      <ThemeToggle />
      <BlogNavigation />
      
      {/* Main content with top padding for navigation */}
      <main className="flex-grow pt-24 w-full">
        <div className="w-full lg:w-[90%] mx-auto px-4 md:px-8">
          <Outlet />
        </div>
      </main>

      <BlogFooter />
      
      {showCTA && (
        <CTABanner 
          onClose={() => {
            setShowCTA(false);
            // Update last CTA time when manually closed
            sessionStorage.setItem(CTA_SESSION_KEY, Date.now().toString());
          }}
          onSubscribe={() => {
            setShowCTA(false);
            setShowNewsletter(true);
            // Update last CTA time when subscribing
            sessionStorage.setItem(CTA_SESSION_KEY, Date.now().toString());
          }}
          onContact={handleContact}
        />
      )}
      
      {showNewsletter && (
        <NewsletterModal 
          onClose={() => {
            setShowNewsletter(false);
            // Update last CTA time when closing newsletter
            sessionStorage.setItem(CTA_SESSION_KEY, Date.now().toString());
          }} 
        />
      )}
    </div>
  );
};