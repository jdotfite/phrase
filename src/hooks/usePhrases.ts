import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  Phrase,
  NewPhrase,
  PaginationState,
  SortConfig,
  Filters,
  UsePhrasesReturn
} from '@/types/types';

export const usePhrases = (): UsePhrasesReturn => {
  // State Management
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination State
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    rowsPerPage: 20,
    totalPages: 1
  });

  // Sort State
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: '',
    direction: 'asc'
  });

  // Filter State
  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    category: '',
    difficulty: '',
    subcategory: '',
    part_of_speech: ''
  });

  // Fetch Phrases
  const fetchPhrases = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('phrases').select('*', { count: 'exact' });

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.subcategory) {
        query = query.eq('subcategory', filters.subcategory);
      }
      if (filters.part_of_speech) {
        query = query.eq('part_of_speech', filters.part_of_speech);
      }
      if (filters.searchTerm) {
        query = query.or(
          `phrase.ilike.%${filters.searchTerm}%,tags.ilike.%${filters.searchTerm}%`
        );
      }

      // Apply sorting
      if (sortConfig.key) {
        query = query.order(sortConfig.key, {
          ascending: sortConfig.direction === 'asc',
          nullsFirst: false
        });
      }

      // Apply pagination
      const start = (pagination.currentPage - 1) * pagination.rowsPerPage;
      const end = start + pagination.rowsPerPage - 1;
      query = query.range(start, end);

      const { data, error: supabaseError, count } = await query;

      if (supabaseError) throw supabaseError;

      setPhrases(data as Phrase[]);
      
      if (count !== null) {
        setPagination(prev => ({
          ...prev,
          totalPages: Math.ceil(count / prev.rowsPerPage)
        }));
      }
    } catch (err) {
      console.error('Error fetching phrases:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch phrases');
    } finally {
      setLoading(false);
    }
  }, [filters, sortConfig.key, sortConfig.direction, pagination.currentPage, pagination.rowsPerPage]);

  // Sort Handlers
  const handleSort = useCallback((key: keyof Phrase) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const sortByIdDesc = useCallback(() => {
    setSortConfig({ key: 'id', direction: 'desc' });
  }, []);

  // Pagination Handlers
  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handleRowsPerPageChange = useCallback((rowsPerPage: number) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage,
      currentPage: 1
    }));
  }, []);

  // Filter Handlers
  const handleFilterChange = useCallback((name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      category: '',
      difficulty: '',
      subcategory: '',
      part_of_speech: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // CRUD Operations
  const addPhrase = useCallback(async (newPhrase: NewPhrase) => {
    try {
      const { error: supabaseError } = await supabase
        .from('phrases')
        .insert([newPhrase]);

      if (supabaseError) throw supabaseError;
      
      await fetchPhrases();
      setError(null);
    } catch (err) {
      console.error('Error adding phrase:', err);
      throw err instanceof Error ? err : new Error('Failed to add phrase');
    }
  }, [fetchPhrases]);

  const editPhrase = useCallback(async (phrase: Phrase) => {
    try {
      const { error: supabaseError } = await supabase
        .from('phrases')
        .update(phrase)
        .eq('id', phrase.id);

      if (supabaseError) throw supabaseError;
      
      await fetchPhrases();
      setError(null);
    } catch (err) {
      console.error('Error updating phrase:', err);
      throw err instanceof Error ? err : new Error('Failed to update phrase');
    }
  }, [fetchPhrases]);

  const deletePhrase = useCallback(async (id: number) => {
    try {
      const { error: supabaseError } = await supabase
        .from('phrases')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      await fetchPhrases();
      setError(null);
    } catch (err) {
      console.error('Error deleting phrase:', err);
      throw err instanceof Error ? err : new Error('Failed to delete phrase');
    }
  }, [fetchPhrases]);

  // Effect to fetch phrases when dependencies change
  useEffect(() => {
    fetchPhrases();
  }, [fetchPhrases]);

  return {
    phrases,
    loading,
    error,
    setError,
    pagination,
    sortConfig,
    filters,
    handleSort,
    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
    addPhrase,
    editPhrase,
    deletePhrase,
    fetchPhrases,
    applyFilters: fetchPhrases,
    resetFilters,
    sortByIdDesc
  };
};

export default usePhrases;