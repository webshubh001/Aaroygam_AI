import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { compressImage } from '../lib/utils';

interface CameraCaptureProps {
  onCapture: (image: { data: string; mimeType: string }) => void;
  onClose: () => void;
  lang: 'English' | 'Hindi' | 'Marathi';
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, lang }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);

  const startCamera = async () => {
    setIsStarting(true);
    setError(null);
    try {
      // Clean up existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = { 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }, 
        audio: false 
      };

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        console.warn("Back camera constraint failed, trying basic video...");
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Force play specifically for mobile/low-power modes
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.error("Auto-play failed:", playErr);
        }
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      let msg = lang === 'English' 
        ? "Could not access camera. Please ensure permissions are granted in browser settings." 
        : "कॅमेरा ॲक्सेस करता आला नाही. कृपया परवानग्या दिल्या आहेत याची खात्री करा.";
      
      if (err.name === 'NotAllowedError') {
        msg = lang === 'English'
          ? "Camera Permission Denied. Please click the 'Lock' icon in your browser address bar to enable it."
          : "कॅमेरा परवानगी नाकारली. कृपया ती सक्षम करण्यासाठी तुमच्या ब्राउझरमध्ये 'लॉक' चिन्हावर क्लिक करा.";
      }
      setError(msg);
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = async () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        try {
          const compressed = await compressImage(dataUrl);
          setCapturedImage(`data:image/jpeg;base64,${compressed}`);
        } catch (e) {
          setCapturedImage(dataUrl);
        }
        
        // Stop stream to save battery/resources
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      const base64Data = capturedImage.split(',')[1];
      onCapture({ data: base64Data, mimeType: 'image/jpeg' });
      onClose();
    }
  };

  const labels = {
    English: {
      title: 'Health Scanner',
      capture: 'Capture',
      retake: 'Try Again',
      use: 'Use Photo',
      instruction: 'Position the infection or rash clearly in view'
    },
    Hindi: {
      title: 'हेल्थ स्कैनर',
      capture: 'कैप्चर',
      retake: 'फिर से लें',
      use: 'फोटो का उपयोग करें',
      instruction: 'संक्रमण या दाने को स्पष्ट रूप से सामने रखें'
    },
    Marathi: {
      title: 'हेल्थ स्कॅनर',
      capture: 'कॅप्चर',
      retake: 'पुन्हा घ्या',
      use: 'फोटो वापरा',
      instruction: 'संसर्ग किंवा पुरळ स्पष्टपणे समोर ठेवा'
    }
  }[lang];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-charcoal/90 backdrop-blur-md"
    >
      <div className="bg-surface w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative border border-secondary/20">
        <div className="p-6 flex items-center justify-between border-b border-secondary/10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl">
               <Camera className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-charcoal">{labels.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary/20 rounded-full transition-colors cursor-pointer">
            <X className="w-6 h-6 text-gray" />
          </button>
        </div>

        <div className="relative aspect-square bg-black flex items-center justify-center overflow-hidden">
          {(!capturedImage && !error) && (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className={`w-full h-full object-cover bg-black transition-opacity duration-300 ${isStarting ? 'opacity-0' : 'opacity-1'}`}
              />
              {!isStarting && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative w-64 h-64 border border-white/10 shadow-[0_0_0_1000px_rgba(0,0,0,0.4)]">
                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                    {/* Animated scanning line */}
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }} 
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} 
                      className="absolute left-0 right-0 h-0.5 bg-primary/70 shadow-[0_0_12px_3px_rgba(15,118,110,0.6)]" 
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Flash Effect */}
          <AnimatePresence>
            {isFlashing && (
              <motion.div 
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white z-40"
              />
            )}
          </AnimatePresence>

          {isStarting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/50 bg-black/60 backdrop-blur-sm z-10">
              <div className="w-12 h-12 border-4 border-t-primary border-white/10 rounded-full animate-spin"></div>
              <span className="text-xs font-bold uppercase tracking-widest">{lang === 'English' ? 'Initializing...' : 'सुरू होत आहे...'}</span>
            </div>
          )}

          {capturedImage && (
            <img 
               src={capturedImage} 
               alt="Captured" 
               className="w-full h-full object-cover"
             />
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-black/80 z-20">
              <div className="text-4xl">⚠️</div>
              <p className="text-sm text-white font-medium">{error}</p>
              <button 
                onClick={startCamera}
                className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                {lang === 'English' ? 'Retry' : 'पुन्हा प्रयत्न करा'}
              </button>
            </div>
          )}

          {!capturedImage && !error && !isStarting && (
            <div className="absolute bottom-6 left-0 right-0 text-center px-8 z-10 pointer-events-none">
              <p className="text-[10px] text-white/80 bg-black/40 backdrop-blur-sm py-1.5 px-3 rounded-full inline-block font-medium">
                {labels.instruction}
              </p>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-8 flex items-center justify-center gap-4">
          {!capturedImage ? (
            <button
              onClick={takePhoto}
              disabled={isStarting || !!error}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="w-16 h-16 rounded-full border-4 border-white"></div>
            </button>
          ) : (
            <div className="flex gap-4 w-full">
              <button
                onClick={handleRetake}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 border-2 border-secondary rounded-2xl text-gray font-bold hover:bg-secondary/10 transition-all cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{labels.retake}</span>
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-success text-white rounded-2xl font-bold hover:bg-success/90 shadow-lg shadow-success/20 transition-all cursor-pointer"
              >
                <Check className="w-5 h-5" />
                <span>{labels.use}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
