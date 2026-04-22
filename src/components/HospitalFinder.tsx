import React, { useState } from 'react';
import { Hospital, findNearbyHospitals } from '../services/geminiService';
import { Language, TRANSLATIONS } from '../constants';
import { MapPin, Phone, Navigation, Loader2, Hospital as HospitalIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HospitalFinderProps {
  lang: Language;
  assessmentId?: string | number;
}

export const HospitalFinder: React.FC<HospitalFinderProps> = ({ lang, assessmentId }) => {
  const t = TRANSLATIONS[lang] as any;
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh/clear when assessment changes
  React.useEffect(() => {
    if (assessmentId) {
      const idAsNumber = typeof assessmentId === 'number' ? assessmentId : parseInt(assessmentId, 10);
      if (idAsNumber > 0) {
        setHospitals([]);
        setError(null);
        // Auto-trigger the scan to ensure "freshness" for the new condition
        findHospitals();
      }
    }
  }, [assessmentId]);

  const findHospitals = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(t.locationError || 'Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const results = await findNearbyHospitals(
            position.coords.latitude,
            position.coords.longitude,
            lang
          );
          setHospitals(results);
          if (results.length === 0) {
            setError(t.noHospitalsFound);
          }
        } catch (err: any) {
          console.error("Gemini Hospital Search Error:", err);
          
          let errorMessage = err.message || 'API Error';
          if (typeof errorMessage === 'string' && (errorMessage.includes('429') || errorMessage.includes('quota'))) {
            setError(t.quotaExceeded);
          } else {
            setError(`${t.locationError} (${errorMessage})`);
          }
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError(t.locationDenied);
        } else {
          setError(t.locationError);
        }
      }
    );
  };

  return (
    <div className="natural-card bg-surface overflow-hidden" id="hospital-finder">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title text-gray mb-0 flex items-center gap-2">
          <HospitalIcon className="w-5 h-5 text-primary" />
          {t.nearbyhospitals}
        </h3>
        {!loading && hospitals.length === 0 && (
          <button
            onClick={findHospitals}
            className="text-[10px] bg-primary text-background px-3 py-1.5 rounded-full font-bold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
          >
            {t.getLocation}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 gap-3"
          >
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-gray font-medium animate-pulse">{t.findingHospitals}</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-error/5 border border-error/20 rounded-xl text-error text-center text-xs font-bold"
          >
            {error}
            <button 
              onClick={findHospitals}
              className="block mt-2 text-primary underline cursor-pointer"
            >
              Try Again
            </button>
          </motion.div>
        ) : hospitals.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-[10px] text-gray uppercase font-bold tracking-tight mb-2">
              {t.hospitalInfo}
            </p>
            {hospitals.map((h, i) => (
              <div key={i} className="p-4 bg-background border border-secondary rounded-2xl flex flex-col gap-2 hover:border-primary/30 transition-colors">
                <div className="font-bold text-charcoal text-sm leading-tight">{h.name}</div>
                <div className="flex items-start gap-2 text-[10px] text-gray">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-accent" />
                  <span>{h.address}</span>
                </div>
                {h.contact && (
                  <div className="flex items-center gap-2 text-[10px] text-primary font-bold">
                    <Phone className="w-3 h-3" />
                    <span>{h.contact}</span>
                  </div>
                )}
                <div className="flex justify-end mt-1">
                   <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ' ' + h.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[9px] bg-secondary text-primary px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider hover:bg-secondary/80"
                   >
                     <Navigation className="w-3 h-3" />
                     Direction
                   </a>
                </div>
              </div>
            ))}
            <button 
              onClick={() => setHospitals([])}
              className="w-full py-2 text-[10px] text-gray uppercase font-bold hover:text-primary transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          </motion.div>
        ) : (
          <div className="text-center py-6">
             <div className="text-2xl mb-2 opacity-20">📍</div>
             <p className="text-[10px] text-gray italic">Allow location to see medical facilities near you.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
