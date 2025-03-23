import React from 'react';

interface CircleBackgroundProps {
  className?: string;
}

const CircleBackground: React.FC<CircleBackgroundProps> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div className="absolute top-[35vh] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {/* Largest circle - increased sizes by ~50% */}
          <div className="absolute rounded-full bg-white opacity-10 w-[600px] h-[600px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Medium circle */}
          <div className="absolute rounded-full bg-white opacity-10 w-[480px] h-[480px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Small circle */}
          <div className="absolute rounded-full bg-white opacity-10 w-[360px] h-[360px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Smallest circle */}
          <div className="absolute rounded-full bg-white opacity-10 w-[240px] h-[240px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default CircleBackground;

