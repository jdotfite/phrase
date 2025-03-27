import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import TagDisplay from '@/components/ui/tags';
import { DifficultyIndicator } from '@/components/ui/difficulty-indicator';
import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/ThemeContext';

interface PhrasesCardViewProps {
  phrases: any[];
  loading?: boolean;
  tableState: TableState;
  onTableStateChange: (updates: Partial<TableState>) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  newIds?: number[];
}

export function PhrasesCardView({
  phrases,
  loading = false,
  tableState,
  onTableStateChange,
  onEdit,
  onDelete,
  newIds = []
}: PhrasesCardViewProps) {
  const [searchValue, setSearchValue] = useState(tableState.filters.searchTerm || '');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const { accent } = useTheme();

  // Get accent-specific color values for various parts of the UI
  const getAccentColors = () => {
    switch (accent) {
      case 'blue':
        return {
          highlight: 'bg-blue-500/10 border-blue-500/30',
          button: 'bg-blue-500 hover:bg-blue-600',
          outline: 'border-blue-500/50 text-blue-500',
          text: 'text-blue-500'
        };
      case 'green':
        return {
          highlight: 'bg-emerald-500/10 border-emerald-500/30',
          button: 'bg-emerald-500 hover:bg-emerald-600',
          outline: 'border-emerald-500/50 text-emerald-500',
          text: 'text-emerald-500'
        };
      case 'purple':
        return {
          highlight: 'bg-purple-500/10 border-purple-500/30',
          button: 'bg-purple-500 hover:bg-purple-600',
          outline: 'border-purple-500/50 text-purple-500',
          text: 'text-purple-500'
        };
      case 'orange':
        return {
          highlight: 'bg-orange-500/10 border-orange-500/30',
          button: 'bg-orange-500 hover:bg-orange-600',
          outline: 'border-orange-500/50 text-orange-500',
          text: 'text-orange-500'
        };
      default: // grayscale
        return {
          highlight: 'bg-gray-500/10 border-gray-500/30',
          button: 'bg-gray-500 hover:bg-gray-600',
          outline: 'border-gray-500/50 text-gray-500',
          text: 'text-gray-500'
        };
    }
  };

  const accentColors = getAccentColors();

  // Create flash animation class with accent color
  const getNewRowClass = (id: number) => {
    if (!newIds.includes(id)) return '';
    
    return cn("transition-colors", accentColors.highlight);
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Handle search submit
  const handleSearch = () => {
    onTableStateChange({
      filters: {
        ...tableState.filters,
        searchTerm: searchValue
      },
      pagination: {
        ...tableState.pagination,
        currentPage: 1
      }
    });
  };

  // Clear search
  const clearSearch = () => {
    setSearchValue('');
    onTableStateChange({
      filters: {
        ...tableState.filters,
        searchTerm: ''
      }
    });
  };

  // Handle key down for search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    onTableStateChange({
      pagination: {
        ...tableState.pagination,
        currentPage: newPage
      }
    });
  };

  // Toggle row selection
  const toggleRowSelection = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id));
    } else {
      setSelectedRows(prev => [...prev, id]);
    }
  };

  // Confirm delete
  const confirmDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this phrase?')) {
      onDelete?.(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and pagination header */}
      <div className="flex flex-col gap-3">
        {/* Search input */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder="Search phrases..."
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className={cn("pl-10 pr-10 border", accentColors.outline)}
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Pagination info and controls */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {tableState.pagination.totalPages > 0
              ? `Page ${tableState.pagination.currentPage} of ${tableState.pagination.totalPages}`
              : 'No results'}
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(tableState.pagination.currentPage - 1)}
              disabled={tableState.pagination.currentPage <= 1}
              className={cn("border", accentColors.outline)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(tableState.pagination.currentPage + 1)}
              disabled={tableState.pagination.currentPage >= tableState.pagination.totalPages}
              className={cn("border", accentColors.outline)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Phrases cards */}
      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 rounded-full border-b-transparent"></div>
        </div>
      ) : phrases.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-muted-foreground">
          No phrases found.
        </div>
      ) : (
        <div className="space-y-3">
          {phrases.map((phrase) => (
            <div 
              key={phrase.id}
              className={cn(
                "p-4 rounded-md border",
                selectedRows.includes(phrase.id) && accentColors.highlight,
                getNewRowClass(phrase.id)
              )}
            >
              {/* Header with phrase and actions */}
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{phrase.phrase}</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit?.(phrase.id)}>
                    <Pencil className={cn("h-4 w-4", accentColors.text)} />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => confirmDelete(phrase.id)}>
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              {/* Category and difficulty */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-1 font-medium">{phrase.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Difficulty:</span>
                  <div className="mt-1">
                    <DifficultyIndicator difficulty={phrase.difficulty} />
                  </div>
                </div>
              </div>
              
              {/* Hint */}
              {phrase.hint && (
                <div className="mt-3 text-sm">
                  <span className="text-muted-foreground">Hint:</span>
                  <span className="ml-1">{phrase.hint}</span>
                </div>
              )}
              
              {/* Tags */}
              {phrase.tags && (
                <div className="mt-3">
                  <TagDisplay tags={phrase.tags} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PhrasesCardView;