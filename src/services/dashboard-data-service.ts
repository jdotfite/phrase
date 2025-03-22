// src/services/dashboard-data-service.ts
import { supabase } from '@/lib/services/supabase';

export interface DashboardStats {
  newPhrases: {
    value: number;
    trend: number;
    sparkline: number[];
  };
  reviewedPhrases: {
    value: number;
    trend: number;
    sparkline: number[];
  };
  activeReviewers: {
    value: number;
    trend: number;
  };
  topReviewer: {
    name: string;
    count: number;
    streak: number;
  };
}

export const DashboardDataService = {
  // Fetch dashboard stats
  fetchDashboardStats: async (dateRange = 30): Promise<DashboardStats | null> => {
    try {
      // Calculate date ranges for current period and previous period
      const currentStart = new Date();
      currentStart.setDate(currentStart.getDate() - dateRange);
      
      const previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - dateRange);
      
      const currentStartStr = currentStart.toISOString();
      const previousStartStr = previousStart.toISOString();
      const now = new Date().toISOString();
      
      // 1. New Phrases in the Last Month
      const { data: newPhrasesData, error: newPhrasesError } = await supabase
        .from('phrases')
        .select('id, created_at')
        .gte('created_at', currentStartStr)
        .order('created_at', { ascending: true });
      
      if (newPhrasesError) {
        console.error("New phrases query error:", newPhrasesError);
        throw newPhrasesError;
      }
      
      // 2. Calculate previous period for trend
      const { count: previousNewPhrasesCount, error: previousNewPhrasesError } = await supabase
        .from('phrases')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', previousStartStr)
        .lt('created_at', currentStartStr);
      
      if (previousNewPhrasesError) {
        console.error("Previous phrases query error:", previousNewPhrasesError);
        throw previousNewPhrasesError;
      }
      
      // 3. Phrases Reviewed in the Last Month
      const { data: reviewedPhrasesData, error: reviewedPhrasesError } = await supabase
        .from('votes')
        .select('id, created_at')
        .gte('created_at', currentStartStr)
        .order('created_at', { ascending: true });
      
      if (reviewedPhrasesError) {
        console.error("Reviewed phrases query error:", reviewedPhrasesError);
        throw reviewedPhrasesError;
      }
      
      // 4. Calculate previous period for trend
      const { count: previousReviewedCount, error: previousReviewedError } = await supabase
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', previousStartStr)
        .lt('created_at', currentStartStr);
      
      if (previousReviewedError) {
        console.error("Previous reviewed query error:", previousReviewedError);
        throw previousReviewedError;
      }
      
      // 5. Active Reviewers Count
      const { data: activeReviewers, error: activeReviewersError } = await supabase
        .from('votes')
        .select('reviewer_id')
        .gte('created_at', currentStartStr);
      
      if (activeReviewersError) {
        console.error("Active reviewers query error:", activeReviewersError);
        throw activeReviewersError;
      }
      
      // Get unique reviewer IDs
      const uniqueReviewerIds = [...new Set(activeReviewers?.map(item => item.reviewer_id))];
      
      // 6. Calculate previous period for trend
      const { data: previousActiveReviewers, error: previousActiveReviewersError } = await supabase
        .from('votes')
        .select('reviewer_id')
        .gte('created_at', previousStartStr)
        .lt('created_at', currentStartStr);
      
      if (previousActiveReviewersError) {
        console.error("Previous active reviewers query error:", previousActiveReviewersError);
        throw previousActiveReviewersError;
      }
      
      const previousUniqueReviewerIds = [...new Set(previousActiveReviewers?.map(item => item.reviewer_id))];
      
      // 7. Top Reviewer - Use a different approach for this query
      // First get counts for each reviewer
      const { data: reviewCounts, error: reviewCountsError } = await supabase
        .rpc('get_reviewer_counts', { start_date: currentStartStr });
        
      if (reviewCountsError) {
        console.error("Review counts query error:", reviewCountsError);
        // Fallback approach if RPC doesn't exist
        console.log("Falling back to manual aggregation...");
        // Get all reviewer_ids and manually count them
        const { data: allVotes, error: allVotesError } = await supabase
          .from('votes')
          .select('reviewer_id')
          .gte('created_at', currentStartStr);
          
        if (allVotesError) {
          console.error("All votes query error:", allVotesError);
          throw allVotesError;
        }
        
        // Create a counts object
        const counts = {};
        allVotes?.forEach(vote => {
          if (vote.reviewer_id) {
            counts[vote.reviewer_id] = (counts[vote.reviewer_id] || 0) + 1;
          }
        });
        
        // Convert to array and sort
        const reviewerCounts = Object.entries(counts).map(([reviewer_id, count]) => ({
          reviewer_id,
          count
        })).sort((a, b) => b.count - a.count);
        
        // Get top reviewer
        const topReviewerId = reviewerCounts.length > 0 ? reviewerCounts[0].reviewer_id : null;
        const topReviewerCount = reviewerCounts.length > 0 ? reviewerCounts[0].count : 0;
        
        // 8. Get reviewer details
        let topReviewer = { name: 'N/A', count: 0, streak: 0 };
        
        if (topReviewerId) {
          const { data: reviewerData, error: reviewerError } = await supabase
            .from('reviewers')
            .select('id, name, current_streak')
            .eq('id', topReviewerId)
            .single();
          
          if (reviewerError) {
            console.error("Reviewer details query error:", reviewerError);
          } else if (reviewerData) {
            topReviewer = {
              name: reviewerData.name || 'Unknown',
              count: typeof topReviewerCount === 'number' ? topReviewerCount : 0,
              streak: reviewerData.current_streak || 0
            };
          }
        }
        
        // Calculate sparkline data by grouping by day
        const newPhrasesByDay = groupByDay(newPhrasesData || []);
        const reviewsByDay = groupByDay(reviewedPhrasesData || []);
        
        // Calculate trends
        const newPhrasesTrend = calculateTrend(newPhrasesData?.length || 0, previousNewPhrasesCount || 0);
        const reviewedPhrasesTrend = calculateTrend(reviewedPhrasesData?.length || 0, previousReviewedCount || 0);
        const activeReviewersTrend = calculateTrend(uniqueReviewerIds.length, previousUniqueReviewerIds.length);
        
        return {
          newPhrases: {
            value: newPhrasesData?.length || 0,
            trend: newPhrasesTrend,
            sparkline: Object.values(newPhrasesByDay)
          },
          reviewedPhrases: {
            value: reviewedPhrasesData?.length || 0,
            trend: reviewedPhrasesTrend,
            sparkline: Object.values(reviewsByDay)
          },
          activeReviewers: {
            value: uniqueReviewerIds.length,
            trend: activeReviewersTrend
          },
          topReviewer
        };
      }
      
      // If RPC approach succeeded
      const topReviewerData = reviewCounts && reviewCounts.length > 0 ? reviewCounts[0] : null;
      
      // 8. Get reviewer details
      let topReviewer = { name: 'N/A', count: 0, streak: 0 };
      
      if (topReviewerData) {
        const { data: reviewerData, error: reviewerError } = await supabase
          .from('reviewers')
          .select('id, name, current_streak')
          .eq('id', topReviewerData.reviewer_id)
          .single();
        
        if (reviewerError) {
          console.error("Reviewer details query error:", reviewerError);
        } else if (reviewerData) {
          topReviewer = {
            name: reviewerData.name || 'Unknown',
            count: typeof topReviewerData.count === 'number' ? topReviewerData.count : parseInt(topReviewerData.count) || 0,
            streak: reviewerData.current_streak || 0
          };
        }
      }
      
      // Calculate sparkline data by grouping by day
      const newPhrasesByDay = groupByDay(newPhrasesData || []);
      const reviewsByDay = groupByDay(reviewedPhrasesData || []);
      
      // Calculate trends
      const newPhrasesTrend = calculateTrend(newPhrasesData?.length || 0, previousNewPhrasesCount || 0);
      const reviewedPhrasesTrend = calculateTrend(reviewedPhrasesData?.length || 0, previousReviewedCount || 0);
      const activeReviewersTrend = calculateTrend(uniqueReviewerIds.length, previousUniqueReviewerIds.length);
      
      return {
        newPhrases: {
          value: newPhrasesData?.length || 0,
          trend: newPhrasesTrend,
          sparkline: Object.values(newPhrasesByDay)
        },
        reviewedPhrases: {
          value: reviewedPhrasesData?.length || 0,
          trend: reviewedPhrasesTrend,
          sparkline: Object.values(reviewsByDay)
        },
        activeReviewers: {
          value: uniqueReviewerIds.length,
          trend: activeReviewersTrend
        },
        topReviewer
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Add detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return null;
    }
  },
  
  // Other methods remain the same...
};

// Helper function to calculate percentage trend
function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  const trend = ((current - previous) / previous) * 100;
  return Math.round(trend);
}

// Helper function to group data by day for sparklines
function groupByDay(data: any[]): Record<string, number> {
  const result: Record<string, number> = {};
  
  // Initialize all days in the period with 0
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result[dateStr] = 0;
  }
  
  // Fill in actual counts
  data.forEach(item => {
    if (item && item.created_at) {
      const dateStr = new Date(item.created_at).toISOString().split('T')[0];
      if (result[dateStr] !== undefined) {
        result[dateStr]++;
      }
    }
  });
  
  return result;
}