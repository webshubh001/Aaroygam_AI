import React from 'react';
import { TRANSLATIONS, Language } from '../constants';
import { motion } from 'motion/react';
import { Thermometer, Ambulance, Flame, Droplets, HeartPulse, Sun, ShieldAlert, Zap, UserRoundMinus } from 'lucide-react';

interface FirstAidGuideProps {
  lang: Language;
}

export const FirstAidGuide: React.FC<FirstAidGuideProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang] as any;

  const guideItems = [
    { key: 'fever', icon: <Thermometer className="w-5 h-5" />, color: 'text-warning' },
    { key: 'wound', icon: <Droplets className="w-5 h-5" />, color: 'text-error' },
    { key: 'snakebite', icon: <ShieldAlert className="w-5 h-5" />, color: 'text-accent' },
    { key: 'burns', icon: <Flame className="w-5 h-5" />, color: 'text-warning' },
    { key: 'sunstroke', icon: <Sun className="w-5 h-5" />, color: 'text-primary' },
    { key: 'dogbite', icon: <ShieldAlert className="w-5 h-5" />, color: 'text-stone-600' },
    { key: 'choking', icon: <UserRoundMinus className="w-5 h-5" />, color: 'text-accent' },
    { key: 'shock', icon: <Zap className="w-5 h-5" />, color: 'text-warning' }
  ];

  return (
    <div className="flex flex-col gap-6" id="first-aid-tools">
      <div className="natural-card bg-surface">
        <h3 className="section-title text-gray mb-4 flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-primary" />
          {t.firstAidTitle}
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {guideItems.map((item) => (
            <div key={item.key} className="p-4 bg-background border border-secondary rounded-2xl flex gap-4 hover:border-primary/30 transition-colors">
              <div className={`p-3 rounded-xl bg-surface shadow-sm ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-1">
                   {item.key}
                </div>
                <p className="text-xs font-bold text-charcoal leading-relaxed leading-tight text-justify line-clamp-3">
                  {t.guides[item.key]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
