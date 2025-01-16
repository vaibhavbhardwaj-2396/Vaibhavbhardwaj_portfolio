import React from 'react';
import { X } from 'lucide-react';

interface CTABannerProps {
  onClose: () => void;
  onSubscribe: () => void;
  onContact: () => void;
}

export const CTABanner: React.FC<CTABannerProps> = ({ onClose, onSubscribe, onContact }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-emerald text-white py-4 shadow-lg z-40 animate-slideUp">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Stay Connected!</h3>
          <p className="text-sm text-white/80">Get the latest insights and updates delivered to your inbox.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onSubscribe}
            className="px-4 py-2 bg-white text-emerald rounded-lg hover:bg-sage 
                     transition-colors duration-300 whitespace-nowrap font-medium"
          >
            Subscribe Now
          </button>
          <button
            onClick={onContact}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 
                     transition-colors duration-300 whitespace-nowrap"
          >
            Contact Me
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors duration-300"
            aria-label="Close banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};