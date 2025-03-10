// src/components/phrases/phrases-table/index.tsx
import React, { useState } from 'react';
import { DataTable } from '@/components/tables/data-table';
import { DataTableToolbar } from '@/components/tables/data-table/toolbar';
import { DataTablePagination } from '@/components/tables/data-table/pagination';
import { Button } from '@/components/ui/button';
import { TableState } from '@/components/tables/types';
import { PencilIcon, TrashIcon } from 'lucide-react';

interface PhrasesTableProps {
  phrases: any[];
  loading?: boolean;
  tableState: TableState;
  onTableStateChange: (updates: Partial<TableState>) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  newIds?: number[];
  onShowFilters?: () => void;
}

export function PhrasesTable({
  phrases,
  loading = false,
  tableState,
  onTableStateChange,
  onEdit,
  onDelete,
  newIds = [],
  onShowFilters
}: PhrasesTableProps) {
  const columns = [
    {
      key: 'phrase',
      header: 'Phrase',
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.phrase}</span>
          {row.hint && (
            <span className="text-xs text-muted-foreground">
              Hint: {row.hint}
            </span>
          )}
          {newIds?.includes(row.id) && (
            <span className="mt-1 self-start text-xs px-2 py-0.5 border rounded-full">
              New
            </span>
          )}
        </div>
      ),
      sortable: true
    },
    {
      key: 'part_of_speech',
      header: 'Part of Speech',
      cell: (row: any) => row.part_of_speech || '-',
      sortable: true
    },
    {
      key: 'category',
      header: 'Category',
      cell: (row: any) => row.categories?.name || '-',
      sortable: true
    },
    {
      key: 'subcategory',
      header: 'Subcategory',
      cell: (row: any) => row.subcategories?.name || '-',
      sortable: true
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      cell: (row: any) => {
        const level = row.difficulty || 1;
        return (
          <div className="flex items-center">
            <span>{level}</span>
            <div className="ml-2 flex">
              {Array.from({ length: level }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-zinc-500 mr-1"
                />
              ))}
              {Array.from({ length: 3 - level }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-zinc-300 mr-1"
                />
              ))}
            </div>
          </div>
        );
      },
      sortable: true
    },
    {
      key: 'actions',
      header: '',
      cell: (row: any) => (
        <div className="flex justify-end space-x-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(row.id)}
              className="h-8 w-8"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(row.id)}
              className="h-8 w-8"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  // Filter the phrases based on search string
  const filteredPhrases = phrases?.filter(phrase => {
    if (!tableState.filters.search) return true;
    
    const search = tableState.filters.search.toLowerCase();
    
    return (
      (phrase.phrase && phrase.phrase.toLowerCase().includes(search)) ||
      (phrase.categories?.name && phrase.categories.name.toLowerCase().includes(search)) ||
      (phrase.subcategories?.name && phrase.subcategories.name.toLowerCase().includes(search)) ||
      (phrase.part_of_speech && phrase.part_of_speech.toLowerCase().includes(search)) ||
      (phrase.hint && phrase.hint.toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-2">
      {/* Directly render the toolbar instead of using DataTableHeader */}
      <DataTableToolbar
        tableState={tableState}
        onTableStateChange={onTableStateChange}
        selectedRows={[]}
        columns={columns} 
        onShowAdvancedFilters={onShowFilters}
      />
      
      <div className="rounded-lg border">
        <DataTable
          data={filteredPhrases || []}
          columns={columns}
          tableState={tableState} // Explicitly pass tableState
          sortConfig={tableState.sortConfig}
          onSortChange={(key) => {
            onTableStateChange({
              sortConfig: {
                key,
                direction:
                  tableState.sortConfig.key === key &&
                  tableState.sortConfig.direction === 'asc'
                    ? 'desc'
                    : 'asc'
              }
            });
          }}
          loading={loading}
          hiddenColumns={tableState.hiddenColumns || []}
          getRowId={(row) => row.id}
        />
      </div>
      
      <DataTablePagination
        tableState={tableState}
        onTableStateChange={onTableStateChange}
        itemCount={filteredPhrases?.length || 0}
      />
    </div>
  );
}