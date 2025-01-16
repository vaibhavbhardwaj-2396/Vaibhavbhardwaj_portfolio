import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// The secret code will be: ArrowUp, ArrowUp, ArrowDown, ArrowDown, a
const SECRET_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'a'];
const CODE_TIMEOUT = 5000; // 5 seconds to complete the sequence

export const useSecretCode = () => {
  const [keys, setKeys] = useState<string[]>([]);
  const navigate = useNavigate();

  const checkSequence = useCallback((sequence: string[]) => {
    return SECRET_CODE.every((code, index) => sequence[index] === code);
  }, []);

  const handleAdminAccess = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If not logged in, try to sign in with admin email
        const { error } = await supabase.auth.signInWithPassword({
          email: import.meta.env.VITE_ADMIN_EMAIL,
          password: prompt('Enter admin password:') || ''
        });

        if (error) {
          console.error('Authentication error:', error);
          return;
        }
      }

      navigate('/admin');
    } catch (error) {
      console.error('Error accessing admin:', error);
    }
  }, [navigate]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Only prevent default for arrow keys
      if (event.key.startsWith('Arrow')) {
        event.preventDefault();
      }

      const newKeys = [...keys, event.key];
      const relevantKeys = newKeys.slice(-SECRET_CODE.length);
      setKeys(relevantKeys);

      // Check if the sequence matches
      if (checkSequence(relevantKeys)) {
        handleAdminAccess();
        setKeys([]);
        return;
      }

      // Reset the sequence after timeout
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setKeys([]);
      }, CODE_TIMEOUT);
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearTimeout(timeoutId);
    };
  }, [keys, navigate, checkSequence, handleAdminAccess]);
};