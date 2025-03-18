// components/reviewer/ReviewerCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Reviewer } from '@/types/types';

interface ReviewerCardProps {
  reviewer: Reviewer;
  avatar: string;
  onClick: () => void;
}

const ReviewerCard = ({ reviewer, avatar, onClick }: ReviewerCardProps) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-gray-800 p-4 rounded-lg cursor-pointer text-center w-full mb-8"
    onClick={onClick}
  >
    <div className="text-6xl mb-2">{avatar}</div>
    <h3 className="text-lg font-bold mb-1 text-white">{reviewer.name}</h3>
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm text-gray-300">
        {reviewer.total_reviews} reviews
      </span>
      {reviewer.current_streak >= 3 && (
        <span className="text-lg">🔥</span>
      )}
      {reviewer.total_reviews >= 50 && (
        <Star className="w-4 h-4 text-yellow-500" />
      )}
    </div>
  </motion.div>
);

export default ReviewerCard;