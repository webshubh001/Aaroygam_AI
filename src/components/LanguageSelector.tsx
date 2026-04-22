import React from 'react';
import { Language } from '../constants';
import { cn } from '../lib/utils';

interface LanguageSelectorProps {
  current: Language;
  onSelect: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ current, onSelect }) => {
  const languages: Language[] = ['English', 'Hindi', 'Marathi'];
  
  return (
    <div className="flex justify-center md:justify-end gap-2 p-4 md:px-12 bg-primary/95" id="lang-selector">
      <div className="flex gap-1">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => onSelect(lang)}
            className={cn(
              "px-4 py-1.5 rounded-full font-bold transition-all text-[10px] tracking-widest uppercase cursor-pointer",
              current === lang 
                ? "bg-secondary text-primary shadow-sm" 
                : "bg-transparent text-background/60 border border-background/20 hover:border-background/40"
            )}
          >
            {lang === 'English' ? 'ENGLISH' : lang === 'Hindi' ? 'हिन्दी' : 'मराठी'}
          </button>
        ))}
      </div>
    </div>
  );

};

