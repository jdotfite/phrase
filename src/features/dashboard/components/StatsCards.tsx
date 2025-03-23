// features/dashboard/components/StatsCards.tsx
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useDashboardState } from '../hooks/useDashboardState';
import { useTheme } from '@/providers/ThemeContext';
import { TrendingUp, TrendingDown, Minus, Award, Users, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Type for each stat card
type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  timeframe: string;
  icon?: React.ReactNode;
  loading?: boolean;
  sparklineData?: number[];
};

// Individual stat card component
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  trend = 0,
  trendDirection = 'neutral',
  timeframe,
  icon,
  loading = false,
  sparklineData = [],
}) => {
  const { accent } = useTheme();
  
  // Get accent-specific border style
  const getBorderStyle = () => {
    switch (accent) {
      case 'blue':
        return 'border-blue-500/30';
      case 'green':
        return 'border-emerald-500/30';
      case 'purple':
        return 'border-purple-500/30';
      case 'orange':
        return 'border-orange-500/30';
      default: // grayscale
        return 'border-gray-500/30';
    }
  };

  // Determine color and icon based on trend direction
  // These always stay the same regardless of accent
  const getTrendColor = () => {
    if (trendDirection === 'up') return 'text-green-500';
    if (trendDirection === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  const getTrendIcon = () => {
    if (trendDirection === 'up') return <TrendingUp className="w-4 h-4 ml-1" />;
    if (trendDirection === 'down') return <TrendingDown className="w-4 h-4 ml-1" />;
    return <Minus className="w-4 h-4 ml-1" />;
  };

  // Get accent-specific icon background
  const getIconBackground = () => {
    switch (accent) {
      case 'blue':
        return 'bg-blue-950 text-blue-400';
      case 'green':
        return 'bg-emerald-950 text-emerald-400';
      case 'purple':
        return 'bg-purple-950 text-purple-400';
      case 'orange':
        return 'bg-orange-950 text-orange-400';
      default: // grayscale
        return 'bg-gray-900 text-gray-400';
    }
  };

  // Render sparkline if data is provided
  const renderSparkline = () => {
    if (!sparklineData.length) return null;
    
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;

    // Get accent-specific sparkline color
    const getSparklineColor = () => {
      // For trend directions, use fixed colors
      if (trendDirection === 'up') return '#10B981'; // Green
      if (trendDirection === 'down') return '#EF4444'; // Red
      
      // For neutral trend, use accent color
      switch (accent) {
        case 'blue': return '#3B82F6';
        case 'green': return '#10B981';
        case 'purple': return '#8B5CF6';
        case 'orange': return '#F97316';
        default: return '#6B7280'; // grayscale
      }
    };
    
    return (
      <div className="h-8 mt-2">
        <svg width="100%" height="100%" viewBox={`0 0 ${sparklineData.length} 50`} preserveAspectRatio="none">
          {sparklineData.map((value, index) => {
            const height = ((value - min) / range) * 40 + 10;
            const x = index;
            const y = 50 - height;
            
            return (
              <rect 
                key={index} 
                x={x} 
                y={y} 
                width="0.8" 
                height={height}
                fill={getSparklineColor()}
                rx="1"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <Card className={cn(
      "p-6 text-white shadow border-2",
      getBorderStyle()
    )}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-gray-400 text-sm uppercase font-medium">{title}</h3>
          <div className="flex items-baseline">
            <h2 className="text-2xl font-bold">{loading ? '...' : value}</h2>
            {trend !== 0 && (
              <span className={`text-sm ml-2 flex items-center ${getTrendColor()}`}>
                {trend > 0 ? '+' : ''}{trend}% {getTrendIcon()}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className={cn("rounded-full p-2", getIconBackground())}>
            {icon}
          </div>
        )}
      </div>
      
      <p className="text-gray-400 text-sm mt-1">{description}</p>
      
      {renderSparkline()}
      
      <div className="mt-2 text-xs text-gray-500">
        {timeframe}
      </div>
    </Card>
  );
};

// Main StatsCards component
export const StatsCards: React.FC = () => {
  const { dateRange } = useDashboardState();
  const [stats, setStats] = useState({
    newPhrases: { value: 0, trend: 0, sparkline: [] },
    reviewedPhrases: { value: 0, trend: 0, sparkline: [] },
    activeReviewers: { value: 0, trend: 0 },
    topReviewer: { name: '', count: 0, streak: 0 }
  });
  const [loading, setLoading] = useState(true);
  const { accent } = useTheme();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/dashboard/stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dateRange }),
        });
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [dateRange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="NEW PHRASES"
        value={stats.newPhrases.value}
        description="Phrases added in the last month"
        trend={stats.newPhrases.trend}
        trendDirection={stats.newPhrases.trend > 0 ? 'up' : stats.newPhrases.trend < 0 ? 'down' : 'neutral'}
        timeframe={`Last ${dateRange} days`}
        icon={<BookOpen className="w-5 h-5" />}
        loading={loading}
        sparklineData={stats.newPhrases.sparkline}
      />
      
      <StatCard
        title="PHRASES REVIEWED"
        value={stats.reviewedPhrases.value}
        description="Total reviews in the last month"
        trend={stats.reviewedPhrases.trend}
        trendDirection={stats.reviewedPhrases.trend > 0 ? 'up' : stats.reviewedPhrases.trend < 0 ? 'down' : 'neutral'}
        timeframe={`Last ${dateRange} days`}
        icon={<Clock className="w-5 h-5" />}
        loading={loading}
        sparklineData={stats.reviewedPhrases.sparkline}
      />
      
      <StatCard
        title="ACTIVE REVIEWERS"
        value={stats.activeReviewers.value}
        description="Unique reviewers this month"
        trend={stats.activeReviewers.trend}
        trendDirection={stats.activeReviewers.trend > 0 ? 'up' : stats.activeReviewers.trend < 0 ? 'down' : 'neutral'}
        timeframe={`Last ${dateRange} days`}
        icon={<Users className="w-5 h-5" />}
        loading={loading}
      />
      
      <StatCard
        title="TOP REVIEWER"
        value={stats.topReviewer.name || 'N/A'}
        description={`${stats.topReviewer.count} reviews (${stats.topReviewer.streak} day streak)`}
        timeframe={`Last ${dateRange} days`}
        icon={<Award className="w-5 h-5" />}
        loading={loading}
      />
    </div>
  );
};

export default StatsCards;