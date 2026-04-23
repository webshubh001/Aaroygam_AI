import React from 'react';
import { motion } from 'motion/react';

interface ReportImageProps {
  imageData: string;
  mimeType: string;
  boundingBoxes?: { box_2d: number[]; label: string }[];
}

export const ReportImage: React.FC<ReportImageProps> = ({ imageData, mimeType, boundingBoxes }) => {
  if (!imageData) return null;

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.2)] bg-black">
      <img 
        src={`data:${mimeType};base64,${imageData}`} 
        className="w-full h-full object-cover opacity-90" 
        alt="Analyzed skin area"
      />
      
      {boundingBoxes && boundingBoxes.length > 0 && (
         <div className="absolute inset-0 bg-[#0F172A]/20 pointer-events-none mix-blend-multiply" />
      )}

      {boundingBoxes?.map((box, index) => {
        // [ymin, xmin, ymax, xmax]
        const [ymin, xmin, ymax, xmax] = box.box_2d;
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.3 + 0.2, duration: 0.6, ease: "easeOut" }}
            key={index}
            className="absolute rounded-lg flex items-center justify-center overflow-visible"
            style={{
              top: `${ymin / 10}%`,
              left: `${xmin / 10}%`,
              width: `${(xmax - xmin) / 10}%`,
              height: `${(ymax - ymin) / 10}%`,
              border: '2px solid rgba(239, 68, 68, 0.8)',
              background: 'radial-gradient(circle, rgba(239,68,68,0.5) 0%, rgba(239,68,68,0.2) 60%, rgba(239,68,68,0) 100%)',
              boxShadow: '0 0 20px rgba(239,68,68,0.4), inset 0 0 20px rgba(239,68,68,0.3)'
            }}
          >
            {/* Corner brackets */}
            <div className="absolute top-[-2px] left-[-2px] w-3 h-3 border-t-4 border-l-4 border-red-500 rounded-tl-sm" />
            <div className="absolute top-[-2px] right-[-2px] w-3 h-3 border-t-4 border-r-4 border-red-500 rounded-tr-sm" />
            <div className="absolute bottom-[-2px] left-[-2px] w-3 h-3 border-b-4 border-l-4 border-red-500 rounded-bl-sm" />
            <div className="absolute bottom-[-2px] right-[-2px] w-3 h-3 border-b-4 border-r-4 border-red-500 rounded-br-sm" />
            
            {/* Pulse effect */}
            <div className="absolute inset-0 animate-pulse bg-red-500 rounded-lg mix-blend-overlay opacity-30"></div>
            
            {/* Label */}
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.3 + 0.6 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-sm text-white text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded shadow-md whitespace-nowrap z-10 border border-red-400"
            >
              {box.label}
            </motion.span>
          </motion.div>
        );
      })}

      <div className="absolute top-2 left-2 flex items-center gap-2">
         {boundingBoxes && boundingBoxes.length > 0 && (
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[9px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Anomaly Detected
            </div>
         )}
      </div>

      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-full">
        AI Scan Complete
      </div>
    </div>
  );
};
