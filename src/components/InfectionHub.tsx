import React from 'react';
import { TRANSLATIONS, Language } from '../constants';
import { Bug, Info } from 'lucide-react';

interface InfectionHubProps {
  lang: Language;
  onQuickCheck: (query: string) => void;
  isOnline: boolean;
}

export const InfectionHub: React.FC<InfectionHubProps> = ({ lang, onQuickCheck, isOnline }) => {
  const t = TRANSLATIONS[lang] as any;

  const infections = [
    { key: 'malaria', color: 'bg-error/10 text-error border-error/20' },
    { key: 'dengue', color: 'bg-warning/10 text-warning border-warning/20' },
    { key: 'typhoid', color: 'bg-accent/10 text-accent border-accent/20' },
    { key: 'tb', color: 'bg-primary/10 text-primary border-primary/20' }
  ];

  return (
    <div className="natural-card bg-surface" id="infection-hub">
      <h3 className="section-title text-gray mb-4 flex items-center gap-2">
        <Bug className="w-5 h-5 text-accent" />
        {t.infectionHubTitle}
      </h3>
      
      <div className="grid grid-cols-1 gap-3">
        {infections.map((inf) => (
          <button
            key={inf.key}
            onClick={() => isOnline && onQuickCheck(`Tell me about ${inf.key} and its warning signs.`)}
            disabled={!isOnline}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${inf.color} ${
              !isOnline ? 'opacity-40 grayscale pointer-events-none' : 'hover:scale-[1.02]'
            }`}
          >
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm tracking-tight">{t.commonInfections[inf.key]}</span>
            </div>
            <div className="p-2 rounded-full bg-surface/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Info className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>
      
      <p className="mt-4 text-[10px] text-gray italic leading-relaxed">
        {lang === 'English' 
          ? 'Tap any card to see specialized AI analysis for that infection.' 
          : lang === 'Hindi' 
          ? 'संक्रमण के लिए विशेष AI विश्लेषण देखने के लिए किसी भी कार्ड पर टैप करें।' 
          : 'त्या संसर्गासाठी विशेष AI विश्लेषण पाहण्यासाठी कोणत्याही कार्डावर टॅप करा.'}
      </p>
    </div>
  );
};
