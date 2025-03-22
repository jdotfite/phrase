// features/dashboard/hooks/useTableState.js
import { useState, useEffect } from 'react';
import { usePhrases } from '@/features/data/hooks/usePhrases';

export const useTableState = () => {
  const {
    phrases,
    pagination,
    sortConfig,
    filters,
    handleSort,
    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
  } = usePhrases();

  // Initialize table state
  const [tableState, setTableState] = useState({
    sortConfig: {
      key: '',
      direction: 'asc'
    },
    pagination: {
      currentPage: 1,
      rowsPerPage: 10,
      totalItems: 0,
      totalPages: 1
    },
    filters: {
      searchTerm: '',
      category: '',
      difficulty: '',
      subcategory: '',
      part_of_speech: ''
    }
  });

  // Sync Table State with hook state
  useEffect(() => {
    if (phrases && pagination) {
      const totalItems = pagination.totalItems || phrases.length || 0;
      const rowsPerPage = pagination.rowsPerPage || 10;
      const totalPages = Math.ceil(totalItems / rowsPerPage);
      
      setTableState(prev => ({
        ...prev,
        sortConfig,
        pagination: {
          ...pagination,
          rowsPerPage,
          totalItems,
          totalPages,
          currentPage: Math.min(pagination.currentPage, totalPages || 1)
        },
        filters,
      }));
    }
  }, [phrases, pagination, sortConfig, filters]);

  /**
   * Handle table state changes
   */
  const handleTableStateChange = (updates) => {
    // Update local state first
    setTableState(prev => {
      const newState = { ...prev };
      
      if (updates.filters) {
        newState.filters = { ...prev.filters, ...updates.filters };
      }
      
      if (updates.sortConfig) {
        newState.sortConfig = { ...prev.sortConfig, ...updates.sortConfig };
      }
      
      if (updates.pagination) {
        newState.pagination = { ...prev.pagination, ...updates.pagination };
      }
      
      return newState;
    });
    
    // Then immediately propagate changes to the hooks
    if (updates.filters) {
      // Apply each filter individually to ensure all are updated
      Object.entries(updates.filters).forEach(([key, value]) => {
        if (value !== undefined) { // Only update if value is provided
          handleFilterChange(key, value || '');
        }
      });
    }
    
    if (updates.sortConfig && updates.sortConfig.key) {
      handleSort(updates.sortConfig.key);
    }
    
    if (updates.pagination) {
      // Note: Order matters here! First update rows per page, then page number
      if (updates.pagination.rowsPerPage) {
        handleRowsPerPageChange(updates.pagination.rowsPerPage);
      }
      
      if (updates.pagination.currentPage) {
        handlePageChange(updates.pagination.currentPage);
      }
    }
  };

  return {
    tableState,
    setTableState,
    handleTableStateChange
  };
};