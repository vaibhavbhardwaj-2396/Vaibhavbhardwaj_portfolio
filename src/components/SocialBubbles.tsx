import React from 'react';
import { Linkedin, Mail, FileText } from 'lucide-react';

export const SocialBubbles = () => {
  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="social-bubbles-container">
      <a
        href="https://in.linkedin.com/in/bhardwajvaibhav"
        target="_blank"
        rel="noopener noreferrer"
        className="social-bubble"
        aria-label="LinkedIn Profile"
      >
        <Linkedin className="w-5 h-5" />
      </a>
      <a
        href="#contact"
        onClick={scrollToContact}
        className="social-bubble"
        aria-label="Contact Section"
      >
        <Mail className="w-5 h-5" />
      </a>
      <a
        href="/resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="social-bubble"
        aria-label="Download Resume"
      >
        <FileText className="w-5 h-5" />
      </a>
    </div>
  );
};