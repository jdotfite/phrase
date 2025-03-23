// hooks/useReviewers.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/services/supabase';


export const useReviewers = () => {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviewers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviewers')
        .select('*')
        .order('total_reviews', { ascending: false });

      if (error) throw error;
      setReviewers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reviewers'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewers();
  }, []);

  return { reviewers, loading, error, refetch: fetchReviewers };
};
