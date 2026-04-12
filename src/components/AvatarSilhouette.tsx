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
      {/* Head */}
      <circle cx="100" cy="50" r="30" stroke="white" strokeWidth="2" strokeDasharray="5 5" />
      {/* Torso */}
      <path d="M70 85 C 70 85, 40 100, 30 180 L 170 180 C 160 100, 130 85, 130 85" stroke="white" strokeWidth="2" strokeDasharray="5 5" />
      {/* Arms (A-pose) */}
      <path d="M40 100 L 10 250" stroke="white" strokeWidth="2" strokeDasharray="5 5" />
      {/* Legs */}
      <path d="M70 250 L 70 380 M 130 250 L 130 380" stroke="white" strokeWidth="2" strokeDasharray="5 5" />
      {/* Guidelines for hips */}
      <path d="M70 250 Q 100 240, 130 250" stroke="white" strokeWidth="1" strokeDasharray="5 5" />
    </svg>
  );
};

export default AvatarSilhouette;
