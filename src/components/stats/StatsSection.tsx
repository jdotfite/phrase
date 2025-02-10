import React from 'react';
import { useCountUp } from '@/hooks/useCountUp';
import type { StatsSectionProps } from '@/types/types';

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  suffix = '', 
  delay = 0 
}) => {
  const animatedValue = useCountUp(value, { 
    duration: 2000,
    delay 
  });

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow">
      <div className="text-2xl font-bold text-white">
        {animatedValue.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-400">{title}</div>
    </div>
  );
};

const StatsSection: React.FC<StatsSectionProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="bg-gray-800 p-6 rounded-lg shadow animate-pulse"
          >
            <div className="h-8 bg-gray-700 rounded w-24 mb-2" />
            <div className="h-4 bg-gray-700 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
      <StatCard
        title="Total Phrases"
        value={stats.total}
        delay={0}
      />
      <StatCard
        title="Unique Categories"
        value={stats.uniqueCategories}
        delay={100}
      />
      <StatCard
        title="Easy Phrases"
        value={stats.difficultyBreakdown.easy}
        suffix="%"
        delay={200}
      />
      <StatCard
        title="Medium Phrases"
        value={stats.difficultyBreakdown.medium}
        suffix="%"
        delay={300}
      />
      <StatCard
        title="Hard Phrases"
        value={stats.difficultyBreakdown.hard}
        suffix="%"
        delay={400}
      />
    </div>
  );
};

export default StatsSection;