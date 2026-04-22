import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'English' | 'Hindi' | 'Marathi';
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-[32px] flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b flex items-center justify-between bg-primary/5">
          <h2 className="text-xl font-black text-primary uppercase tracking-tighter">
            {lang === 'English' ? 'Privacy Policy' : lang === 'Hindi' ? 'गोपनीयता नीति' : 'गोपनीयता धोरण'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto text-sm text-charcoal leading-relaxed space-y-6">
          <p className="font-bold underline italic bg-accent/10 p-4 rounded-xl border border-accent/20">
            {lang === 'English' 
              ? 'Aarogyam AI is an informational tool only. It does not store medical records on our servers.' 
              : 'आरोग्यम AI केवल एक सूचनात्मक उपकरण है। यह हमारे सर्वर पर मेडिकल रिकॉर्ड संग्रहीत नहीं करता है।'}
          </p>

          <section>
            <h3 className="font-bold text-lg mb-2">1. Data Storage</h3>
            <p>All assessment history and symptoms are stored locally on your device (Local Storage). We use Google Gemini AI to analyze your symptoms, which involves sending the query text and uploaded image to Google APIs. We do not link this data to your identity.</p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">2. Accuracy</h3>
            <p>Aarogyam AI predictions are based on AI patterns and should never be taken as a final medical diagnosis. Always consult a qualified doctor for clinical decisions.</p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">3. Permissions</h3>
            <p>The app requests Camera and Location access. Location is used solely to find nearby hospitals, and Camera is used only for analyzing skin conditions when you choose to upload a photo.</p>
          </section>

          <p className="text-[10px] text-gray opacity-60 pt-6">Last Updated: April 22, 2026</p>
        </div>
      </motion.div>
    </div>
  );
};
