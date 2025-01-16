import React, { useEffect, useState } from 'react';
import { GraduationCap, Calendar, Award, ExternalLink } from 'lucide-react';
import { supabase, handleSupabaseError } from '../../lib/supabase';

interface Education {
  id: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  grade: string;
  achievements: string[];
  order_index: number;
  institution: {
    name: string;
    location: string;
  };
}

interface Certification {
  id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  credential_url: string;
  category: string;
}

const defaultEducation = [
  {
    degree: 'MBA',
    field_of_study: 'Business Administration',
    institution: { name: 'NMIMS Mumbai', location: 'Mumbai, India' },
    start_date: '2018-07-01',
    end_date: '2020-06-30',
    achievements: ['Dean\'s List', 'Student Council Member']
  },
  {
    degree: 'B.Tech',
    field_of_study: 'Computer Science',
    institution: { name: 'GGSIPU', location: 'Delhi, India' },
    start_date: '2014-07-01',
    end_date: '2018-06-30',
    achievements: ['Technical Committee Lead', 'Programming Contest Winner']
  }
];

export const Education = () => {
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certification | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch education data
        const { data: eduData, error: eduError } = await supabase
          .from('education')
          .select(`
            *,
            institution:institutions(name, location)
          `)
          .order('order_index', { ascending: true });

        if (eduError) throw eduError;
        setEducation(eduData || []);

        // Fetch certification data
        const { data: certData, error: certError } = await supabase
          .from('certifications')
          .select('*')
          .order('issue_date', { ascending: false });

        if (certError) throw certError;
        setCertifications(certData || []);
      } catch (error) {
        const errorMessage = handleSupabaseError(error);
        console.error('Error fetching education data:', error);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscription setup...
  }, []);

  const educationToDisplay = education.length > 0 ? education : defaultEducation;

  return (
    <>
      {/* Education Timeline Section */}
      <section id="education" className="block-section mb-12">
        <h2 className="section-title">Education Timeline</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-0 md:left-1/2 h-full w-0.5 bg-sage/20 transform -translate-x-1/2"></div>
          
          {educationToDisplay.map((item, index) => (
            <div 
              key={item.id || index}
              className={`relative flex items-center mb-8 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-0 md:left-1/2 w-4 h-4 bg-sage rounded-full transform -translate-x-1/2"></div>
              
              {/* Content */}
              <div className={`w-full md:w-1/2 ${
                index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
              }`}>
                <div className="block-card">
                  <div className="flex items-start gap-4">
                    <GraduationCap className="w-6 h-6 text-sage flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-playfair">
                        {item.degree} in {item.field_of_study}
                      </h3>
                      <p className="text-sage mt-1">{item.institution?.name}</p>
                      <p className="text-sm text-sage/80 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.start_date).getFullYear()} - {
                          item.end_date ? new Date(item.end_date).getFullYear() : 'Present'
                        }
                      </p>
                      {item.achievements?.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {item.achievements.map((achievement, idx) => (
                            <li key={idx} className="text-sm text-sage/70 flex items-start gap-2">
                              <Award className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications Gallery Section */}
      <section id="certifications" className="block-section">
        <h2 className="section-title">Professional Certifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert) => (
            <div 
              key={cert.id}
              className="block-card group cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => setSelectedCertificate(cert)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-playfair">{cert.name}</h3>
                  <p className="text-sage mt-1">{cert.issuing_organization}</p>
                  <p className="text-sm text-sage/80 mt-1">
                    {new Date(cert.issue_date).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sage hover:text-white transition-colors duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certificate Modal */}
      {selectedCertificate && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedCertificate(null)}
        >
          <div 
            className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-playfair text-emerald dark:text-sage mb-4">
              {selectedCertificate.name}
            </h3>
            <div className="space-y-4">
              <p className="text-emerald dark:text-sage">
                <strong>Issuing Organization:</strong> {selectedCertificate.issuing_organization}
              </p>
              <p className="text-emerald dark:text-sage">
                <strong>Issue Date:</strong> {
                  new Date(selectedCertificate.issue_date).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })
                }
              </p>
              {selectedCertificate.credential_url && (
                <a
                  href={selectedCertificate.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald hover:text-emerald-700 
                           dark:text-sage dark:hover:text-white transition-colors duration-300"
                >
                  View Certificate <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};