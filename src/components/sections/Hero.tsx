import React, { useEffect, useState } from 'react';
import { Counter } from '../Counter';
import heroImage from '../../assets/Hero Image/hero_image.jpeg';

const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return <span>{displayText}</span>;
};

export const Hero = () => {
  const [imageKey] = useState(() => Date.now());

  return (
    <section id="hero" className="min-h-[90vh] flex items-center py-20 md:py-0">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-4">
        <div className="space-y-8 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-bold leading-tight text-emerald dark:text-sage">
            <TypewriterText text="Thinker." />
            <br />
            <TypewriterText text="Strategist." />
            <br />
            <TypewriterText text="Innovator." />
          </h1>
          <p className="text-xl text-emerald-700 dark:text-dark-text/80">Consultant @KPMG</p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="block-section p-4 md:p-8">
              <Counter end={4} suffix="+" label="Years Experience" />
            </div>
            <div className="block-section p-4 md:p-8">
              <Counter end={7} suffix="+" label="Clients Served" />
            </div>
            <div className="block-section p-4 md:p-8">
              <Counter end={11} suffix="+" label="Projects Delivered" />
            </div>
          </div>
        </div>
        
        <div className="relative h-[400px] md:h-[600px] hidden md:block">
          <div className="absolute inset-0 bg-emerald/10 dark:bg-sage/5 rounded-2xl -rotate-6 transform transition-all duration-300"></div>
          <img
            src={heroImage}
            alt="Professional Portrait"
            className="absolute inset-0 w-full h-full object-cover object-center rounded-2xl shadow-lg"
            key={imageKey}
            onError={(e) => {
              console.error('Hero image failed to load:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        
        <div className="md:hidden w-48 h-48 mx-auto">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-emerald/10 dark:bg-sage/5 rounded-full transform transition-all duration-300"></div>
            <img
              src={heroImage}
              alt="Professional Portrait"
              className="w-full h-full object-cover object-center rounded-full shadow-lg"
              key={imageKey}
              onError={(e) => {
                console.error('Hero image failed to load:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
