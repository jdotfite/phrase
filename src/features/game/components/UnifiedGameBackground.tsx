import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import useResponsive from '../hooks/useResponsive';
import Logo from './Logo';

interface UnifiedGameBackgroundProps {
  showLogo?: boolean;
  logoVerticalOffset?: number; // Adjust logo position in pixels (positive = down)
  logoScale?: number;          // Scale factor for the logo only (1 = normal, 1.2 = 20% larger)
}

const UnifiedGameBackground: React.FC<UnifiedGameBackgroundProps> = ({ 
  showLogo = true,
  logoVerticalOffset = 0,
  logoScale = 1
}) => {
  const responsive = useResponsive();
  const [circleSizes, setCircleSizes] = useState({
    largest: '600px',
    large: '480px',
    medium: '360px',
    small: '240px'
  });

  // Adjust circle sizes based on screen size
  useEffect(() => {
    if (responsive.width === 0) return;

    const baseSize = Math.min(
      window.innerWidth * 0.85,
      window.innerHeight * 0.7
    );

    const scaledBaseSizePx = Math.min(1050, baseSize);

    setCircleSizes({
      largest: `${scaledBaseSizePx}px`,
      large: `${scaledBaseSizePx * 0.8}px`,
      medium: `${scaledBaseSizePx * 0.6}px`,
      small: `${scaledBaseSizePx * 0.4}px`
    });
  }, [responsive.width, responsive.height]);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: '25%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className="relative flex items-center justify-center"
          style={{
            width: circleSizes.largest,
            height: circleSizes.largest
          }}
        >
          {/* Background Circles */}
          <div className="absolute inset-0 rounded-full bg-white opacity-10"></div>
          <div className="absolute rounded-full bg-white opacity-10" style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: circleSizes.large,
            height: circleSizes.large
          }}></div>
          <div className="absolute rounded-full bg-white opacity-10" style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: circleSizes.medium,
            height: circleSizes.medium
          }}></div>
          <div className="absolute rounded-full bg-white opacity-10" style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: circleSizes.small,
            height: circleSizes.small
          }}></div>

          {/* Logo - centered and scaled independently */}
          {showLogo && (
            <div
              className="absolute flex flex-col items-center justify-center"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                marginTop: `${logoVerticalOffset}px`
              }}
            >
              <div
                style={{
                  transform: `scale(${logoScale})`,
                  transformOrigin: 'center center',
                  width: `calc(${circleSizes.small} * 0.9)`,
                  height: `calc(${circleSizes.small} * 0.9)`
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/images/game-logo.png?v=4"
                    alt="Phrase Game Logo"
                    fill
                    style={{
                      objectFit: 'contain',
                      filter: 'drop-shadow(0px 8px 8px rgba(0, 0, 0, 0.3))'
                    }}
                    priority
                  />
                </div>
                <div className="mt-4">
                  <Logo size="large" className="font-extrabold" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedGameBackground;
