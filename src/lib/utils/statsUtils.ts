import { SupabaseClient } from '@supabase/supabase-js';
import type { Stats, Phrase } from '@/types/types';

interface StatsResult {
  data: Stats | null;
  error: string | null;
}

/**
 * Calculates statistics from phrase data
 */
export const calculateStats = async (supabase: SupabaseClient): Promise<StatsResult> => {
  try {
    const { data: phrases, error, count } = await supabase
      .from('phrases')
      .select('*', { count: 'exact' });

    if (error) throw error;
    if (!phrases || phrases.length === 0) {
      return {
        data: {
          total: 0,
          uniqueCategories: 0,
          difficultyBreakdown: { easy: 0, medium: 0, hard: 0 }
        },
        error: null
      };
    }

    // Calculate unique categories
    const uniqueCategories = new Set(phrases.map(p => p.category)).size;

    // Calculate difficulty breakdown
    const difficultyCount = phrases.reduce((acc, phrase) => {
      const difficulty = phrase.difficulty.toLowerCase();
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = count || phrases.length;

    // Calculate percentages with rounding adjustments
    let easy = Math.round((difficultyCount['easy'] || 0) / total * 100);
    let medium = Math.round((difficultyCount['medium'] || 0) / total * 100);
    let hard = Math.round((difficultyCount['hard'] || 0) / total * 100);

    // Adjust for rounding errors to ensure sum is 100
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

    return {
      data: {
        total,
        uniqueCategories,
        difficultyBreakdown: {
          easy,
          medium,
          hard
        }
      },
      error: null
    };
  } catch (err) {
    console.error('Error calculating stats:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred'
    };
  }
};

/**
 * Calculates usage statistics for phrases
 */
export const calculateUsageStats = (phrases: Phrase[]) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

  return phrases.reduce((stats, phrase) => {
    if (!phrase.last_used) {
      stats.neverUsed++;
    } else {
      const lastUsed = new Date(phrase.last_used);
      if (lastUsed < thirtyDaysAgo) {
        stats.notRecentlyUsed++;
      } else {
        stats.recentlyUsed++;
      }
    }
    return stats;
  }, {
    neverUsed: 0,
    notRecentlyUsed: 0,
    recentlyUsed: 0
  });
};

/**
 * Calculates category distribution
 */
export const calculateCategoryStats = (phrases: Phrase[]) => {
  const categoryCount = phrases.reduce((acc, phrase) => {
    acc[phrase.category] = (acc[phrase.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to percentages
  const total = phrases.length;
  const categoryPercentages = Object.entries(categoryCount).map(([category, count]) => ({
    category,
    percentage: Math.round((count / total) * 100)
  }));

  // Sort by percentage descending
  return categoryPercentages.sort((a, b) => b.percentage - a.percentage);
};

/**
 * Calculates difficulty distribution over time
 */
export const calculateDifficultyTrends = (phrases: Phrase[]) => {
  // Group by month
  const monthlyStats = phrases.reduce((acc, phrase) => {
    const date = phrase.last_used 
      ? new Date(phrase.last_used)
      : new Date();
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { easy: 0, medium: 0, hard: 0 };
    }
    
    const difficulty = phrase.difficulty.toLowerCase();
    acc[monthKey][difficulty as 'easy' | 'medium' | 'hard']++;
    
    return acc;
  }, {} as Record<string, Record<'easy' | 'medium' | 'hard', number>>);

  // Convert to array and sort by date
  return Object.entries(monthlyStats)
    .map(([month, stats]) => ({
      month,
      ...stats
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};