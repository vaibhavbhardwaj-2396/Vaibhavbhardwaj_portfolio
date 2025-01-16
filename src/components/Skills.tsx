import React, { useEffect, useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  is_featured: boolean;
  order_index: number;
}

const defaultSkills = [
  'Digital Strategy',
  'IT Advisory',
  'AR/VR',
  'Team Leadership',
  'Stakeholder Management',
  'Process Optimization',
  'Change Management',
  'Data Analytics'
];

export const Skills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('order_index', { ascending: true });

        if (error) throw error;
        setSkills(data || []);
      } catch (error) {
        const errorMessage = handleSupabaseError(error);
        console.error('Error fetching skills:', error);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();

    const subscription = supabase
      .channel('skills_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'skills' 
        }, 
        payload => {
          if (payload.eventType === 'INSERT') {
            setSkills(prev => [...prev, payload.new as Skill].sort((a, b) => a.order_index - b.order_index));
          } else if (payload.eventType === 'DELETE') {
            setSkills(prev => prev.filter(skill => skill.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setSkills(prev => prev.map(skill => 
              skill.id === payload.new.id ? payload.new as Skill : skill
            ).sort((a, b) => a.order_index - b.order_index));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const skillsToDisplay = skills.length > 0 ? skills : defaultSkills.map((name, index) => ({
    id: `default-${index}`,
    name,
    category: 'Default',
    proficiency: 4,
    is_featured: true,
    order_index: index + 1
  }));

  if (loading) {
    return (
      <section id="skills" className="block-section">
        <h2 className="section-title">Skills</h2>
        <div className="flex justify-center">
          <div className="text-sage">Loading skills...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="skills" className="block-section">
        <h2 className="section-title">Skills</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {defaultSkills.map((skill) => (
            <div
              key={skill}
              className="px-6 py-3 rounded-full bg-emerald-700/30 hover:bg-emerald-700/50 
                       text-sage hover:text-white transition-all duration-300 cursor-pointer"
            >
              {skill}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="block-section">
      <h2 className="section-title">Skills</h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {skillsToDisplay.map((skill) => (
          <div
            key={skill.id}
            className="px-6 py-3 rounded-full bg-emerald-700/30 hover:bg-emerald-700/50 
                     text-sage hover:text-white transition-all duration-300 cursor-pointer"
          >
            {skill.name}
          </div>
        ))}
      </div>
    </section>
  );
};