// features/phrases/stores/filterStore.ts
import { create } from 'zustand';

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
  setFilter: (key: string, value: string | number) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchTerm: '',
  category: '',
  difficulty: '',
  subcategory: '',
  part_of_speech: '',
  page: 1,
  pageSize: 10,
  sortBy: 'id',
  sortDirection: 'desc',
  
  setFilter: (key, value) => set((state) => ({ 
    ...state, 
    [key]: value,
    // Reset to page 1 when changing filters
    ...(key !== 'page' ? { page: 1 } : {})
  })),
  
  resetFilters: () => set({
    searchTerm: '',
    category: '',
    difficulty: '',
    subcategory: '',
    part_of_speech: '',
    page: 1,
    pageSize: 10,
    sortBy: 'id',
    sortDirection: 'desc'
  })
}));