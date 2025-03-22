import React from 'react';
import { cn } from '@/lib/utils';

interface DifficultyIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  difficulty: number;
}

const DifficultyIndicator = React.forwardRef<HTMLDivElement, DifficultyIndicatorProps>(
  ({ difficulty, className, ...props }, ref) => {
    // Determine the width based on difficulty
    const width = 
      difficulty === 1 ? 'w-1/3' : 
      difficulty === 2 ? 'w-2/3' : 
      difficulty === 3 ? 'w-full' : 'w-0';
    
    return (
      <div 
        ref={ref} 
        className={cn("w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600", className)}
        {...props}
      >
        <div className={cn(`${width} h-2.5 rounded-full bg-gray-400`)}></div>
      </div>
    );
  }
);

DifficultyIndicator.displayName = "DifficultyIndicator";

export { DifficultyIndicator };