import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertTriangle } from 'lucide-react';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First validate the email
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      if (!adminEmail) {
        throw new Error('Admin configuration error. Please contact support.');
      }

      if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
        throw new Error('Access denied. Invalid credentials.');
      }

      // Attempt login
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (authError) {
        throw new Error('Access denied. Invalid credentials.');
      }

      if (!data?.user) {
        throw new Error('Login failed. Please try again.');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-emerald dark:text-sage">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please sign in to access the admin dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border
                         border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900
                         dark:text-white focus:outline-none focus:ring-emerald
                         focus:border-emerald focus:z-10 sm:text-sm
                         bg-white dark:bg-dark-surface
                         transition-all duration-300"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border
                         border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900
                         dark:text-white focus:outline-none focus:ring-emerald
                         focus:border-emerald focus:z-10 sm:text-sm
                         bg-white dark:bg-dark-surface
                         transition-all duration-300"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent
                       text-sm font-medium rounded-md text-white bg-emerald hover:bg-emerald-700
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300 transform hover:scale-[1.02]
                       shadow-md hover:shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};