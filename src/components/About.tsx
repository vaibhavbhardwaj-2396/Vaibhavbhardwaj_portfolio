import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AboutContent {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  order_index: number;
}

const defaultContent = {
  title: 'Driving Digital Transformation',
  description: 'CIO Advisory consultant with expertise in Next Generation Technologies and MBA from NMIMS Mumbai. Specializing in strategic business growth and digital transformation initiatives.'
};

export const About = () => {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('about_me')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
          .limit(1)
          .single();

        if (error) throw error;
        setContent(data);
      } catch (error) {
        console.error('Error fetching about content:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();

    const subscription = supabase
      .channel('about_me_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'about_me' 
        }, 
        payload => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setContent(payload.new as AboutContent);
          } else if (payload.eventType === 'DELETE' && content?.id === payload.old.id) {
            setContent(null);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const displayContent = content || defaultContent;

  return (
    <section id="about" className="block-section">
      <h2 className="section-title">{displayContent.title}</h2>
      <p className="text-lg text-sage mt-6">
        {displayContent.description}
      </p>
    </section>
  );
}