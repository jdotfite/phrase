import React from 'react';
import { Flame } from 'lucide-react';

interface ReviewProgressProps {
  streak: number;
}

const ReviewProgress: React.FC<ReviewProgressProps> = ({ streak }) => {
  const percentage = (streak % 10) * 10; // Calculate percentage based on streak mod 10

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
      <div className="text-gray-300 flex items-center gap-2 ">
       
        Review Hot Streak: {streak}
      </div>
      <div className="w-24 bg-gray-700 rounded-full h-2">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
       <Flame className="w-4 h-4 text-orange-500" />
    </div>
  );
};

export default ReviewProgress;