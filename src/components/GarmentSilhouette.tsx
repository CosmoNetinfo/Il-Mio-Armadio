import React from 'react';

const GarmentSilhouette = () => {
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
        opacity: 0.6,
        zIndex: 10
      }}
    >
      <g filter="url(#glow-garment)">
        {/* Gruccia Stilizzata */}
        <path 
          d="M100 80 C 110 80, 115 70, 115 65 C 115 60, 110 55, 100 55 C 90 55, 85 60, 85 65" 
          stroke="white" 
          strokeWidth="1.5" 
        />
        <path 
          d="M40 120 L 100 80 L 160 120" 
          stroke="white" 
          strokeWidth="2" 
        />
        {/* Sagoma Maglia Vaga */}
        <path 
          d="M40 120 L 30 200 L 50 200 L 50 320 L 150 320 L 150 200 L 170 200 L 160 120" 
          stroke="white" 
          strokeWidth="1" 
          opacity="0.5"
          strokeDasharray="4 4"
        />
      </g>
      
      <defs>
        <filter id="glow-garment" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
};

export default GarmentSilhouette;
