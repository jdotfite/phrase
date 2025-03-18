// src/components/tables/data-table/index.tsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTablePagination } from "./pagination";
import { DataTableToolbar } from "./toolbar";
import { cn } from "@/lib/utils";
import { ColumnDef, TableState } from "../types";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  tableState?: TableState;
  sortConfig?: { key: string; direction: 'asc' | 'desc' };
  onSortChange?: (key: string) => void;
  onRowSelect?: (rowId: string | number) => void;
  onSelectAll?: () => void;
  selectedRows?: (string | number)[];
  bulkActions?: React.ReactNode;
  rowActions?: (row: T) => React.ReactNode;
  highlightedRows?: (string | number)[];
  getRowId: (row: T) => string | number;
  isLoading?: boolean;
  onShowAdvancedFilters?: () => void;
  hiddenColumns?: string[];
  children?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  tableState,
  sortConfig,
  onSortChange,
  onRowSelect,
  onSelectAll,
  selectedRows = [],
  bulkActions,
  rowActions,
  highlightedRows = [],
  getRowId,
  isLoading = false,
  onShowAdvancedFilters,
  hiddenColumns = [],
  children
}: DataTableProps<T>) {
  const [showSelection, setShowSelection] = useState(!!onRowSelect);

  // Use sortConfig from props if provided, otherwise from tableState
  const effectiveSortConfig = sortConfig || tableState?.sortConfig;

  // Log state changes for debugging
  useEffect(() => {
    console.log('TableState updated:', tableState);
  }, [tableState]);

  // Ensure totalItems and totalPages are properly set
  useEffect(() => {
    if (!isLoading && tableState && data.length > 0) {
      if (!tableState.pagination.totalItems) {
        console.log('Setting totalItems from data length:', data.length);
        onSortChange && onSortChange(effectiveSortConfig?.key || '');
      }
    }
  }, [data, isLoading]);

  const handleSort = (key: string) => {
    onSortChange && onSortChange(key);
  };

  // Filter visible columns
  const visibleColumns = columns.filter(column => 
    !hiddenColumns.includes(column.key)
  );

  // For debugging
  const debugInfo = {
    dataLength: data.length,
    isLoading,
    rowsPerPage: tableState?.pagination?.rowsPerPage || 10,
    currentPage: tableState?.pagination?.currentPage || 1,
    totalItems: tableState?.pagination?.totalItems || data.length,
    totalPages: tableState?.pagination?.totalPages || Math.ceil(data.length / 10),
    selectedRows: selectedRows.length
  };

  return (
    <div className="rounded-lg border">
      {/* Add debugging info - remove in production */}
      {process.env.NODE_ENV === 'development' && false && (
        <div className="p-2 text-xs bg-amber-100 text-amber-900">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
      
      {/* Custom header/toolbar area */}
      {children}

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Select All Checkbox */}
              {onRowSelect && onSelectAll && (
                <TableHead className="w-12">
                  <Checkbox 
                    checked={data.length > 0 && selectedRows.length === data.length}
                    indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                    onCheckedChange={onSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              
              {/* Only render visible columns */}
              {visibleColumns.map((column) => (
                <TableHead 
                  key={column.key}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={cn(
                    column.sortable !== false && "cursor-pointer",
                    column.className
                  )}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                  </div>
                </TableHead>
              ))}
              
              {/* Actions column */}
              {rowActions && <TableHead className="w-10"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell 
                  colSpan={visibleColumns.length + (onRowSelect ? 1 : 0) + (rowActions ? 1 : 0)} 
                  className="text-center h-24"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={visibleColumns.length + (onRowSelect ? 1 : 0) + (rowActions ? 1 : 0)} 
                  className="text-center h-24"
                >
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const rowId = getRowId(row);
                return (
                  <TableRow 
                    key={rowId}
                    className={cn(
                      highlightedRows.includes(rowId) ? 'animate-flash' : '',
                      selectedRows.includes(rowId) ? 'bg-muted' : ''
                    )}
                    data-state={selectedRows.includes(rowId) ? 'selected' : undefined}
                  >
                    {/* Row Selection Checkbox */}
                    {onRowSelect && (
                      <TableCell className="w-12">
                        <Checkbox 
                          checked={selectedRows.includes(rowId)}
                          onCheckedChange={() => onRowSelect(rowId)}
                          aria-label={`Select row ${rowId}`}
                        />
                      </TableCell>
                    )}
                    
                    {/* Data cells - only render visible columns */}
                    {visibleColumns.map((column) => (
                      <TableCell key={column.key} className={column.cellClassName}>
                        {column.cell ? column.cell(row) : row[column.key as keyof T]}
                      </TableCell>
                    ))}
                    
                    {/* Row actions */}
                    {rowActions && (
                      <TableCell className="text-right">
                        {rowActions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}