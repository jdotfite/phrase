// src/components/tables/data-table/filters.tsx
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';
import { TableState } from '../types';

interface DataTableFiltersProps {
  tableState: TableState;
  onTableStateChange: (state: Partial<TableState>) => void;
  onShowAdvancedFilters?: () => void;
}

export function DataTableFilters({
  tableState,
  onTableStateChange,
  onShowAdvancedFilters
}: DataTableFiltersProps) {
  const { filters, pagination } = tableState;
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Update search term when filters change externally
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  // Handle search input changes
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setSearchTerm(value);
  
  // Apply filter immediately
  onTableStateChange({
    filters: {
      ...tableState.filters,
      search: value
    },
    pagination: {
      ...tableState.pagination,
      currentPage: 1 // Reset to first page when filtering
    }
  });
};

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    applySearch('');
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative w-full">
        <Input
          placeholder="Filter phrases..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            onClick={clearSearch}
            className="absolute right-0 top-0 h-full px-3"
            type="button"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear</span>
          </Button>
        )}
      </div>
      
      {onShowAdvancedFilters && (
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 whitespace-nowrap"
          onClick={onShowAdvancedFilters}
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      )}
    </div>
  );
}