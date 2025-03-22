// features/phrases/hooks/usePhrases.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/services/supabase';

export const usePhrases = (
  filters = {},
  pagination = { page: 1, pageSize: 10 },
  sort = { column: 'id', direction: 'desc' as const }
) => {
  const [data, setData] = useState<{ 
    data: any[], 
    totalItems: number, 
    totalPages: number 
  }>({ data: [], totalItems: 0, totalPages: 1 });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPhrases = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Start building the query
        let query = supabase
          .from('phrases')
          .select(`
            *,
            categories:category_id(id, name),
            subcategories:subcategory_id(id, name),
            phrase_tags(
              tags(id, tag)
            )
          `, { count: 'exact' });

        // Apply filters
        if (filters.searchTerm) {
          query = query.ilike('phrase', `%${filters.searchTerm}%`);
        }
        
        if (filters.category) {
          // First get the category id
          const { data: categoryData } = await supabase
            .from('categories')
            .select('id')
            .eq('name', filters.category)
            .single();
            
          if (categoryData?.id) {
            query = query.eq('category_id', categoryData.id);
          }
        }
        
        if (filters.difficulty) {
          query = query.eq('difficulty', filters.difficulty);
        }
        
        if (filters.part_of_speech) {
          query = query.eq('part_of_speech', filters.part_of_speech);
        }
        
        if (filters.subcategory) {
          const { data: subcategoryData } = await supabase
            .from('subcategories')
            .select('id')
            .eq('name', filters.subcategory)
            .single();
            
          if (subcategoryData?.id) {
            query = query.eq('subcategory_id', subcategoryData.id);
          }
        }

        // Apply sorting
        query = query.order(sort.column, { 
          ascending: sort.direction === 'asc' 
        });

        // Apply pagination
        const from = (pagination.page - 1) * pagination.pageSize;
        const to = from + pagination.pageSize - 1;
        query = query.range(from, to);

        // Execute the query
        const { data: phraseData, error: queryError, count } = await query;

        if (queryError) {
          throw queryError;
        }

        // Transform the data
        const transformedData = phraseData?.map(item => ({
          id: item.id,
          phrase: item.phrase || '',
          category: item.categories?.name || '',
          subcategory: item.subcategories?.name || '',
          difficulty: item.difficulty || 1,
          part_of_speech: item.part_of_speech || '',
          hint: item.hint || '',
          tags: item.phrase_tags
            ?.map((pt: any) => pt.tags.tag)
            .filter(Boolean)
            .join(',') || ''
        })) || [];

        setData({
          data: transformedData,
          totalItems: count || 0,
          totalPages: Math.ceil((count || 0) / pagination.pageSize)
        });
      } catch (err) {
        console.error('Error fetching phrases:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhrases();
  }, [
    filters.searchTerm,
    filters.category,
    filters.difficulty,
    filters.subcategory,
    filters.part_of_speech,
    pagination.page,
    pagination.pageSize,
    sort.column,
    sort.direction
  ]);

  return {
    data,
    isLoading,
    error
  };
};