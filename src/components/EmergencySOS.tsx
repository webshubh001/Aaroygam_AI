import React from 'react';
import { TRANSLATIONS, Language } from '../constants';
import { Ambulance, Phone } from 'lucide-react';

interface EmergencySOSProps {
  lang: Language;
}

export const EmergencySOS: React.FC<EmergencySOSProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang] as any;

  return (
    <div className="natural-card bg-gradient-to-br from-error to-error/80 text-background overflow-hidden relative shadow-2xl shadow-error/20" id="sos-section">
      <div className="absolute right-[-10px] top-[-10px] opacity-10 rotate-12">
          <Phone className="w-40 h-40" />
      </div>
      <h3 className="text-xs uppercase font-bold tracking-[0.2em] mb-4 relative z-10 flex items-center gap-2">
        <Ambulance className="w-4 h-4" />
        {t.emergencyTitle}
      </h3>
      <div className="grid grid-cols-1 gap-2 relative z-10">
        <a
          href="tel:102"
          className="flex items-center justify-between p-4 bg-background/10 hover:bg-background/20 rounded-xl transition-all border border-background/20 group cursor-pointer"
        >
          <span className="font-bold">{t.callAmbulance}</span>
          <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </a>
        <a
          href="tel:100"
           className="flex items-center justify-between p-4 bg-background/10 hover:bg-background/20 rounded-xl transition-all border border-background/20 group cursor-pointer"
        >
          <span className="font-bold">{t.callPolice}</span>
          <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </a>
      </div>
      <p className="mt-3 text-[9px] opacity-60 font-medium italic relative z-10">
        {lang === 'English' ? 'Immediate help is just a call away.' : lang === 'Hindi' ? 'तत्काल सहायता केवल एक कॉल की दूरी पर है।' : 'तातडीची मदत एका कॉलवर उपलब्ध आहे.'}
      </p>
    </div>
  );
};
