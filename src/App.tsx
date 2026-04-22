import { useState, useEffect } from 'react';
import { Language, TRANSLATIONS } from './constants';
import { Header } from './components/Header';
import { LanguageSelector } from './components/LanguageSelector';
import { AssessmentForm } from './components/AssessmentForm';
import { ResultDisplay } from './components/ResultDisplay';
import { HospitalFinder } from './components/HospitalFinder';
import { FirstAidGuide } from './components/FirstAidGuide';
import { EmergencySOS } from './components/EmergencySOS';
import { InfectionHub } from './components/InfectionHub';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { OnboardingModal } from './components/OnboardingModal';
import { analyzeSymptoms } from './services/geminiService';
import { HealthAssessment } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, LayoutGrid, HeartPulse, History, WifiOff, ShieldCheck } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('English');
  const [assessment, setAssessment] = useState<HealthAssessment | null>(null);
  const [lastUploadedImage, setLastUploadedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assessment' | 'tools'>('assessment');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAnalyze = async (query: string, image?: { data: string; mimeType: string }) => {
    if (!isOnline) {
      // Offline logging
      const history = JSON.parse(localStorage.getItem('aarogyam_history') || '[]');
      const offlineEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        query: query,
        image: image,
        isOfflineRecord: true,
        conditions: [{ name: lang === 'English' ? 'Self Observation (Offline)' : 'स्व-निरीक्षण (ऑफलाइन)', confidence: 100 }],
        riskLevel: 'Low',
        reasoning: lang === 'English' ? 'This record was saved while offline for your records.' : 'ही नोंद ऑफलाइन असताना तुमच्या माहितीसाठी सेव्ह केली गेली आहे.',
        recommendation: 'Rest',
        warningSigns: [lang === 'English' ? 'Check again when online for AI analysis.' : 'AI विश्लेषणासाठी ऑनलाइन झाल्यावर पुन्हा तपासा.'],
        xaiExplain: 'N/A (Offline)'
      };
      localStorage.setItem('aarogyam_history', JSON.stringify([offlineEntry, ...history].slice(0, 10)));
      setAssessment(offlineEntry as any);
      if (image) setLastUploadedImage(image);
      return;
    }

    setIsLoading(true);
    setError(null);
    if (image) setLastUploadedImage(image);
    else setLastUploadedImage(null);

    try {
      const result = await analyzeSymptoms(query, lang, image);
      setAssessment(result);
      setAnalysisCount(prev => prev + 1);
      
      // Save to local history
      const history = JSON.parse(localStorage.getItem('aarogyam_history') || '[]');
      const newEntry = {
        ...result,
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
        image: image 
      };
      localStorage.setItem('aarogyam_history', JSON.stringify([newEntry, ...history].slice(0, 5)));
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAssessment(null);
    setLastUploadedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Header lang={lang} />
      
      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-error text-background py-2 px-6 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest overflow-hidden"
          >
            <WifiOff className="w-4 h-4" />
            <span>
              {lang === 'English' 
                ? 'Offline Mode: Only First Aid & SOS are available.' 
                : lang === 'Hindi' 
                ? 'ऑफलाइन मोड: केवल प्राथमिक चिकित्सा और SOS उपलब्ध हैं।' 
                : 'ऑफलाइन मोड: केवळ प्रथमोपचार आणि SOS उपलब्ध आहेत.'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <OnboardingModal lang={lang} onClose={() => {}} />
      <LanguageSelector current={lang} onSelect={setLang} />

      <main className="flex-1 max-w-[1200px] w-full mx-auto p-6 md:p-12 space-y-8 bg-gradient-to-b from-background to-secondary/10">
        <EmergencySOS lang={lang} />
        
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
          <aside className="space-y-6">
            <AssessmentForm 
              lang={lang} 
              onAnalyze={handleAnalyze} 
              isLoading={isLoading} 
              isOnline={isOnline}
            />
            <HospitalFinder lang={lang} assessmentId={analysisCount} />
          </aside>

        <section className="min-h-[400px]">
          <div className="flex gap-4 mb-6 bg-surface p-1 rounded-2xl w-fit border border-secondary/20 shadow-sm">
            <button 
              onClick={() => setActiveTab('assessment')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'assessment' ? 'bg-primary text-background shadow-lg shadow-primary/20 scale-105' : 'text-gray hover:text-primary'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              {lang === 'English' ? 'Analysis' : 'विश्लेषण'}
            </button>
            <button 
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'tools' ? 'bg-primary text-background shadow-lg shadow-primary/20 scale-105' : 'text-gray hover:text-primary'}`}
            >
              <HeartPulse className="w-4 h-4" />
              {TRANSLATIONS[lang].firstAidTitle}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'assessment' ? (
              <motion.div key="assessment-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-2xl text-center font-bold text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {assessment && (
                  <ResultDisplay 
                    key="result"
                    assessment={assessment} 
                    lang={lang} 
                    onReset={handleReset} 
                    uploadedImage={lastUploadedImage || undefined}
                  />
                )}

                {!assessment && !isLoading && !error && (
                  <div className="space-y-6">
                    <motion.div 
                      className="h-[300px] flex flex-col items-center justify-center text-center p-12 border-4 border-dashed border-primary/10 rounded-[32px] opacity-40 italic text-gray"
                    >
                      <div className="text-4xl mb-4 opacity-50">🏥</div>
                      <p className="font-bold tracking-tight">{lang === 'English' ? 'Awaiting your health details for analysis...' : 'आरोग्य विश्लेषणासाठी तुमच्या माहितीची प्रतीक्षा आहे...'}</p>
                    </motion.div>
                    
                    {/* Recent History Preview */}
                    {localStorage.getItem('aarogyam_history') && (
                       <div className="natural-card bg-surface">
                        <h3 className="section-title text-gray flex items-center gap-2 mb-4">
                          <History className="w-5 h-5 text-accent" />
                          {TRANSLATIONS[lang].historyTitle}
                        </h3>
                        <div className="space-y-3">
                          {JSON.parse(localStorage.getItem('aarogyam_history') || '[]').map((h: any) => (
                             <div 
                              key={h.id} 
                              onClick={() => {
                                setAssessment(h);
                                if (h.image) setLastUploadedImage(h.image);
                              }}
                              className="p-4 bg-background border border-secondary rounded-2xl flex items-center justify-between hover:border-primary/30 transition-all cursor-pointer group"
                             >
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="font-bold text-sm text-charcoal">{h.conditions[0]?.name || 'Assessment'}</div>
                                  {h.isOfflineRecord && (
                                    <span className="bg-accent text-white text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Offline</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-gray opacity-60 font-mono">{h.date} • {h.query}</div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${h.riskLevel === 'High' ? 'bg-error/10 text-error' : h.riskLevel === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                                {h.riskLevel}
                              </div>
                             </div>
                          ))}
                        </div>
                       </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="tools-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <InfectionHub lang={lang} onQuickCheck={(q) => handleAnalyze(q)} isOnline={isOnline} />
                <FirstAidGuide lang={lang} />
              </motion.div>
            )}

            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12"
              >
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-primary font-bold uppercase tracking-widest text-xs animate-pulse">
                  {TRANSLATIONS[lang].loading}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>

      <footer className="bg-surface py-8 px-12 text-center border-t border-secondary/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center whitespace-nowrap text-4xl font-bold select-none uppercase tracking-widest">
          Shubham D. Karmilkar • Shubham D. Karmilkar • Shubham D. Karmilkar
        </div>
        <p className="text-[10px] text-gray leading-relaxed max-w-2xl mx-auto italic font-bold relative z-10">
          {TRANSLATIONS[lang].disclaimer}<br />
          {TRANSLATIONS[lang].urgentWarning}
        </p>
        <p className="mt-4 text-[9px] text-primary/40 font-mono tracking-widest uppercase relative z-10 flex flex-col items-center gap-2">
          <span>Developed by Shubham D. Karmilkar</span>
          <button 
            onClick={() => setIsPrivacyOpen(true)}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Privacy Policy</span>
          </button>
          <button 
            onClick={() => {
              if (window.confirm("This will clear app cache and reload. Proceed?")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="flex items-center gap-1 hover:text-error transition-colors cursor-pointer opacity-50 text-[8px]"
          >
            Clear Cache & Reload
          </button>
        </p>
      </footer>

      <PrivacyPolicy 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)} 
        lang={lang as any} 
      />
    </div>
  );
}


