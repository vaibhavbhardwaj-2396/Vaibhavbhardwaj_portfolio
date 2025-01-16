import React, { useEffect, useState } from 'react';
import { Trophy, Award, Star } from 'lucide-react';
import { supabase, handleSupabaseError } from '../lib/supabase';

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  media_url: string | null;
  is_featured: boolean;
  order_index: number;
  company: {
    name: string;
  } | null;
}

const defaultAchievements = [
  {
    title: 'Forbes India D2C Top 100',
    icon: Trophy,
    description: 'Recognition for digital transformation excellence'
  },
  {
    title: 'National Competition Wins',
    icon: Award,
    description: 'Multiple awards in technology innovation'
  },
  {
    title: 'Leadership Recognition',
    icon: Star,
    description: 'Outstanding team leadership and project delivery'
  }
];

export const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from('achievements')
          .select(`
            *,
            company:companies(name)
          `)
          .order('order_index', { ascending: true });

        if (error) throw error;
        setAchievements(data || []);
      } catch (error) {
        const errorMessage = handleSupabaseError(error);
        console.error('Error fetching achievements:', error);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();

    const subscription = supabase
      .channel('achievements_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'achievements' 
        }, 
        async payload => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const { data, error } = await supabase
              .from('achievements')
              .select(`*, company:companies(name)`)
              .eq('id', payload.new.id)
              .single();

            if (!error && data) {
              if (payload.eventType === 'INSERT') {
                setAchievements(prev => [...prev, data].sort((a, b) => a.order_index - b.order_index));
              } else {
                setAchievements(prev => prev.map(achievement => 
                  achievement.id === data.id ? data : achievement
                ).sort((a, b) => a.order_index - b.order_index));
              }
            }
          } else if (payload.eventType === 'DELETE') {
            setAchievements(prev => prev.filter(achievement => achievement.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <section id="achievements" className="block-section">
        <h2 className="section-title">Achievements</h2>
        <div className="flex justify-center">
          <div className="text-sage">Loading achievements...</div>
        </div>
      </section>
    );
  }

  const achievementsToDisplay = achievements.length > 0 ? achievements : defaultAchievements;

  return (
    <section id="achievements" className="block-section">
      <h2 className="section-title">Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {achievementsToDisplay.map((achievement, index) => {
          const Icon = achievement.icon || 
            (achievement.title?.toLowerCase().includes('award') ? Award :
             achievement.title?.toLowerCase().includes('recognition') ? Star :
             Trophy);

          return (
            <div key={achievement.id || index} className="block-card text-center group">
              <div className="mb-4">
                <Icon className="w-10 h-10 mx-auto text-sage group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-playfair">{achievement.title}</h3>
              <p className="text-sage mt-2">{achievement.description}</p>
              {achievement.company && (
                <p className="text-sm text-sage/80 mt-2">@{achievement.company.name}</p>
              )}
              {achievement.media_url && (
                <a
                  href={achievement.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-sage hover:text-white transition-colors duration-300 mt-2 inline-block"
                >
                  View Certificate
                </a>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};