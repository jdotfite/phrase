import React from 'react';
import type { LoadingSpinnerProps } from '@/types/types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`
          animate-spin rounded-full
          border-t-2 border-b-2 border-blue-500
          ${sizeClasses[size]}
        `}
      />
    </div>
  );
};

export default LoadingSpinner;