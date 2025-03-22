// features/phrases/hooks/useDeletePhrase.ts
import { useState } from 'react';
import { supabase } from '@/lib/services/supabase';

export const useDeletePhrase = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const mutate = async (id: number, options?: { onSuccess?: () => void }) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('phrases')
        .delete()
        .eq('id', id);
        
      if (deleteError) {
        throw deleteError;
      }
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (err) {
      console.error('Error deleting phrase:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsDeleting(false);
    }
  };
  
  return {
    mutate,
    isDeleting,
    error
  };
};