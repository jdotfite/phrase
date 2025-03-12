// components/reviewer/Leaderboard.tsx
import React from 'react';
import { Award } from 'lucide-react';
import type { Reviewer } from '@/types/types';

interface LeaderboardProps {
  reviewers: Reviewer[];
}

const Leaderboard = ({ reviewers }: LeaderboardProps) => (
  <div className="bg-gray-800 p-4 rounded-lg mt-4">
    <div className="flex items-center gap-2 mb-4">
      <Award className="w-6 h-6 text-yellow-500" />
      <h3 className="text-lg font-bold text-white">Leaderboard</h3>
    </div>
    <div className="space-y-2">
      {reviewers
        .sort((a, b) => b.total_reviews - a.total_reviews)
        .slice(0, 5)
        .map((reviewer, index) => (
          <div
            key={reviewer.id}
            className="flex items-center justify-between p-2 rounded bg-gray-700"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index]}</span>
              <span className="text-white">{reviewer.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white">{reviewer.total_reviews}</span>
            </div>
          </div>
        ))}
    </div>
  </div>
);

export default Leaderboard;