import React, { useEffect, useState } from 'react';
import { Lightbulb, Users, Glasses, Database } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ExpertiseArea {
  id: string;
  title: string;
  description: string;
  icon: string;
  is_active: boolean;
  order_index: number;
}

const defaultExpertiseData = [
  {
    title: 'Digital Transformation',
    icon: 'Lightbulb',
    description: 'Guiding organizations through comprehensive digital evolution with strategic roadmaps and innovative solutions'
  },
  {
    title: 'CIO Advisory',
    icon: 'Users',
    description: 'Strategic IT leadership consultation focusing on technology alignment with business objectives'
  },
  {
    title: 'AR/VR Solutions',
    icon: 'Glasses',
    description: 'Implementation of immersive technologies for enhanced business operations and customer experiences'
  },
  {
    title: 'Data Analytics',
    icon: 'Database',
    description: 'Leveraging data-driven insights to optimize decision-making and business performance'
  }
];

const iconMap = {
  Lightbulb,
  Users,
  Glasses,
  Database
};

export const Expertise = () => {
  const [expertiseAreas, setExpertiseAreas] = useState<ExpertiseArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpertise = async () => {
      try {
        const { data, error } = await supabase
          .from('expertise_areas')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
          .limit(4);

        if (error) throw error;
        setExpertiseAreas(data || []);
      } catch (error) {
        console.error('Error fetching expertise areas:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpertise();

    const subscription = supabase
      .channel('expertise_areas_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'expertise_areas' 
        }, 
        payload => {
          if (payload.eventType === 'INSERT') {
            setExpertiseAreas(prev => [...prev, payload.new as ExpertiseArea]
              .sort((a, b) => a.order_index - b.order_index)
              .slice(0, 4));
          } else if (payload.eventType === 'DELETE') {
            setExpertiseAreas(prev => prev.filter(area => area.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setExpertiseAreas(prev => prev.map(area => 
              area.id === payload.new.id ? payload.new as ExpertiseArea : area
            ).sort((a, b) => a.order_index - b.order_index));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const areasToDisplay = expertiseAreas.length > 0 ? expertiseAreas : defaultExpertiseData;

  return (
    <section id="expertise" className="block-section mt-12">
      <h2 className="section-title">Areas of Expertise</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {areasToDisplay.map((item) => {
          const Icon = iconMap[item.icon] || Lightbulb;
          return (
            <div 
              key={item.id || item.title} 
              className="block-card group transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white group-hover:text-sage transition-colors duration-300" />
                </div>
                <h3 className="card-title text-lg mb-2">{item.title}</h3>
                <p className="card-subtitle text-sm">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};