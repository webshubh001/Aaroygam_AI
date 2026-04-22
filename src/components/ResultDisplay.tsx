import React, { useState, useEffect, useRef } from 'react';
import { HealthAssessment } from '../services/geminiService';
import { TRANSLATIONS, Language } from '../constants';
import { AlertCircle, CheckCircle, ArrowLeft, ShieldAlert, Volume2, VolumeX, Download, BrainCircuit, ScanSearch, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'High': return { color: 'text-[#EF4444]', bg: 'bg-[#FEE2E2]', border: 'border-[#FCA5A5]', icon: <ShieldAlert className="w-5 h-5" />, label: t.highRisk };
      case 'Medium': return { color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]', border: 'border-[#FDE68A]', icon: <AlertCircle className="w-5 h-5" />, label: t.mediumRisk };
      default: return { color: 'text-[#22C55E]', bg: 'bg-[#DCFCE7]', border: 'border-[#BBF7D0]', icon: <CheckCircle className="w-5 h-5" />, label: t.lowRisk };
    }
  };

  const risk = getRiskStyles(assessment.riskLevel);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F9FAFB', // Match app background
        onclone: (clonedDoc) => {
          // Remove all style links/tags that might contain oklch/oklab to prevent internal parser errors
          const styles = Array.from(clonedDoc.querySelectorAll('style, link[rel="stylesheet"]'));
          styles.forEach(s => {
            if (s.textContent?.includes('okl') || (s instanceof HTMLLinkElement && s.href)) {
               if (s.textContent) {
                 s.textContent = s.textContent.replace(/okl(ch|ab)\([^)]+\)/g, '#000000');
               }
            }
          });
          
          // Force standard visibility for elements
          const pdfOnly = clonedDoc.querySelectorAll('.pdf-only') as NodeListOf<HTMLElement>;
          pdfOnly.forEach(el => {
            el.style.display = 'flex';
            el.style.visibility = 'visible';
          });

          // Ensure the container has full height for capture
          const container = clonedDoc.getElementById('result-display');
          if (container) {
            container.style.height = 'auto';
            container.style.overflow = 'visible';
            container.style.width = '800px'; // Set fixed width for more predictable multi-column layouts
          }

          // Force standard fonts for specific sections
          const proseSections = clonedDoc.querySelectorAll('.prose, p, li, span');
          proseSections.forEach(s => {
             const el = s as HTMLElement;
             el.style.fontFamily = 'Arial, sans-serif';
             el.style.color = '#1F2937';
          });
        }
      });
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit content
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Use custom page height if content is longer than A4 (297mm)
      const pdfHeight = Math.max(297, imgHeight + 10); 
      const pdf = new jsPDF('p', 'mm', [imgWidth, pdfHeight]);
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Aarogyam-Report-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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
    utterance.lang = lang === 'Hindi' ? 'hi-IN' : lang === 'Marathi' ? 'mr-IN' : 'en-IN';
    
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
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-charcoal text-white px-6 py-5 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
        >
          {isGeneratingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
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

      <div ref={reportRef} className="bg-background p-6 space-y-6">
        {/* Report Header Logo (for PDF) */}
        <div className="hidden pdf-only flex items-center gap-2 mb-4 border-b pb-4">
             <div className="text-2xl font-black text-[#0F766E]">AAROGYAM AI</div>
             <div className="text-[8px] text-[#6B7280] uppercase ml-auto">Medical Report • Non-Diagnostic Guidance</div>
        </div>

        <div className={`flex items-center gap-4 px-6 py-5 rounded-2xl font-bold text-xl border shadow-sm ${risk.bg} ${risk.color} ${risk.border}`}>
          {risk.icon}
          <span>{risk.label} — {assessment.recommendation === 'Urgent care' ? t.urgent : assessment.recommendation === 'Doctor' ? t.doctor : t.rest}</span>
        </div>

        {uploadedImage && (
          <div className="natural-card bg-white">
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
              <div key={i} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
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
          <div className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm">
            <h3 className="section-title mb-2 tracking-tight text-xs text-[#6B7280]">{t.reasoningTitle}</h3>
            <div className="text-[#1F2937] text-sm leading-relaxed max-w-none">
              <ReactMarkdown>{assessment.reasoning}</ReactMarkdown>
            </div>
          </div>

          <div className="bg-[#F0FDF4] p-6 rounded-[16px] border border-[#BBF7D0] shadow-sm">
            <h3 className="section-title mb-2 text-[#0F766E] flex items-center gap-2">
               <BrainCircuit className="w-4 h-4" />
               {lang === 'English' ? 'Explainable AI ("Why?")' : 'निष्कर्ष का कारण'}
            </h3>
            <div className="text-[#0F766E] text-sm leading-relaxed font-medium">
              <ReactMarkdown>{assessment.xaiExplain}</ReactMarkdown>
            </div>
          </div>
        </div>

        <div className={cn("natural-card border-l-8", risk.bg, risk.border)}>
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
        className="flex items-center justify-center gap-2 py-4 text-gray font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.startOver}
      </button>
    </motion.div>
  );
};


