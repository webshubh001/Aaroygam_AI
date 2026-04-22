import React from 'react';

interface ReportImageProps {
  imageData: string;
  mimeType: string;
  boundingBoxes?: { box_2d: number[]; label: string }[];
}

export const ReportImage: React.FC<ReportImageProps> = ({ imageData, mimeType, boundingBoxes }) => {
  if (!imageData) return null;

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-[#A7F3D0] shadow-lg">
      <img 
        src={`data:${mimeType};base64,${imageData}`} 
        className="w-full h-full object-cover" 
        alt="Analyzed skin area"
      />
      {boundingBoxes?.map((box, index) => {
        // [ymin, xmin, ymax, xmax]
        const [ymin, xmin, ymax, xmax] = box.box_2d;
        return (
          <div 
            key={index}
            className="absolute border-2 border-[#EF4444] bg-[#EF4444]"
            style={{
              top: `${ymin / 10}%`,
              left: `${xmin / 10}%`,
              width: `${(xmax - xmin) / 10}%`,
              height: `${(ymax - ymin) / 10}%`,
              backgroundColor: 'rgba(239, 68, 68, 0.2)' // Using standard rgba for compatibility
            }}
          >
            <span className="absolute -top-5 left-0 bg-[#EF4444] text-white text-[8px] font-bold px-1 rounded">
              {box.label}
            </span>
          </div>
        );
      })}
      <div className="absolute bottom-2 right-2 bg-[#1F2937] text-white text-[8px] px-2 py-1 rounded-full">
        Heatmap Overlay (AI Focus)
      </div>
    </div>
  );
};
