import React, { useState, useEffect } from 'react';
import { HealthAssessment } from '../services/geminiService';
import { TRANSLATIONS, Language } from '../constants';
import { AlertCircle, CheckCircle, ArrowLeft, ShieldAlert, Volume2, VolumeX, Download, BrainCircuit, ScanSearch, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { ReportImage } from './ReportImage';

interface ResultDisplayProps {
  assessment: HealthAssessment;
  lang: Language;
  onReset: () => void;
  uploadedImage?: { data: string; mimeType: string };
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ assessment, lang, onReset, uploadedImage }) => {
  const t = TRANSLATIONS[lang] as any;
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'High': return { color: 'text-[#EF4444]', bg: 'bg-[#FEE2E2]', border: 'border-[#FCA5A5]', icon: <ShieldAlert className="w-5 h-5" />, label: t.highRisk };
      case 'Medium': return { color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]', border: 'border-[#FDE68A]', icon: <AlertCircle className="w-5 h-5" />, label: t.mediumRisk };
      default: return { color: 'text-[#22C55E]', bg: 'bg-[#DCFCE7]', border: 'border-[#BBF7D0]', icon: <CheckCircle className="w-5 h-5" />, label: t.lowRisk };
    }
  };

  const risk = getRiskStyles(assessment.riskLevel);

  const handleDownloadPdf = async () => {
    // Using the native print API provides perfect vector PDF rendering, 
    // bypasses HTML2Canvas CSS parser crashes (like OKLCH issues),
    // and keeps text fully copy-pasteable.
    window.print();
  };

  // Preemptively load voices in some browsers
  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `
      ${t.conditionsTitle}: ${assessment.conditions.map(c => `${c.name}. ${c.description}.`).join(' ')}. 
      ${t.riskLevel}: ${risk.label}. 
      ${t.recommendationTitle}: ${assessment.reasoning}.
    `;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Determine target system locale
    const targetLang = lang === 'Hindi' ? 'hi-IN' : lang === 'Marathi' ? 'mr-IN' : 'en-IN';
    utterance.lang = targetLang;
    
    // Explicitly scan and assign a specific installed voice
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = voices.find(v => v.lang.replace('_', '-') === targetLang);
    
    // Intelligent Fallbacks if exactly 'mr-IN' or 'hi-IN' isn't explicitly tagged
    if (!preferredVoice && lang === 'Marathi') {
      preferredVoice = voices.find(v => v.name.toLowerCase().includes('marathi')) || voices.find(v => v.lang.startsWith('hi'));
    }
    if (!preferredVoice && lang === 'Hindi') {
      preferredVoice = voices.find(v => v.name.toLowerCase().includes('hindi')) || voices.find(v => v.lang.startsWith('mr'));
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-4"
      id="result-display"
    >
      <div className="flex flex-wrap gap-3 pdf-hide">
        <button
          onClick={handleDownloadPdf}
          className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-charcoal text-white px-6 py-5 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98]"
        >
          <Download className="w-5 h-5" />
          <span>{lang === 'English' ? 'Download Report (PDF)' : 'रिपोर्ट डाउनलोड करें (PDF)'}</span>
        </button>

        <button
          onClick={handleSpeak}
          className={cn(
            "p-5 rounded-2xl border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm min-w-[60px]",
            isSpeaking ? "bg-primary text-background border-primary" : "bg-surface text-primary border-secondary hover:border-primary/30"
          )}
          title={isSpeaking ? t.stopSpeech : t.speakResult}
        >
          {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          <span className="hidden sm:inline text-xs uppercase tracking-widest">{isSpeaking ? t.stopSpeech : t.speakResult}</span>
        </button>
      </div>

      <div className="bg-background p-6 space-y-6" id="report-content">
        {/* Advanced Report Header Logo (for PDF) */}
        <div className="hidden pdf-only flex-col mb-8 border-b-4 border-[#0F766E] pb-6 gap-2">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-3xl font-black text-[#0F766E] tracking-tighter">AAROGYAM AI</div>
              <div className="text-sm text-gray-500 font-bold tracking-widest mt-1">AI-ASSISTED HEALTH SCREENING REPORT</div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div className="font-bold">Date: {new Date().toLocaleDateString()}</div>
              <div>Time: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-800 font-medium">
            <strong>DISCLAIMER:</strong> This report is generated by Artificial Intelligence for informational purposes only. It does <strong>NOT</strong> constitute a medical diagnosis. Please present this report to a qualified healthcare professional.
          </div>
        </div>

        <div className={`flex items-center gap-4 px-6 py-5 rounded-2xl font-bold text-xl border shadow-sm print-break-avoid ${risk.bg} ${risk.color} ${risk.border}`}>
          {risk.icon}
          <span>{risk.label} — {assessment.recommendation === 'Urgent care' ? t.urgent : assessment.recommendation === 'Doctor' ? t.doctor : t.rest}</span>
        </div>

        {uploadedImage && (
          <div className="natural-card bg-white print-break-avoid">
            <h3 className="section-title mb-4 flex items-center gap-2 text-[#6B7280]">
              <ScanSearch className="w-5 h-5 text-[#38BDF8]" />
              {lang === 'English' ? 'Analyzed Image & Heatmap' : 'चित्र विश्लेषण'}
            </h3>
            <ReportImage 
              imageData={uploadedImage.data} 
              mimeType={uploadedImage.mimeType} 
              boundingBoxes={assessment.boundingBoxes} 
            />
            {assessment.imageInsight && (
              <p className="mt-4 text-sm text-[#6B7280] bg-[#F3F4F6] p-4 rounded-xl border border-[#D1D5DB] italic">
                {assessment.imageInsight}
              </p>
            )}
          </div>
        )}

        <div className={cn("natural-card transition-colors duration-500", risk.bg, "border-2", risk.border)}>
          <h3 className={cn("section-title mb-4", risk.color)}>{t.conditionsTitle}</h3>
          <div className="grid grid-cols-1 gap-4">
            {assessment.conditions.map((c, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm print-break-avoid">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="font-bold text-[#1F2937] text-lg">{c.name}</div>
                  <div className="flex items-center gap-3 min-w-[150px]">
                    <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${c.confidence}%` }}
                        className={cn("h-full", assessment.riskLevel === 'High' ? 'bg-[#EF4444]' : assessment.riskLevel === 'Medium' ? 'bg-[#F59E0B]' : 'bg-[#22C55E]')}
                      />
                    </div>
                    <span className="text-sm font-bold text-[#6B7280]">{c.confidence}%</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#6B7280] mb-1">{t.descriptionLabel}</h4>
                    <p className="text-sm text-[#1F2937] leading-relaxed">{c.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#6B7280] mb-2">{t.nextStepsLabel}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {c.nextSteps.map((step, si) => (
                        <div key={si} className="flex items-start gap-2 text-xs text-[#0F766E] bg-[#F0FDF4] p-2 rounded-lg border border-[#BBF7D0]">
                          <span className="mt-0.5">•</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm print-break-avoid w-full">
            <h3 className="section-title mb-2 tracking-tight text-xs text-[#6B7280]">{t.reasoningTitle}</h3>
            <div className="text-[#1F2937] text-sm leading-relaxed max-w-none">
              <ReactMarkdown>{assessment.reasoning}</ReactMarkdown>
            </div>
          </div>

          <div className="bg-[#F0FDF4] p-6 rounded-[16px] border border-[#BBF7D0] shadow-sm print-break-avoid w-full">
            <h3 className="section-title mb-2 text-[#0F766E] flex items-center gap-2">
               <BrainCircuit className="w-4 h-4" />
               {lang === 'English' ? 'Explainable AI ("Why?")' : 'निष्कर्ष का कारण'}
            </h3>
            <div className="text-[#0F766E] text-sm leading-relaxed font-medium">
              <ReactMarkdown>{assessment.xaiExplain}</ReactMarkdown>
            </div>
          </div>
        </div>

        <div className={cn("natural-card border-l-8 print-break-avoid", risk.bg, risk.border)}>
          <h3 className={cn("section-title mb-3 font-bold", risk.color)}>{t.recommendationTitle}</h3>
          <div className="flex flex-col gap-3">
            <div className={cn("p-4 rounded-xl font-black text-sm uppercase tracking-wider", risk.color, "bg-white/50 backdrop-blur-sm border", risk.border)}>
              {assessment.recommendation}
            </div>
            <ul className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3")}>
              {assessment.warningSigns.map((sign, i) => (
                <li key={i} className={cn("flex items-center gap-3 p-3 rounded-xl border border-dashed", risk.border, risk.color, "bg-white/30")}>
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", risk.color.replace('text-', 'bg-'))} />
                  <span className="text-sm font-bold leading-tight">{sign}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-[#FEF2F2] border border-[#FEE2E2] p-4 rounded-2xl flex flex-col gap-3 text-error">
          <div className="flex gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs font-medium">
              <span className="font-bold uppercase tracking-tighter">{t.warningTitle}:</span> {t.urgentWarning}
            </div>
          </div>
          {assessment.riskLevel === 'High' && (
            <div className="hidden pdf-hide">
              <a href="#sos-section" className="block bg-error text-background py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center animate-pulse">
                Go to Emergency SOS
              </a>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 py-4 text-gray font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors pdf-hide"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.startOver}
      </button>
    </motion.div>
  );
};


