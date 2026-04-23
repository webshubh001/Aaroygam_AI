import React, { useState } from 'react';
import { Hospital, findNearbyHospitals } from '../services/geminiService';
import { Language, TRANSLATIONS } from '../constants';
import { MapPin, Phone, Navigation, Loader2, Hospital as HospitalIcon, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Hospital, findNearbyHospitals, searchHospitalsByText } from '../services/geminiService';

interface HospitalFinderProps {
  lang: Language;
  assessmentId?: string | number;
}

export const HospitalFinder: React.FC<HospitalFinderProps> = ({ lang, assessmentId }) => {
  const t = TRANSLATIONS[lang] as any;
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState('');
  const [showManual, setShowManual] = useState(false);

  // Auto-refresh/clear when assessment changes
  React.useEffect(() => {
    if (assessmentId) {
      const idAsNumber = typeof assessmentId === 'number' ? assessmentId : parseInt(assessmentId, 10);
      if (idAsNumber > 0) {
        setHospitals([]);
        setError(null);
        // We don't auto-trigger findHospitals here to avoid nagging for permission if they haven't explicitly asked
      }
    }
  }, [assessmentId]);

  const findHospitals = () => {
    setLoading(true);
    setError(null);
    setShowManual(false);

    if (!navigator.geolocation) {
      setError(t.locationError || 'Geolocation not supported');
      setShowManual(true);
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
          if (!results || results.length === 0) {
            setError(t.noHospitalsFound);
            setShowManual(true);
          }
        } catch (err: any) {
          console.error("Gemini Hospital Search Error:", err);
          setError(t.locationError);
          setShowManual(true);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLoading(false);
        setShowManual(true);
        if (err.code === err.PERMISSION_DENIED) {
          setError(t.locationDenied);
        } else if (err.code === err.TIMEOUT) {
          setError(lang === 'English' ? "Location request timed out." : "लोकेशन विनंतीची वेळ संपली.");
        } else {
          setError(t.locationError);
        }
      },
      { 
        enableHighAccuracy: false, 
        timeout: 30000, 
        maximumAge: 300000 
      }
    );
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLocation.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const results = await searchHospitalsByText(manualLocation, lang);
      setHospitals(results);
      if (!results || results.length === 0) {
        setError(t.noHospitalsFound);
      }
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
        ) : (error || showManual) ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-background border border-secondary rounded-2xl space-y-4"
          >
            {error && (
              <p className="text-xs text-error font-bold text-center">{error}</p>
            )}
            
            <form onSubmit={handleManualSearch} className="space-y-3">
              <p className="text-[10px] text-gray uppercase font-bold text-center">
                {lang === 'English' ? 'Enter your Town or District' : 'तुमचे शहर किंवा जिल्ह्याचे नाव टाका'}
              </p>
              <div className="relative">
                <input 
                  type="text" 
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder={lang === 'English' ? "e.g., Satara, Maharashtra" : "उदा. सातारा, महाराष्ट्र"}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-secondary rounded-xl text-sm focus:border-primary outline-none transition-all"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray" />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-charcoal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
              >
                {lang === 'English' ? 'Search Manually' : 'मॅन्युअली शोधा'}
              </button>
            </form>

            <div className="flex flex-col gap-2 pt-2 border-t border-secondary/50">
              <button 
                onClick={findHospitals}
                className="text-[10px] text-primary font-bold uppercase underline cursor-pointer text-center"
              >
                {lang === 'English' ? 'Retry GPS Location' : 'GPS लोकेशन पुन्हा प्रयत्न करा'}
              </button>
              <a 
                href="https://www.google.com/maps/search/hospitals+near+me" 
                target="_blank" 
                className="text-[9px] text-gray font-bold uppercase text-center hover:text-primary transition-colors"
              >
                Open Google Maps Directly
              </a>
            </div>
          </motion.div>
        ) : hospitals.length > 0 ? (
           <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray uppercase font-bold tracking-tight">
                {t.hospitalInfo}
              </p>
              <button onClick={() => setShowManual(true)} className="text-[9px] text-primary font-bold uppercase underline">
                {lang === 'English' ? 'Change City' : 'शहर बदला'}
              </button>
            </div>
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
             <p className="text-[10px] text-gray italic mb-4">No medical centers found in your immediate vicinity using AI search.</p>
             <a 
                href="https://www.google.com/maps/search/hospitals+near+me" 
                target="_blank" 
                className="text-[10px] bg-primary/10 text-primary py-2 px-6 rounded-full hover:bg-primary/20 transition-all font-bold uppercase inline-block"
              >
                Search on Google Maps
              </a>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
