import React, { useEffect, useState } from 'react';
import { Sparkles, Lightbulb, Users, Glasses, Database } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AboutContent {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  order_index: number;
}

interface ExpertiseArea {
  id: string;
  title: string;
  description: string;
  icon: string;
  is_active: boolean;
  order_index: number;
}

const defaultContent = {
  title: 'Driving Digital Innovation',
  description: `As a CIO Advisory consultant with deep expertise in Next Generation Technologies, I bridge the gap between business strategy and technological innovation. With an MBA from NMIMS Mumbai and extensive experience in digital transformation, I help organizations navigate their digital evolution journey with precision and purpose.`
};

const defaultExpertiseData = [
  {
    title: 'Digital Transformation',
    icon: 'Lightbulb',
    description: 'Guiding organizations through comprehensive digital evolution'
  },
  {
    title: 'CIO Advisory',
    icon: 'Users',
    description: 'Strategic IT leadership and technology alignment'
  },
  {
    title: 'AR/VR Solutions',
    icon: 'Glasses',
    description: 'Implementation of immersive technologies'
  },
  {
    title: 'Data Analytics',
    icon: 'Database',
    description: 'Data-driven insights for optimal decisions'
  }
];

const iconMap = {
  Lightbulb,
  Users,
  Glasses,
  Database
};

export const About = () => {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [expertiseAreas, setExpertiseAreas] = useState<ExpertiseArea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch about content
        const { data: aboutData } = await supabase
          .from('about_me')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
          .limit(1)
          .single();

        if (aboutData) setContent(aboutData);

        // Fetch expertise areas
        const { data: expertiseData } = await supabase
          .from('expertise_areas')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
          .limit(4);

        if (expertiseData) setExpertiseAreas(expertiseData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up subscriptions for real-time updates
    const aboutSubscription = supabase
      .channel('about_me_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'about_me' }, 
        payload => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setContent(payload.new as AboutContent);
          }
        })
      .subscribe();

    const expertiseSubscription = supabase
      .channel('expertise_areas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expertise_areas' },
        payload => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setExpertiseAreas(prev => 
              [...prev, payload.new as ExpertiseArea]
                .sort((a, b) => a.order_index - b.order_index)
                .slice(0, 4)
            );
          }
        })
      .subscribe();

    return () => {
      aboutSubscription.unsubscribe();
      expertiseSubscription.unsubscribe();
    };
  }, []);

  const displayContent = content || defaultContent;
  const areasToDisplay = expertiseAreas.length > 0 ? expertiseAreas : defaultExpertiseData;

  return (
    <section id="about" className="block-section">
      <div className="space-y-12">
        {/* About Content */}
        <div className="relative">
          <h2 className="section-title flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-sage" />
            {displayContent.title}
          </h2>
          <div className="mt-8">
            <p className="text-lg text-sage/90 leading-relaxed max-w-3xl mx-auto text-center">
              {displayContent.description}
            </p>
          </div>
        </div>

        {/* Expertise Cards */}
        <div className="pt-8 border-t border-white/10">
          <h3 className="text-2xl font-playfair text-center mb-8">Areas of Expertise</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {areasToDisplay.map((item) => {
              const Icon = iconMap[item.icon] || Lightbulb;
              return (
                <div 
                  key={item.id || item.title} 
                  className="block-card group transform transition-all duration-300 hover:scale-105"
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
        </div>
      </div>
    </section>
  );
};