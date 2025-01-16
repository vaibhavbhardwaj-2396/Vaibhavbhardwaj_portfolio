import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-application-name': 'portfolio'
    }
  },
  db: {
    schema: 'public'
  }
});

// Enhanced error handling with more descriptive messages
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error:', error);
  
  // Network errors
  if (error.message === 'Failed to fetch' || error.code === 'NETWORK_ERROR') {
    return 'Connection issue detected. Please check your internet connection and try again.';
  }
  
  // Database connection errors
  if (error.code === 'PGRST301' || error.code?.startsWith('22')) {
    return 'Database connection error. Please try again later.';
  }
  
  // Authentication errors
  if (error.code?.startsWith('auth')) {
    return 'Authentication error. Please try logging in again.';
  }
  
  // Rate limiting
  if (error.code === '429') {
    return 'Too many requests. Please try again later.';
  }
  
  // Generic error with message
  if (error.message) {
    return error.message;
  }
  
  // Fallback error
  return 'An unexpected error occurred. Please try again later.';
};

// Improved connection check with timeout
export const checkSupabaseConnection = async () => {
  try {
    // Try a simple query with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    const queryPromise = supabase
      .from('companies')
      .select('count')
      .limit(1)
      .single();

    const { error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) {
      console.error('Supabase connection check error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase connection check failed:', err);
    return false;
  }
};

// Retry mechanism for failed requests
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Retry attempt ${i + 1} of ${maxRetries} failed:`, error);
      
      if (i < maxRetries - 1) {
        // Exponential backoff with jitter
        const jitter = Math.random() * 200;
        await new Promise(resolve => 
          setTimeout(resolve, delay * Math.pow(2, i) + jitter)
        );
      }
    }
  }
  
  throw lastError;
};