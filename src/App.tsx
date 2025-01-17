import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CustomCursor } from './components/CustomCursor';
import { Header } from './components/layout/Header';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { BlogLayout } from './components/blog/BlogLayout';
import { BlogList } from './components/blog/BlogList';
import { BlogPost } from './components/blog/BlogPost';
import { useSecretCode } from './hooks/useSecretCode';
import {
  Hero,
  ScrollingBanner,
  About,
  Experience,
  Achievements,
  Education,
  Skills,
  Contact
} from './components/sections';
import { supabase } from './lib/supabase';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
  return <>{children}</>
};

const MainContent = () => {
  // Initialize the secret code hook
  useSecretCode();

  return (
    <div className="bg-white dark:bg-[#242424] text-emerald dark:text-[#E1E1E1] min-h-screen transition-colors duration-300">
      <CustomCursor />
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
        <Hero />
        <ScrollingBanner />
        <About />
        <Experience />
        <Achievements />
        <Education />
        <Skills />
        <Contact />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/blog/*" element={<BlogLayout />}>
          <Route index element={<BlogList />} />
          <Route path=":slug" element={<BlogPost />} />
          <Route path="tag/:tag" element={<BlogList />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
