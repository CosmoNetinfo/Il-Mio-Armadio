import React from 'react';

const AvatarSilhouette = () => {
  return (
    <svg 
      viewBox="0 0 200 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        opacity: 0.5,
        zIndex: 10
      }}
    >
      {/* Corpo Anatomico - Linea Sottile Glow */}
      <g filter="url(#glow)">
        {/* Testa */}
        <path 
          d="M100 25 C 112 25, 122 35, 122 55 C 122 75, 112 85, 100 85 C 88 85, 78 75, 78 55 C 78 35, 88 25, 100 25 Z" 
          stroke="white" 
          strokeWidth="1" 
          opacity="0.9"
        />
        {/* Spalle e busto */}
        <path 
          d="M65 105 C 45 105, 35 125, 35 160 C 35 200, 45 230, 75 240" 
          stroke="white" 
          strokeWidth="1" 
          opacity="0.9"
        />
        <path 
          d="M135 105 C 155 105, 165 125, 165 160 C 165 200, 155 230, 125 240" 
          stroke="white" 
          strokeWidth="1" 
          opacity="0.9"
        />
        {/* Fianchi e Gambe */}
        <path 
          d="M75 240 C 65 240, 60 280, 60 380" 
          stroke="white" 
          strokeWidth="1" 
          opacity="0.9"
        />
        <path 
          d="M125 240 C 135 240, 140 280, 140 380" 
          stroke="white" 
          strokeWidth="1" 
          opacity="0.9"
        />
        {/* Braccia interne */}
        <path 
          d="M78 110 L 78 200" 
          stroke="white" 
          strokeWidth="0.5" 
          opacity="0.4"
        />
        <path 
          d="M122 110 L 122 200" 
          stroke="white" 
          strokeWidth="0.5" 
          opacity="0.4"
        />
      </g>
      
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
};

export default AvatarSilhouette;
