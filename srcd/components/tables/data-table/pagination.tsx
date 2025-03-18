// src/components/tables/data-table/pagination.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { TableState } from '../types';

interface DataTablePaginationProps {
  tableState: TableState;
  onTableStateChange: (state: Partial<TableState>) => void;
  selectedCount?: number;
  itemCount?: number;
}

export function DataTablePagination({
  tableState,
  onTableStateChange,
  selectedCount = 0,
  itemCount
}: DataTablePaginationProps) {
  const { pagination } = tableState;
  
  // For calculating what we're showing
  const totalItems = pagination.totalItems || 0;
  const currentPage = pagination.currentPage || 1;
  const rowsPerPage = pagination.rowsPerPage || 10;
  
  // Use the actual data count for accuracy
  const actualCount = itemCount !== undefined ? itemCount : 0;
  
  // Calculate display values
  const start = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const end = Math.min(totalItems, currentPage * rowsPerPage);
  
  const handlePageChange = (newPage: number) => {
    // Log for debugging
    console.log('Changing page (bottom pagination) to:', newPage);
    
    onTableStateChange({
      pagination: {
        ...pagination,
        currentPage: newPage
      }
    });
  };

  return (
    <div className="p-4 border-t flex justify-between items-center">
      <span className="text-sm text-muted-foreground">
        {totalItems === 0 
          ? 'No results' 
          : `Showing ${start}-${end} of ${totalItems}`}
        {selectedCount > 0 && ` • ${selectedCount} selected`}
      </span>
      
      <div className="flex gap-2">
        <Button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage <= 1}
          variant="outline"
          size="sm"
          className="rounded-md"
        >
          Previous
        </Button>
        <Button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage >= pagination.totalPages}
          variant="outline"
          size="sm"
          className="rounded-md"
        >
          Next
        </Button>
      </div>
    </div>
  );
}