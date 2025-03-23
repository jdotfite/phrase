import React from 'react';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime, isRunning }) => {
  // Calculate percentage of time left
  const percentage = (timeLeft / totalTime) * 100;
  
  // Determine color based on time left
  const getColor = () => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Make the timer border pulse when time is running low
  const getPulseClass = () => {
    if (percentage <= 10 && isRunning) {
      return 'animate-pulse';
    }
    return '';
  };

  return (
    <div className={`relative w-16 h-16 rounded-full border-4 border-gray-200 ${getPulseClass()}`}>
      <div 
        className={`absolute inset-0.5 rounded-full ${getColor()} transition-all duration-1000`}
        style={{ 
          clipPath: `circle(${percentage}% at center)` 
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold">{timeLeft}</span>
      </div>
    </div>
  );
};

export default Timer;
