import React, { useState, useRef, useEffect } from 'react';
import { TRANSLATIONS, Language } from '../constants';
import { Mic, Camera, Send, X, Loader2, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraCapture } from './CameraCapture';
import { compressImage } from '../lib/utils';

interface AssessmentFormProps {
  lang: Language;
  onAnalyze: (query: string, image?: { data: string; mimeType: string }) => void;
  isLoading: boolean;
  isOnline: boolean;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ lang, onAnalyze, isLoading, isOnline }) => {
  const [query, setQuery] = useState('');
  const [image, setImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const t = TRANSLATIONS[lang] as any;

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep(s => (s + 1) % 4);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleVoiceInput = () => {
    setRecordingError(null);
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      setRecordingError("Voice input is not supported in this browser. Please use Chrome.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = lang === 'Hindi' ? 'hi-IN' : lang === 'Marathi' ? 'mr-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setRecordingError(null);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      recognitionRef.current = null;
      
      let errorMessage = "Voice assistant error.";
      if (event.error === 'not-allowed') {
        errorMessage = lang === 'English' ? "Microphone access denied." : "माइक्रोफोन अनुमति अस्वीकार कर दी गई।";
      } else if (event.error === 'network') {
        errorMessage = lang === 'English' ? "Internet needed for voice." : "आवाज के लिए इंटरनेट की जरूरत है।";
      } else if (event.error === 'no-speech') {
        errorMessage = lang === 'English' ? "No speech detected." : "कोई आवाज नहीं सुनी गई।";
      } else if (event.error === 'service-not-allowed') {
        errorMessage = "Service not allowed (Browser limit).";
      } else if (event.error === 'aborted') {
        errorMessage = null;
      }
      
      if (errorMessage) {
        setRecordingError(errorMessage);
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (transcript) {
        setQuery(prev => {
          const newQuery = prev + (prev.trim() ? ' ' : '') + transcript;
          return newQuery;
        });
        setRecordingError(null);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setRecordingError("Could not start voice input.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string);
        try {
          const compressed = await compressImage(base64String);
          setImage({ data: compressed, mimeType: 'image/jpeg' });
        } catch (err) {
          console.error("Compression failed", err);
          const raw = base64String.split(',')[1];
          setImage({ data: raw, mimeType: file.type });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !image) return;
    onAnalyze(query, image || undefined);
  };

  return (
    <div className="flex flex-col gap-6" id="assessment-form">
      <div className="natural-card bg-surface">
        <h3 className="section-title text-gray">{lang === 'English' ? 'Symptom Entry' : t.symptomLabel}</h3>
        
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`w-full h-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer mb-2 ${
            isRecording ? 'bg-error/5 border-error/40 text-error animate-pulse' : 'bg-primary/5 border-primary/30 text-primary hover:bg-primary/10'
          }`}
        >
          <Mic className={`w-8 h-8 ${isRecording ? 'text-error' : 'text-primary'}`} />
          <span className="text-sm font-bold uppercase tracking-tight">
            {isRecording ? t.stopSpeech : t.voiceBtn}
          </span>
        </button>

        {recordingError && (
          <div className="text-[10px] text-error font-bold mb-4 text-center animate-bounce">
            ⚠️ {recordingError}
          </div>
        )}

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.symptomPlaceholder}
          className="w-full h-32 p-4 bg-background border border-secondary rounded-xl focus:border-primary/30 focus:ring-0 transition-all text-sm resize-none text-charcoal outline-none"
        />
      </div>

      <div className="natural-card bg-surface">
        <h3 className="section-title text-gray">{lang === 'English' ? 'Visual Scan' : t.imageBtn}</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="h-20 bg-primary/10 border-2 border-primary/20 rounded-2xl flex flex-col items-center justify-center gap-1 text-primary font-bold hover:bg-primary/20 transition-all cursor-pointer group"
          >
            <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase tracking-widest">{lang === 'English' ? 'Open Camera' : 'कॅमेरा उघडा'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-20 bg-secondary/30 border-2 border-secondary rounded-2xl flex flex-col items-center justify-center gap-1 text-gray font-bold hover:bg-secondary/50 transition-all cursor-pointer group"
          >
            <ImagePlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase tracking-widest">{lang === 'English' ? 'Upload File' : 'फाइल निवडा'}</span>
          </button>
        </div>

        <p className="text-[10px] text-gray mt-3 italic font-medium">Use for rashes, spots, or visible infection sites.</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />

        <AnimatePresence>
          {image && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative mt-4 inline-block"
            >
              <img 
                src={`data:${image.mimeType};base64,${image.data}`} 
                alt="Upload preview" 
                className="w-24 h-24 object-cover rounded-xl border-2 border-secondary shadow-sm"
              />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute -top-1 -right-1 p-1 bg-error text-white rounded-full shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || (!query.trim() && !image)}
        className={`btn-primary w-full shadow-xl shadow-primary/10 flex flex-col items-center justify-center gap-1 text-lg py-4 transition-all overflow-hidden relative ${
          !isOnline ? 'bg-accent border-accent hover:bg-accent/90' : ''
        }`}
      >
        {isLoading ? (
          <>
            <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="w-6 h-6 animate-spin" />
              <motion.span 
                key={loadingStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-[11px] uppercase tracking-widest font-bold"
              >
                {
                   lang === 'English' ? [
                     'Analyzing Symptoms...', 
                     'Scanning Image Data...', 
                     'Checking Medical Knowledge...', 
                     'Finalizing Report...'
                   ][loadingStep] : 
                   lang === 'Hindi' ? [
                     'लक्षणों का विश्लेषण...', 
                     'छवि डेटा स्कैनिंग...', 
                     'मेडिकल ज्ञान की जांच...', 
                     'रिपोर्ट तैयार हो रही है...'
                   ][loadingStep] : [
                     'लक्षणे तपासत आहे...', 
                     'प्रतिमा डेटा स्कॅन करत आहे...', 
                     'वैद्यकीय माहिती तपासत आहे...', 
                     'अहवाल तयार करत आहे...'
                   ][loadingStep]
                }
              </motion.span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              {isOnline ? <Send className="w-6 h-6" /> : <div className="text-2xl">📝</div>}
              <span className="font-bold">
                {isOnline ? t.analyzeBtn : (lang === 'English' ? 'Log Symptoms Offline' : lang === 'Hindi' ? 'लक्षण रिकॉर्ड करें' : 'लक्षणे नोंदवा')}
              </span>
            </div>
            {!isOnline && (
              <span className="text-[10px] uppercase tracking-tighter opacity-70">
                 {lang === 'English' ? 'Saved to local history' : lang === 'Hindi' ? 'लोकल हिस्ट्री में सुरक्षित' : 'लोकल हिस्ट्रीमध्ये सेव्ह होईल'}
              </span>
            )}
          </>
        )}
      </button>

      <AnimatePresence>
        {showCamera && (
           <CameraCapture 
            lang={lang}
            onClose={() => setShowCamera(false)}
            onCapture={(captured) => {
              setImage(captured);
              setShowCamera(false);
            }}
           />
        )}
      </AnimatePresence>
    </div>
  );
};

