import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/ThemeContext';

interface DifficultyIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  difficulty: number;
}

const DifficultyIndicator = React.forwardRef<HTMLDivElement, DifficultyIndicatorProps>(
  ({ difficulty, className, ...props }, ref) => {
    const { accent } = useTheme();
    
    // Get accent-specific background colors
    const getAccentBackground = () => {
      switch (accent) {
        case 'blue':
          return 'bg-blue-500';
        case 'green':
          return 'bg-emerald-500';
        case 'purple':
          return 'bg-purple-500';
        case 'orange':
          return 'bg-orange-500';
        default: // grayscale
          return 'bg-gray-500';
      }
    };
    
    // Get intensity-based styles for difficulty
    const getDifficultyStyle = () => {
      const baseColor = getAccentBackground();
      
      switch (difficulty) {
        case 1: 
          return {
            width: 'w-1/3',
            opacity: 'opacity-50'
          };
        case 2: 
          return {
            width: 'w-2/3',
            opacity: 'opacity-75'
          };
        case 3: 
          return {
            width: 'w-full',
            opacity: 'opacity-100'
          };
        default:
          return {
            width: 'w-0',
            opacity: 'opacity-0'
          };
      }
    };
    
    const diffStyle = getDifficultyStyle();
    
    return (
      <div 
        ref={ref} 
        className={cn("w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700", className)}
        {...props}
      >
        <div className={cn(
          diffStyle.width,
          diffStyle.opacity,
          "h-2.5 rounded-full transition-all duration-300",
          getAccentBackground()
        )} />
      </div>
    );
  }
);

DifficultyIndicator.displayName = "DifficultyIndicator";

export { DifficultyIndicator };