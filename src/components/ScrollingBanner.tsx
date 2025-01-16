import React from 'react';
import { Building2, GraduationCap, Award } from 'lucide-react';
import kpmgLogo from '../assets/Company Logo/kpmg-logo.svg';
import infosysLogo from '../assets/Company Logo/Infosys_Consulting_logo.svg.png';
import shadowfaxLogo from '../assets/Company Logo/shadowfax.png';
import ntpcLogo from '../assets/Company Logo/National_Thermal_Power_logo.svg';
import nmimsLogo from '../assets/Company Logo/Narsee_Monjee_Institute_of_Management_Studies_Logo.png';
import ggsiuLogo from '../assets/Company Logo/GGSIU_logo.png';

interface Logo {
  name: string;
  type: 'company' | 'education' | 'certification';
  logoUrl?: string;
  imageFormat: 'svg';
  removeBg?: boolean;
  width?: string;
}

const logos: Logo[] = [
  {
    name: 'KPMG',
    type: 'company',
    logoUrl: kpmgLogo,
  },
  {
    name: 'Infosys Consulting',
    type: 'company',
    logoUrl: infosysLogo,
    width: 'w-48' // 50% larger than default w-32
  },
  {
    name: 'Shadowfax',
    type: 'company',
    logoUrl: shadowfaxLogo,
    removeBg: true,
    width: 'w-64' // 100% larger than default w-32
  },
  {
    name: 'NTPC Limited',
    type: 'company',
    logoUrl: ntpcLogo,
  },
  {
    name: 'NMIMS Mumbai',
    type: 'education',
    logoUrl: nmimsLogo,
  },
  {
    name: 'GGSIPU',
    type: 'education',
    logoUrl: ggsiuLogo,
  }
];

const LogoDisplay = ({ logo }: { logo: Logo }) => {
  const IconComponent = {
    company: Building2,
    education: GraduationCap,
    certification: Award
  }[logo.type];

  if (logo.logoUrl) {
    return (
      <img 
        src={logo.logoUrl}
        alt={`${logo.name} logo`}
        className={`${logo.width || 'w-32'} h-16 object-contain ${
          logo.imageFormat === 'png' ? 'filter brightness-0 dark:brightness-0 dark:invert' : ''
        } ${logo.removeBg ? 'mix-blend-multiply dark:mix-blend-screen' : ''}`}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <IconComponent className="w-6 h-6 text-emerald dark:text-sage" />
      <span className="text-emerald dark:text-sage font-playfair">{logo.name}</span>
    </div>
  );
};

export const ScrollingBanner = () => {
  return (
    <div className="w-full overflow-hidden bg-gray-50 dark:bg-dark-surface/50 py-8 transition-colors duration-300">
      <div className="relative flex">
        <div className="animate-scroll flex gap-12 items-center">
          {[...logos, ...logos].map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="flex items-center justify-center min-w-[200px] h-20
                       grayscale opacity-70 
                       hover:grayscale-0 hover:opacity-100 hover:scale-105 
                       transition-all duration-300"
            >
              <LogoDisplay logo={logo} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};