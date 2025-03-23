import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  // Size classes mapping
  const sizeClasses = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl'
  };

  return (
    <div className={`font-bold flex flex-col items-center ${sizeClasses[size]} ${className}`}>
      <span className="text-white">Phrase</span>
      <span className="text-[#5bfdf8]">Game</span>
    </div>
  );
};

export default Logo;

