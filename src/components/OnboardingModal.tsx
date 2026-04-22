import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Languages, Activity, MapPin, X, ArrowRight } from 'lucide-react';
import { Language } from '../constants';

interface OnboardingModalProps {
  lang: Language;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ lang, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('aarogyam_onboarding_seen');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('aarogyam_onboarding_seen', 'true');
    setIsOpen(false);
    onClose();
  };

  const content = {
    English: {
      title: 'Welcome to Aarogyam AI',
      subtitle: 'Your Rural Health Companion',
      intro: 'Aarogyam AI helps you identify early signs of common diseases in rural India using AI and local medical knowledge.',
      features: [
        { icon: <Activity className="w-5 h-5" />, title: 'Symptom Analysis', desc: 'Scan skin issues or describe symptoms in your local language.' },
        { icon: <Languages className="w-5 h-5" />, title: 'Multi-Language', desc: 'Fully supports Hindi, Marathi, and Hinglish for easy communication.' },
        { icon: <MapPin className="w-5 h-5" />, title: 'Nearby Hospitals', desc: 'Find Primary Health Centers and clinics close to your location.' },
        { icon: <Shield className="w-5 h-5" />, title: 'First Aid & SOS', desc: 'Quick guides for snakebites, fever, and emergency contact tools.' }
      ],
      disclaimer: 'DISCLAIMER: This tool is for informational purposes only and is NOT a medical diagnosis. Always consult a real doctor.',
      start: 'Get Started'
    },
    Hindi: {
      title: 'Aarogyam AI में आपका स्वागत है',
      subtitle: 'आपका ग्रामीण स्वास्थ्य साथी',
      intro: 'Aarogyam AI आपको AI और स्थानीय चिकित्सा ज्ञान का उपयोग करके ग्रामीण भारत में सामान्य बीमारियों के शुरुआती संकेतों की पहचान करने में मदद करता है।',
      features: [
        { icon: <Activity className="w-5 h-5" />, title: 'लक्षण विश्लेषण', desc: 'अपनी स्थानीय भाषा में त्वचा की समस्याओं को स्कैन करें या लक्षणों का वर्णन करें।' },
        { icon: <Languages className="w-5 h-5" />, title: 'बहुभाषी', desc: 'आसान संचार के लिए हिंदी, मराठी और हिंग्लिश का पूर्ण समर्थन।' },
        { icon: <MapPin className="w-5 h-5" />, title: 'नजदीकी अस्पताल', desc: 'अपने स्थान के पास प्राथमिक स्वास्थ्य केंद्र और क्लीनिक खोजें।' },
        { icon: <Shield className="w-5 h-5" />, title: 'प्राथमिक चिकित्सा', desc: 'सांप के काटने, बुखार और आपातकालीन संपर्क के लिए त्वरित मार्गदर्शिका।' }
      ],
      disclaimer: 'अस्वीकरण: यह उपकरण केवल सूचनात्मक उद्देश्यों के लिए है और चिकित्सा निदान नहीं है। हमेशा डॉक्टर से सलाह लें।',
      start: 'शुरू करें'
    },
    Marathi: {
      title: 'Aarogyam AI मध्ये आपले स्वागत आहे',
      subtitle: 'तुमचा ग्रामीण आरोग्य सोबती',
      intro: 'Aarogyam AI तुम्हाला AI आणि स्थानिक वैद्यकीय ज्ञानाचा वापर करून ग्रामीण भारतातील सामान्य आजारांची सुरुवातीची लक्षणे ओळखण्यास मदत करते.',
      features: [
        { icon: <Activity className="w-5 h-5" />, title: 'लक्षण विश्लेषण', desc: 'त्वचेच्या समस्या स्कॅन करा किंवा तुमच्या स्थानिक भाषेत लक्षणांचे वर्णन करा.' },
        { icon: <Languages className="w-5 h-5" />, title: 'बहुभाषिक', desc: 'सोप्या संवादासाठी हिंदी, मराठी आणि हिंग्लिशला पूर्ण पाठिंबा.' },
        { icon: <MapPin className="w-5 h-5" />, title: 'जवळपासची रुग्णालये', desc: 'तुमच्या स्थानाजवळ प्राथमिक आरोग्य केंद्रे आणि दवाखाने शोधा.' },
        { icon: <Shield className="w-5 h-5" />, title: 'प्रथमोपचार', desc: 'सर्पदंश, ताप आणि आपत्कालीन संपर्कासाठी त्वरित मार्गदर्शक.' }
      ],
      disclaimer: 'सूचना: हे साधन केवळ माहितीसाठी आहे आणि वैद्यकीय निदान नाही. नेहमी डॉक्टरांचा सल्ला घ्या.',
      start: 'सुरू करा'
    }
  }[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-surface w-full max-w-lg rounded-[40px] shadow-3xl overflow-hidden relative border border-secondary/20"
          >
            <div className="p-8 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-secondary/10 rounded-full transition-colors cursor-pointer">
                  <X className="w-6 h-6 text-gray" />
                </button>
              </div>
              
              <h2 className="text-3xl font-black text-charcoal tracking-tight mb-1">{content.title}</h2>
              <p className="text-primary font-bold uppercase tracking-widest text-[10px] mb-4">{content.subtitle}</p>
              <p className="text-sm text-gray leading-relaxed mb-8">{content.intro}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {content.features.map((f, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-background border border-secondary/50 rounded-2xl">
                    <div className="mt-1 text-primary">{f.icon}</div>
                    <div>
                      <h4 className="font-bold text-xs text-charcoal">{f.title}</h4>
                      <p className="text-[10px] text-gray leading-tight mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-error/5 border border-error/10 rounded-2xl mb-8">
                <p className="text-[10px] text-error font-medium leading-normal italic text-center">
                  {content.disclaimer}
                </p>
              </div>
              
              <button 
                onClick={handleClose}
                className="w-full py-5 bg-charcoal text-white rounded-[24px] font-bold text-sm uppercase tracking-widest hover:bg-charcoal/90 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-charcoal/20"
              >
                {content.start}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="p-4 text-center">
               <p className="text-[9px] text-gray/50 font-bold uppercase tracking-tighter">Designed for accessibility & early medical awareness</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
