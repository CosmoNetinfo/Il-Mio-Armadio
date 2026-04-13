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
      {/* Corpo principale - Linea sottile ed elegante */}
      <path 
        d="M100 20 C 115 20, 130 35, 130 55 C 130 75, 115 90, 100 90 C 85 90, 70 75, 70 55 C 70 35, 85 20, 100 20 Z" 
        stroke="white" 
        strokeWidth="1.5" 
        opacity="0.8"
      />
      <path 
        d="M60 100 C 40 100, 30 140, 30 180 C 30 220, 45 240, 70 240 L 130 240 C 155 240, 170 220, 170 180 C 170 140, 160 100, 140 100 Z" 
        stroke="white" 
        strokeWidth="1.5" 
        opacity="0.8"
      />
      <path 
        d="M75 240 L 70 380 M 125 240 L 130 380" 
        stroke="white" 
        strokeWidth="1.5" 
        opacity="0.8"
      />
      
      {/* Glow effect */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
};

export default AvatarSilhouette;
