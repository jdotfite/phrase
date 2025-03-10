import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Columns } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableState } from '../types';

interface DataTableToolbarProps {
  tableState: TableState;
  onTableStateChange: (state: Partial<TableState>) => void;
  selectedRows: (string | number)[];
  bulkActions?: React.ReactNode;
  showSelection?: boolean;
  onShowAdvancedFilters?: () => void;
  columns?: any[]; // Add column definition props for column visibility
}

export function DataTableToolbar({
  tableState,
  onTableStateChange,
  selectedRows,
  bulkActions,
  showSelection = false,
  onShowAdvancedFilters,
  columns
}: DataTableToolbarProps) {
  const { pagination, filters } = tableState;

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
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
    onTableStateChange({
      filters: {
        ...tableState.filters,
        search: ''
      }
    });
  };

  const handleRowsPerPageChange = (value: string) => {
    // Convert value to number
    const newRowsPerPage = parseInt(value, 10);
    
    // Log for debugging
    console.log('Changing rows per page to:', newRowsPerPage);
    
    // Update page state
    onTableStateChange({
      pagination: {
        ...pagination,
        rowsPerPage: newRowsPerPage,
        currentPage: 1 // Reset to first page when changing rows per page
      }
    });
  };

  const handlePageChange = (newPage: number) => {
    // Log for debugging
    console.log('Changing page to:', newPage);
    
    onTableStateChange({
      pagination: {
        ...pagination,
        currentPage: newPage
      }
    });
  };

  return (
    <div className="p-4 border-b">
      {/* Top row with search and column visibility */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Search phrases..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="w-full"
          />
          {filters.search && (
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

        <div className="flex gap-2 items-center">
          {/* Column visibility dropdown */}
          {columns && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Columns className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {columns.map((column) => {
                  // Skip action columns or any column you don't want to hide
                  if (column.key === 'actions') return null;
                  
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.key}
                      className="capitalize"
                      checked={!tableState.hiddenColumns?.includes(column.key)}
                      onCheckedChange={(value) => {
                        // Update hidden columns list
                        let newHiddenColumns = [...(tableState.hiddenColumns || [])];
                        if (value) {
                          // Remove from hidden list
                          newHiddenColumns = newHiddenColumns.filter(key => key !== column.key);
                        } else {
                          // Add to hidden list
                          newHiddenColumns.push(column.key);
                        }
                        
                        onTableStateChange({
                          hiddenColumns: newHiddenColumns
                        });
                      }}
                    >
                      {column.header}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Advanced filters button */}
          {!showSelection && onShowAdvancedFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={onShowAdvancedFilters}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          )}
        </div>
      </div>

      {/* Bottom row with pagination controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Show bulk actions when rows are selected */}
          {showSelection ? (
            <div className="flex gap-2">
              {bulkActions}
            </div>
          ) : (
            <>
              {/* Rows per page selector */}
              <Select
                value={pagination.rowsPerPage.toString()}
                onValueChange={handleRowsPerPageChange}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={`${pagination.rowsPerPage} per page`} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map(value => (
                    <SelectItem key={value} value={value.toString()}>
                      {value} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="text-sm text-muted-foreground">
                {pagination.totalPages > 0
                  ? `Page ${pagination.currentPage} of ${pagination.totalPages}`
                  : 'No results'
                }
              </span>
            </>
          )}
        </div>
        
        {/* Pagination Controls */}
        <div className="flex gap-2">
          <Button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <Button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}