import React, { useEffect, useState } from 'react';
import useResponsive from '../hooks/useResponsive';

interface CircleBackgroundProps {
  className?: string;
}

const CircleBackground: React.FC<CircleBackgroundProps> = ({ className = '' }) => {
  const responsive = useResponsive();
  const [circleSizes, setCircleSizes] = useState({
    largest: '600px',
    large: '480px',
    medium: '360px',
    small: '240px'
  });
  
  // Adjust circle sizes based on screen size
useEffect(() => {
  if (responsive.width === 0) return; // Skip initial render
  
  // Base size calculation based on viewport dimensions
  const baseDimension = Math.min(responsive.width, responsive.height);
  const sizeFactor = baseDimension < 375 ? 0.8 : 1;
  // Increase base size by approximately 150px
  const scaledBaseSizePx = Math.min(850, baseDimension * 1.0* sizeFactor);
  
  setCircleSizes({
    largest: `${scaledBaseSizePx}px`,
    large: `${scaledBaseSizePx * 0.8}px`,
    medium: `${scaledBaseSizePx * 0.6}px`,
    small: `${scaledBaseSizePx * 0.4}px`
  });
}, [responsive.width, responsive.height]);
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Center point of all circles is moved up by 15% of viewport height */}
      <div className="absolute top-[24.6%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {/* Circle components remain the same */}
          <div 
            className="absolute rounded-full bg-white opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{ width: circleSizes.largest, height: circleSizes.largest }}
          />
          
          {/* Large circle */}
          <div 
            className="absolute rounded-full bg-white opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{ width: circleSizes.large, height: circleSizes.large }}
          />
          
          {/* Medium circle */}
          <div 
            className="absolute rounded-full bg-white opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{ width: circleSizes.medium, height: circleSizes.medium }}
          />
          
          {/* Smallest circle */}
          <div 
            className="absolute rounded-full bg-white opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{ width: circleSizes.small, height: circleSizes.small }}
          />
        </div>
      </div>
    </div>
  );
};

export default CircleBackground;
