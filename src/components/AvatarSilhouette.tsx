import React from 'react';

const AvatarSilhouette = () => {
  return (
    <svg 
      viewBox="0 0 200 600" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        opacity: 0.6,
        zIndex: 10
      }}
    >
      <g filter="url(#glow-anatomical)">
        {/* Testa e Collo */}
        <path d="M100 40 C 92 40, 85 47, 85 55 C 85 63, 92 70, 100 70 C 108 70, 115 63, 115 55 C 115 47, 108 40, 100 40 Z" stroke="white" strokeWidth="1" />
        <path d="M95 70 L 95 80 Q 100 85, 105 80 L 105 70" stroke="white" strokeWidth="1" />
        
        {/* Torso Anatomico (Croquis style) */}
        <path d="M100 85 
                 C 130 85, 150 90, 155 110 
                 C 160 140, 140 180, 135 190 
                 C 130 200, 140 220, 145 250 
                 C 150 280, 145 300, 130 310
                 L 70 310
                 C 55 300, 50 280, 55 250
                 C 60 220, 70 200, 65 190
                 C 60 180, 40 140, 45 110
                 C 50 90, 70 85, 100 85 Z" stroke="white" strokeWidth="1" />
        
        {/* Linee di riferimento spalle e vita */}
        <path d="M50 115 L 150 115" stroke="white" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
        <path d="M68 215 L 132 215" stroke="white" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.6" />
        
        {/* Braccia */}
        <path d="M48 110 C 35 120, 25 180, 30 250 L 35 320" stroke="white" strokeWidth="1" />
        <path d="M152 110 C 165 120, 175 180, 170 250 L 165 320" stroke="white" strokeWidth="1" />
        
        {/* Gambe Affusolate */}
        <path d="M75 310 C 70 380, 65 480, 70 550 L 80 575" stroke="white" strokeWidth="1" />
        <path d="M125 310 C 130 380, 135 480, 130 550 L 120 575" stroke="white" strokeWidth="1" />
        
        {/* Piedi */}
        <path d="M70 555 C 65 570, 75 575, 80 575" stroke="white" strokeWidth="1" />
        <path d="M130 555 C 135 570, 125 575, 120 575" stroke="white" strokeWidth="1" />
      </g>
      
      <defs>
        <filter id="glow-anatomical" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
};

export default AvatarSilhouette;
