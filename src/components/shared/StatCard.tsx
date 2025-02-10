import React from 'react';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  loading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  iconBackground?: string;
  description?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  change,
  loading = false,
  trend,
  icon,
  iconBackground,
  description,
  className
}) => {
  const animatedValue = useCountUp(value, {
    duration: 2000
  });

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  };

  if (loading) {
    return (
      <div className={cn(
        "bg-gray-800 p-6 rounded-lg shadow animate-pulse",
        className
      )}>
        <div className="h-4 bg-gray-700 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-700 rounded w-32" />
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gray-800 p-6 rounded-lg shadow",
      className
    )}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline">
            {prefix && (
              <span className="text-xl font-semibold text-gray-300 mr-1">
                {prefix}
              </span>
            )}
            <span className="text-2xl font-bold text-white">
              {animatedValue.toLocaleString()}
            </span>
            {suffix && (
              <span className="text-xl font-semibold text-gray-300 ml-1">
                {suffix}
              </span>
            )}
          </div>
          {change !== undefined && (
            <p className={cn(
              "mt-2 flex items-center text-sm",
              trendColors[trend || 'neutral']
            )}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {change > 0 && '+'}
              {change}%
            </p>
          )}
          {description && (
            <p className="mt-2 text-sm text-gray-400">
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "rounded-lg p-3",
            iconBackground || 'bg-blue-500/10'
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;