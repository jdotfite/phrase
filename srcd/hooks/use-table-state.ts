// src/hooks/use-table-state.ts
import { useState, useCallback } from 'react';
import { TableState, FiltersState, SortConfig, PaginationState } from '@/components/tables/types';

interface UseTableStateOptions {
  initialSortConfig?: SortConfig;
  initialPagination?: Partial<PaginationState>;
  initialFilters?: FiltersState;
}

export function useTableState({
  initialSortConfig = { key: 'id', direction: 'asc' },
  initialPagination = {},
  initialFilters = {}
}: UseTableStateOptions = {}) {
  // Default pagination state
  const defaultPagination: PaginationState = {
    currentPage: 1,
    totalPages: 1,
    rowsPerPage: 10,
    totalItems: 0,
    ...initialPagination
  };

  // State for table configuration
  const [tableState, setTableState] = useState<TableState>({
    sortConfig: initialSortConfig,
    pagination: defaultPagination,
    filters: initialFilters
  });

  // Update table state with partial updates
  const updateTableState = useCallback((updates: Partial<TableState>) => {
    setTableState(prev => {
      const newState = { ...prev };
      
      // Update sort config if provided
      if (updates.sortConfig) {
        newState.sortConfig = {
          ...prev.sortConfig,
          ...updates.sortConfig
        };
      }
      
      // Update pagination if provided
      if (updates.pagination) {
        newState.pagination = {
          ...prev.pagination,
          ...updates.pagination
        };
      }
      
      // Update filters if provided
      if (updates.filters) {
        newState.filters = {
          ...prev.filters,
          ...updates.filters
        };
      }
      
      return newState;
    });
  }, []);
  
  // Convenience handlers for common operations
  const handleSort = useCallback((key: string) => {
    let direction = 'asc';
    if (tableState.sortConfig.key === key) {
      direction = tableState.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    updateTableState({ sortConfig: { key, direction: direction as 'asc' | 'desc' } });
  }, [tableState.sortConfig, updateTableState]);
  
  const handlePageChange = useCallback((newPage: number) => {
    updateTableState({
      pagination: { currentPage: newPage }
    });
  }, [updateTableState]);
  
  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    updateTableState({
      pagination: {
        rowsPerPage: newRowsPerPage,
        currentPage: 1 // Reset to first page when changing rows per page
      }
    });
  }, [updateTableState]);
  
  const handleFilterChange = useCallback((newFilters: FiltersState) => {
    updateTableState({
      filters: newFilters,
      pagination: { currentPage: 1 } // Reset to first page when changing filters
    });
  }, [updateTableState]);
  
  const resetFilters = useCallback(() => {
    updateTableState({
      filters: {},
      pagination: { currentPage: 1 }
    });
  }, [updateTableState]);
  
  const updateTotalItems = useCallback((totalItems: number) => {
    const totalPages = Math.ceil(totalItems / tableState.pagination.rowsPerPage);
    updateTableState({
      pagination: {
        totalItems,
        totalPages
      }
    });
  }, [tableState.pagination.rowsPerPage, updateTableState]);

  return {
    tableState,
    updateTableState,
    handleSort,
    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
    resetFilters,
    updateTotalItems
  };
}