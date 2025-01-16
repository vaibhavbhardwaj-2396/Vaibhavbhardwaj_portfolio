import React, { useState } from 'react';
import { Mail, MapPin, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const { error } = await supabase
        .from('contacts')
        .insert([formData]);

      if (error) throw error;

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  return (
    <section id="contact" className="block-section">
      <h2 className="section-title">Get in Touch</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sage mb-2">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={2}
                className="w-full px-4 py-2 rounded-lg bg-emerald-700/30 border border-sage/20 
                         focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sage mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-emerald-700/30 border border-sage/20 
                         focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sage mb-2">Message</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={handleChange}
                required
                minLength={10}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-emerald-700/30 border border-sage/20 
                         focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 px-6 bg-sage text-emerald-700 rounded-lg font-semibold
                       hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
              <Send className="w-4 h-4" />
            </button>
            {status === 'success' && (
              <p className="text-green-400 text-center">Message sent successfully!</p>
            )}
            {status === 'error' && (
              <p className="text-red-400 text-center">Error sending message. Please try again.</p>
            )}
          </form>
        </div>
        <div className="space-y-6 mt-8 md:mt-0">
          <div className="block-card">
            <div className="flex items-center gap-4">
              <Mail className="w-6 h-6 text-sage" />
              <div>
                <h3 className="font-playfair text-xl">Email</h3>
                <p className="text-sage">contact@vaibhavbhardwaj.com</p>
              </div>
            </div>
          </div>
          <div className="block-card">
            <div className="flex items-center gap-4">
              <MapPin className="w-6 h-6 text-sage" />
              <div>
                <h3 className="font-playfair text-xl">Location</h3>
                <p className="text-sage">Delhi/Bengaluru, India</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};