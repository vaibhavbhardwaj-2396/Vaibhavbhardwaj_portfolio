import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Mail, Loader2, CheckCircle } from 'lucide-react';

interface NewsletterSignupProps {
  onClose: () => void;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Here you would typically make an API call to your newsletter service
      // For now, we'll simulate a successful signup
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('success');
      setTimeout(onClose, 2000);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to subscribe. Please try again later.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-surface rounded-xl p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 
                   dark:text-gray-500 dark:hover:text-gray-300 rounded-full
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald/10 dark:bg-sage/10 rounded-full 
                        flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-emerald dark:text-sage" />
          </div>
          <h3 className="text-2xl font-bold text-emerald dark:text-sage mb-2">
            Stay Updated
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Get the latest posts and updates delivered straight to your inbox.
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full 
                          flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-green-600 dark:text-green-400">
              Thanks for subscribing! Check your email to confirm your subscription.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                         focus:ring-emerald focus:border-emerald bg-white dark:bg-dark-bg
                         text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-4 py-2 bg-emerald text-white rounded-lg
                       hover:bg-emerald-700 transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                'Subscribe to Newsletter'
              )}
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              By subscribing, you agree to our{' '}
              <Link to="/blog/privacy" className="text-emerald dark:text-sage hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};