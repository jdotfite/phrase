// hooks/usePhrases.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/services/supabase'
import type { Phrase, PaginationState, SortConfig, Filters } from '@/types/types';

export const usePhrases = () => {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    rowsPerPage: 10,  // Default to 10 rows per page
    totalPages: 1,
    totalItems: 0
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: '',
    direction: 'asc'
  });

  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    category: '',
    difficulty: '',
    subcategory: '',
    part_of_speech: ''
  });

  const fetchPhrases = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
      .from('phrases')
      .select(`
        *,
        categories:category_id(id, name),
        subcategories:subcategory_id(id, name),
        phrase_tags!inner(
          tags(id, tag)
        )
      `, { count: 'exact' });
      // Apply filters
      if (filters.category) {
        // First get the category id
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', filters.category)
          .single();

        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters.subcategory) {
        const { data: subcategoryData } = await supabase
          .from('subcategories')
          .select('id')
          .eq('name', filters.subcategory)
          .single();

        if (subcategoryData) {
          query = query.eq('subcategory_id', subcategoryData.id);
        }
      }

      if (filters.part_of_speech) {
        query = query.eq('part_of_speech', filters.part_of_speech);
      }

      if (filters.searchTerm) {
        query = query.or(`phrase.ilike.%${filters.searchTerm}%`);
      }

      // Apply sorting
      if (sortConfig.key) {
        query = query.order(sortConfig.key, {
          ascending: sortConfig.direction === 'asc',
          nullsFirst: false
        });
      } else {
        // Default sort
        query = query.order('id', { ascending: false });
      }

      // Apply pagination
      console.log('Pagination values:', {
        currentPage: pagination.currentPage,
        rowsPerPage: pagination.rowsPerPage,
        calculatedStart: (pagination.currentPage - 1) * pagination.rowsPerPage,
        calculatedEnd: (pagination.currentPage - 1) * pagination.rowsPerPage + pagination.rowsPerPage - 1
      });
      const start = (pagination.currentPage - 1) * pagination.rowsPerPage;
      const end = start + pagination.rowsPerPage - 1;
      query = query.range(start, end);

      const { data, error: supabaseError, count } = await query as SupabaseQueryResponse<PhraseWithRelations>;

    if (supabaseError) throw supabaseError;

      // Transform the data
      const transformedData = data?.map(item => ({
        ...item,
        category: item.categories?.name || '',
        subcategory: item.subcategories?.name || '',
        tags: item.phrase_tags
          ?.map((pt: any) => pt.tags.tag)
          .filter(Boolean)
          .join(',') || ''
      }));

      setPhrases(transformedData || []);
      
      if (count !== null) {
        const totalPages = Math.ceil(count / pagination.rowsPerPage);
        setPagination(prev => ({
          ...prev,
          totalItems: count,
          totalPages: totalPages,
          // Ensure currentPage doesn't exceed total pages
          currentPage: Math.min(prev.currentPage, totalPages || 1)
        }));
      }
  
      setPhrases(transformedData || []);
    } catch (err) {
      // ... Error handling ...
    } finally {
      setLoading(false);
    }
  }, [filters, sortConfig, pagination.currentPage, pagination.rowsPerPage]);

  // Fetch categories for the filter
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');
        
      if (error) {
        console.error('Supabase error fetching categories:', error);
        return [];
      }
      
      return data.map(category => category.name);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      category: '',
      difficulty: '',
      subcategory: '',
      part_of_speech: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSort = (key: keyof Phrase) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage,
      currentPage: 1,  // Reset to page 1 when changing rows per page
      totalPages: Math.ceil((prev.totalItems || 0) / rowsPerPage)
    }));
  };

  useEffect(() => {
    fetchPhrases();
  }, [fetchPhrases, pagination.currentPage, pagination.rowsPerPage, filters, sortConfig]);

  return {
    phrases,
    loading,
    error,
    pagination,
    sortConfig,
    filters,
    handleSort,
    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
    resetFilters,
    fetchCategories,
    fetchPhrases,
    setError
  };
};