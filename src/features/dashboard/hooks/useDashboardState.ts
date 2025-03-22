// features/dashboard/hooks/useDashboardState.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/services/supabase';
import { DashboardFilters } from '../types';

export const useDashboardState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('phrases');
  const [showWordCreatorModal, setShowWordCreatorModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [newIds, setNewIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<number>(30); // Default to 30 days
  const [filters, setFilters] = useState<DashboardFilters>({
    categories: [],
    subcategories: [],
    difficulty: [],
    dateRange: { start: null, end: null },
  });

  // Function to update date range
  const updateDateRange = useCallback((days: number) => {
    setDateRange(days);
  }, []);

  // Function to update filters
  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Function to reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      categories: [],
      subcategories: [],
      difficulty: [],
      dateRange: { start: null, end: null },
    });
  }, []);

  // Load initial metadata (categories, subcategories, etc.)
  useEffect(() => {
    const loadMetadata = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load categories
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name');
        
        if (categoriesError) throw categoriesError;
        
        // Load subcategories
        const { data: subcategories, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('id, name, category_id');
        
        if (subcategoriesError) throw subcategoriesError;
        
        // Initialize any other necessary data
        
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMetadata();
  }, []);

  return {
    isLoading,
    error,
    activeTab, 
    setActiveTab,
    showWordCreatorModal, 
    setShowWordCreatorModal,
    showReviewModal, 
    setShowReviewModal,
    showFilterModal, 
    setShowFilterModal,
    showExportModal, 
    setShowExportModal,
    newIds, 
    setNewIds,
    dateRange,
    updateDateRange,
    filters,
    updateFilters,
    resetFilters
  };
};

export default useDashboardState;