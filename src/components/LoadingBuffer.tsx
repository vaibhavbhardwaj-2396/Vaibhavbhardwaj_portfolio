import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingBufferProps {
  message?: string;
  tip?: string;
}

export const LoadingBuffer: React.FC<LoadingBufferProps> = ({ 
  message = 'Loading content...',
  tip = 'This might take a moment'
}) => {
  const tips = [
    'Fetching the latest data...',
    'Almost there...',
    'Preparing your content...',
    'Just a moment longer...',
    'Loading awesome content...'
  ];

  const [currentTip, setCurrentTip] = React.useState(tip);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald/20 dark:bg-sage/20" />
          <div className="relative">
            <Loader2 className="w-12 h-12 text-emerald dark:text-sage animate-spin" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-montserrat text-emerald dark:text-sage">
            {message}
          </h3>
          <p className="text-sm text-emerald/60 dark:text-sage/60 animate-pulse">
            {currentTip}
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="w-2 h-2 rounded-full bg-emerald/30 dark:bg-sage/30 animate-bounce"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};