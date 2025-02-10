import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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
      hard: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError, count } = await supabase
        .from('phrases')
        .select('*', { count: 'exact' });

      if (fetchError) throw fetchError;
      if (!data) throw new Error('No data received');

      const phrases = data as Phrase[];

      // Calculate unique categories
      const uniqueCategories = new Set(phrases.map(p => p.category)).size;

      // Calculate difficulty breakdown
      const difficultyCount = phrases.reduce((acc: Record<string, number>, phrase) => {
        const difficulty = phrase.difficulty.toLowerCase();
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      }, {});

      const total = count || phrases.length;

      // Calculate percentages and ensure they sum to 100
      let easy = Math.round((difficultyCount['easy'] || 0) / total * 100);
      let medium = Math.round((difficultyCount['medium'] || 0) / total * 100);
      let hard = Math.round((difficultyCount['hard'] || 0) / total * 100);

      // Adjust for rounding errors
      const sum = easy + medium + hard;
      if (sum !== 100) {
        const diff = 100 - sum;
        // Add the difference to the largest category
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
          hard
        }
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
    refetch: calculateStats
  };
};

export default useStats;