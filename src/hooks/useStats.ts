import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/services/supabase';
import type { Stats, Phrase } from '@/types/types';

interface UseStatsReturn {
  stats: Stats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStats = (): UseStatsReturn => {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    uniqueCategories: 0,
    difficultyBreakdown: {
      easy: 0,
      medium: 0,
      hard: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: phrases, error: fetchError, count } = await supabase
        .from('phrases')
        .select(`
          *,
          categories:category_id (name)
        `, { count: 'exact' });

      if (fetchError) throw fetchError;
      if (!phrases) throw new Error('No data received');

      // Calculate unique categories
      const uniqueCategories = new Set(phrases.map((p) => p.categories?.name)).size;

      // Map difficulty numbers to labels
      const difficultyLabels = {
        1: 'easy',
        2: 'medium',
        3: 'hard',
      };

      // Calculate difficulty breakdown
      const difficultyCount = phrases.reduce((acc: Record<string, number>, phrase) => {
        const difficultyLabel = difficultyLabels[phrase.difficulty] || 'unknown';
        acc[difficultyLabel] = (acc[difficultyLabel] || 0) + 1;
        return acc;
      }, {});

      const total = count || phrases.length;

      // Calculate percentages
      let easy = Math.round(((difficultyCount['easy'] || 0) / total) * 100);
      let medium = Math.round(((difficultyCount['medium'] || 0) / total) * 100);
      let hard = Math.round(((difficultyCount['hard'] || 0) / total) * 100);

      // Adjust for rounding errors
      const sum = easy + medium + hard;
      if (sum !== 100) {
        const diff = 100 - sum;
        if (easy >= medium && easy >= hard) {
          easy += diff;
        } else if (medium >= easy && medium >= hard) {
          medium += diff;
        } else {
          hard += diff;
        }
      }

      setStats({
        total,
        uniqueCategories,
        difficultyBreakdown: {
          easy,
          medium,
          hard,
        },
      });
    } catch (err) {
      console.error('Error calculating stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return {
    stats,
    loading,
    error,
    refetch: calculateStats,
  };
};

export default useStats;
