import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, checkSupabaseConnection } from '../../lib/supabase';
import { DataTable } from './DataTable';
import { BlogManager } from './BlogManager';
import { 
  Settings, Users, Award, Briefcase, GraduationCap, 
  MessageSquare, Trophy, AlertTriangle, Loader2, 
  FileText, Lightbulb, LogOut, BookOpen 
} from 'lucide-react';
import { AdminLogin } from './AdminLogin';

type TableName = 'companies' | 'experiences' | 'education' | 'certifications' | 
                'skills' | 'contacts' | 'achievements' | 'about_me' | 
                'expertise_areas' | 'blog';

export const AdminDashboard = () => {
  const [session, setSession] = useState(null);
  const [activeTable, setActiveTable] = useState<TableName>('contacts');
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('admin-page');

    const initializeAdmin = async () => {
      try {
        // First check if we have a session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error('Authentication error. Please try logging in again.');
        }

        // If no session, don't proceed with connection check
        if (!currentSession) {
          setSession(null);
          setLoading(false);
          return;
        }

        // Check database connection
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          throw new Error('Unable to connect to the database. Please try again later.');
        }

        setSession(currentSession);
      } catch (error) {
        console.error('Admin initialization error:', error);
        setConnectionError(error.message || 'An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeAdmin();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/admin');
      }
    });

    return () => {
      subscription.unsubscribe();
      document.body.classList.remove('admin-page');
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setConnectionError('Failed to sign out. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="flex items-center gap-3 text-emerald dark:text-sage">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="bg-white dark:bg-dark-surface p-8 rounded-lg shadow-xl max-w-md mx-4">
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <AlertTriangle className="w-8 h-8" />
            <h2 className="text-xl font-semibold">Connection Error</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{connectionError}</p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-emerald text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-4 py-2 border border-emerald text-emerald rounded-lg hover:bg-emerald/10 transition-colors duration-200"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AdminLogin />;
  }

  const tables = [
    { name: 'about_me', icon: FileText, label: 'About Me' },
    { name: 'expertise_areas', icon: Lightbulb, label: 'Areas of Expertise' },
    { name: 'companies', icon: Settings, label: 'Companies' },
    { name: 'experiences', icon: Briefcase, label: 'Experience' },
    { name: 'education', icon: GraduationCap, label: 'Education' },
    { name: 'certifications', icon: Award, label: 'Certifications' },
    { name: 'achievements', icon: Trophy, label: 'Achievements' },
    { name: 'skills', icon: Users, label: 'Skills' },
    { name: 'contacts', icon: MessageSquare, label: 'Contact Messages' },
    { name: 'blog', icon: BookOpen, label: 'Blog Posts' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-dark-surface shadow-lg h-screen fixed">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-emerald dark:text-sage">Admin Dashboard</h2>
            <button
              onClick={handleLogout}
              className="text-emerald hover:text-emerald-700 dark:text-sage dark:hover:text-white
                       transition-colors duration-300"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <nav className="mt-4">
            {tables.map(({ name, icon: Icon, label }) => (
              <button
                key={name}
                onClick={() => setActiveTable(name as TableName)}
                className={`w-full flex items-center gap-2 px-4 py-3 text-left
                          ${activeTable === name 
                            ? 'bg-emerald text-white' 
                            : 'text-emerald hover:bg-emerald/10 dark:text-sage dark:hover:bg-sage/10'
                          }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          {activeTable === 'blog' ? (
            <BlogManager />
          ) : (
            <DataTable tableName={activeTable} />
          )}
        </div>
      </div>
    </div>
  );
};