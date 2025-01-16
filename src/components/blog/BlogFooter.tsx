import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';

export const BlogFooter = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Twitter,
      href: 'https://twitter.com',
      label: 'Twitter'
    },
    {
      icon: Linkedin,
      href: 'https://linkedin.com/in/bhardwajvaibhav',
      label: 'LinkedIn'
    },
    {
      icon: Github,
      href: 'https://github.com',
      label: 'GitHub'
    },
    {
      icon: Mail,
      href: 'mailto:contact@vaibhavbhardwaj.com',
      label: 'Email'
    }
  ];

  return (
    <footer className="bg-emerald/5 dark:bg-emerald/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand and Copyright */}
          <div className="space-y-4">
            <Link to="/blog" className="text-2xl font-montserrat font-bold text-emerald dark:text-sage">
              Blog
            </Link>
            <p className="text-sm text-emerald/60 dark:text-sage/60">
              © {currentYear} Vaibhav Blog. All Rights Reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-montserrat font-semibold text-emerald dark:text-sage mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/blog/privacy" 
                  className="text-emerald/80 dark:text-sage/80 hover:text-emerald dark:hover:text-sage transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog/terms" 
                  className="text-emerald/80 dark:text-sage/80 hover:text-emerald dark:hover:text-sage transition-colors duration-300"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-montserrat font-semibold text-emerald dark:text-sage mb-4">
              Connect
            </h3>
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-emerald/10 dark:bg-sage/10 text-emerald dark:text-sage
                           hover:bg-emerald/20 dark:hover:bg-sage/20 transition-colors duration-300"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};