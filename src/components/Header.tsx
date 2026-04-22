import React from 'react';
import { TRANSLATIONS, Language } from '../constants';
import { HeartPulse, Phone } from 'lucide-react';

interface HeaderProps {
  lang: Language;
}

export const Header: React.FC<HeaderProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <header className="bg-primary text-background px-6 py-4 md:px-12 flex justify-between items-center shadow-lg relative z-20" id="app-header">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center text-primary font-bold shadow-inner">
          <HeartPulse className="w-6 h-6" />
        </div>
        <div className="font-bold text-xl tracking-wider uppercase">
          {lang === 'English' ? 'AAROGYAM' : t.title}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <a 
          href="#sos-section" 
          className="flex items-center gap-2 bg-error px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-error/20 hover:scale-105 transition-all"
        >
          <Phone className="w-4 h-4 fill-current" />
          <span>SOS</span>
        </a>
        <div className="hidden md:block text-xs uppercase tracking-tighter opacity-70 font-bold">
          Rural Health Terminal
        </div>
      </div>
    </header>
  );
};


