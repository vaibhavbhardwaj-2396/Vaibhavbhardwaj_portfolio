import React, { useEffect, useState } from 'react';
import { Briefcase, ArrowRight } from 'lucide-react';
import { supabase, handleSupabaseError } from '../../lib/supabase';

interface Experience {
  id: string;
  role: string;
  company_id: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  highlights: string[];
  order_index: number;
  company: {
    name: string;
    industry: string;
  };
}

const defaultExperiences = [
  {
    company: 'KPMG',
    role: 'Digital Transformation Consultant',
    period: '2022 - Present',
    highlights: [
      'IT Cost Optimization initiatives resulting in 25% cost reduction',
      'Led AR/VR solution implementation for Fortune 500 client',
      'Drove strategic business growth through digital initiatives'
    ]
  },
  {
    company: 'Infosys Consulting',
    role: 'Senior Consultant',
    period: '2020 - 2022',
    highlights: [
      'Led digital transformation projects for banking clients',
      'Implemented AI-driven process automation solutions',
      'Managed cross-functional teams of 15+ members'
    ]
  }
];

export const Experience = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const { data, error } = await supabase
          .from('experiences')
          .select(`
            *,
            company:companies(name, industry)
          `)
          .order('order_index', { ascending: true });

        if (error) throw error;
        setExperiences(data || []);
      } catch (error) {
        const errorMessage = handleSupabaseError(error);
        console.error('Error fetching experiences:', error);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();

    const subscription = supabase
      .channel('experiences_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'experiences' 
        }, 
        async payload => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const { data, error } = await supabase
              .from('experiences')
              .select(`*, company:companies(name, industry)`)
              .eq('id', payload.new.id)
              .single();

            if (!error && data) {
              if (payload.eventType === 'INSERT') {
                setExperiences(prev => [...prev, data].sort((a, b) => a.order_index - b.order_index));
              } else {
                setExperiences(prev => prev.map(exp => 
                  exp.id === data.id ? data : exp
                ).sort((a, b) => a.order_index - b.order_index));
              }
            }
          } else if (payload.eventType === 'DELETE') {
            setExperiences(prev => prev.filter(exp => exp.id !== payload.old.id));
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
      <section id="experience" className="block-section">
        <h2 className="section-title">Experience</h2>
        <div className="flex justify-center">
          <div className="text-sage">Loading experiences...</div>
        </div>
      </section>
    );
  }

  const experiencesToDisplay = experiences.length > 0 ? experiences : defaultExperiences;
  const currentRole = experiencesToDisplay[0];
  const previousRoles = experiencesToDisplay.slice(1);

  return (
    <section id="experience" className="block-section">
      <h2 className="section-title">Experience</h2>
      <div className="space-y-8">
        {/* Current Role */}
        {currentRole && (
          <div className="block-card">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <Briefcase className="w-6 h-6 text-white flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="card-title">{currentRole.company?.name || currentRole.company}</h3>
                <p className="card-subtitle">{currentRole.role}</p>
                <p className="text-sm text-white/80">
                  {currentRole.start_date 
                    ? `${new Date(currentRole.start_date).getFullYear()} - ${currentRole.end_date ? new Date(currentRole.end_date).getFullYear() : 'Present'}`
                    : currentRole.period}
                </p>
                <ul className="space-y-2 mt-4">
                  {currentRole.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2 text-white/90">
                      <ArrowRight className="w-4 h-4 text-white flex-shrink-0 mt-1" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Previous Roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {previousRoles.map((exp, index) => (
            <div key={exp.id || index} className="block-card">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <Briefcase className="w-6 h-6 text-white flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="card-title">{exp.company?.name || exp.company}</h3>
                  <p className="card-subtitle">{exp.role}</p>
                  <p className="text-sm text-white/80">
                    {exp.start_date 
                      ? `${new Date(exp.start_date).getFullYear()} - ${exp.end_date ? new Date(exp.end_date).getFullYear() : 'Present'}`
                      : exp.period}
                  </p>
                  <ul className="space-y-2 mt-4">
                    {exp.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2 text-white/90">
                        <ArrowRight className="w-4 h-4 text-white flex-shrink-0 mt-1" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};