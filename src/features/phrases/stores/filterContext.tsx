// features/phrases/stores/filterContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterState {
  searchTerm: string;
  category: string;
  difficulty: string;
  subcategory: string;
  part_of_speech: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

interface FilterContextValue extends FilterState {
  setFilter: (key: string, value: string | number) => void;
  resetFilters: () => void;
}

const defaultState: FilterState = {
  searchTerm: '',
  category: '',
  difficulty: '',
  subcategory: '',
  part_of_speech: '',
  page: 1,
  pageSize: 10,
  sortBy: 'id',
  sortDirection: 'desc'
};

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultState);

  const setFilter = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset to page 1 when changing filters
      ...(key !== 'page' ? { page: 1 } : {})
    }));
  };

  const resetFilters = () => {
    setFilters(defaultState);
  };

  return (
    <FilterContext.Provider
      value={{
        ...filters,
        setFilter,
        resetFilters
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}