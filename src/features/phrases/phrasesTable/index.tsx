import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Search, Columns, Pencil, Trash, ChevronLeft, ChevronRight, MoreHorizontal, X } from 'lucide-react';
import { TableState } from '@/components/tables/types';
import TagDisplay from '@/components/ui/tags';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/services/supabase';

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
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchValue, setSearchValue] = useState(tableState.filters.search || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Columns configuration for dropdown
  const columns = [
    { key: 'phrase', label: 'Phrase' },
    { key: 'category', label: 'Category' },
    { key: 'hint', label: 'Hint' }, // Moved hint to be after category
    { key: 'tags', label: 'Tags' },
    { key: 'difficulty', label: 'Difficulty' },
    { key: 'reviewed', label: 'Reviewed' }
  ];

  // Current visible columns
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Global search across the entire database - Only search phrase column
  const performGlobalSearch = async () => {
    if (!searchValue.trim()) {
      onTableStateChange({
        filters: {
          ...tableState.filters,
          search: ''
        }
      });
      return;
    }

    setIsSearching(true);
    try {
      const searchTerm = searchValue.toLowerCase().trim();
      
      // Search only the phrase column
      const { data, error } = await supabase
        .from('phrases')
        .select(`
          *,
          categories:category_id(name),
          subcategories:subcategory_id(name),
          phrase_tags!inner(
            tags(id, tag)
          )
        `)
        .ilike('phrase', `%${searchTerm}%`); // Only search in phrase column

      if (error) throw error;

      const transformedData = (data || []).map(item => ({
        ...item,
        category: item.categories?.name || '',
        subcategory: item.subcategories?.name || '',
        tags: item.phrase_tags
          ?.map((pt: any) => pt.tags.tag)
          .filter(Boolean)
          .join(',') || ''
      }));

      // Update search results and pagination
      setSearchResults(transformedData);
      
      // Update filter state
      onTableStateChange({
        filters: {
          ...tableState.filters,
          search: searchValue
        },
        pagination: {
          ...tableState.pagination,
          currentPage: 1,
          totalItems: transformedData.length,
          totalPages: Math.ceil(transformedData.length / tableState.pagination.rowsPerPage)
        }
      });
    } catch (err) {
      console.error('Error searching phrases:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performGlobalSearch();
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchValue('');
    setSearchResults([]);
    onTableStateChange({
      filters: {
        ...tableState.filters,
        search: ''
      }
    });
  };

  const handleRowsPerPageChange = (value: string) => {
    const newRowsPerPage = parseInt(value, 10);
    
    // Call the parent component's handler
    onTableStateChange({
      pagination: {
        ...tableState.pagination,
        rowsPerPage: newRowsPerPage,
        currentPage: 1  // Reset to page 1 when changing rows per page
      }
    });
  };

  const handlePageChange = (newPage: number) => {
    onTableStateChange({
      pagination: {
        ...tableState.pagination,
        currentPage: newPage
      }
    });
  };

  const handleSort = (key: string) => {
    onTableStateChange({
      sortConfig: {
        key,
        direction: 
          tableState.sortConfig.key === key && 
          tableState.sortConfig.direction === 'asc' ? 'desc' : 'asc'
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === phrases.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(phrases.map(phrase => phrase.id));
    }
  };

  const toggleRowSelection = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id));
    } else {
      setSelectedRows(prev => [...prev, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length > 0 && window.confirm(`Are you sure you want to delete ${selectedRows.length} phrases?`)) {
      for (const id of selectedRows) {
        await onDelete?.(id);
      }
      setSelectedRows([]);
    }
  };

  // Helper function to get difficulty bar color and width
  const getDifficultyBar = (difficulty: number) => {
    const colorClass = 
      difficulty === 1 ? 'bg-gray-200' : 
      difficulty === 2 ? 'bg-gray-200' : 
      difficulty === 3 ? 'bg-gray-200' : 'bg-gray-200';
    
    const width = 
      difficulty === 1 ? 'w-1/3' : 
      difficulty === 2 ? 'w-2/3' : 
      difficulty === 3 ? 'w-full' : 'w-0';
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
        <div className={`${colorClass} ${width} h-2.5 rounded-full`}></div>
      </div>
    );
  };

  // Determine which data to show
  const displayData = searchValue && searchResults.length > 0 ? searchResults : phrases;


  return (
    <div className="space-y-2">
      {/* Top toolbar with pagination and search */}
      <div className="flex flex-wrap items-center justify-between pb-4">
        <div className="flex items-center gap-4">
          {/* Rows per page dropdown */}
          <Select
  value={tableState.pagination.rowsPerPage.toString()}
  onValueChange={handleRowsPerPageChange}
>
  <SelectTrigger className="w-[120px]">
    <SelectValue placeholder={`${tableState.pagination.rowsPerPage} per page`} />
  </SelectTrigger>
  <SelectContent>
    {[10, 25, 50, 100].map(value => (  // Removed 20 from here
      <SelectItem key={value} value={value.toString()}>
        {value} per page
      </SelectItem>
    ))}
  </SelectContent>
</Select>
          
          {/* Page info */}
          <span className="text-sm text-muted-foreground">
            {tableState.pagination.totalPages > 0
              ? `Page ${tableState.pagination.currentPage} of ${tableState.pagination.totalPages}`
              : 'No results'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              placeholder="Search phrases..."
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onBlur={performGlobalSearch}
              className="pl-10 pr-10"
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
          
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Columns className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={!hiddenColumns.includes(column.key)}
                  onCheckedChange={(checked) => {
                    setHiddenColumns(prev => 
                      checked 
                        ? prev.filter(key => key !== column.key)
                        : [...prev, column.key]
                    );
                  }}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Pagination buttons */}
          <Button
  variant="outline"
  size="sm"
  onClick={() => handlePageChange(tableState.pagination.currentPage - 1)}
  disabled={tableState.pagination.currentPage <= 1}
>
  <ChevronLeft className="h-4 w-4" />
</Button>
<Button
  variant="outline"
  size="sm"
  onClick={() => handlePageChange(tableState.pagination.currentPage + 1)}
  disabled={tableState.pagination.currentPage >= tableState.pagination.totalPages}
>
  <ChevronRight className="h-4 w-4" />
</Button>
        </div>
      </div>

      {/* Main table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Checkbox column */}
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length > 0 && selectedRows.length === displayData.length}
                  indeterminate={selectedRows.length > 0 && selectedRows.length < displayData.length ? true : undefined}
  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              
              {/* Phrase column */}
              {!hiddenColumns.includes('phrase') && (
                <TableHead onClick={() => handleSort('phrase')} className="cursor-pointer">
                  Phrase
                </TableHead>
              )}
              
              {/* Category column */}
              {!hiddenColumns.includes('category') && (
                <TableHead onClick={() => handleSort('category')} className="cursor-pointer">
                  Category
                </TableHead>
              )}
              
              {/* Hint column - Moved here */}
              {!hiddenColumns.includes('hint') && (
                <TableHead onClick={() => handleSort('hint')} className="cursor-pointer">
                  Hint
                </TableHead>
              )}
              
              {/* Tags column */}
              {!hiddenColumns.includes('tags') && (
                <TableHead onClick={() => handleSort('tags')} className="cursor-pointer">
                  Tags
                </TableHead>
              )}
              
              {/* Difficulty column */}
              {!hiddenColumns.includes('difficulty') && (
                <TableHead onClick={() => handleSort('difficulty')} className="cursor-pointer">
                  Difficulty
                </TableHead>
              )}
              
              {/* Reviewed column */}
              {!hiddenColumns.includes('reviewed') && (
                <TableHead>Reviewed</TableHead>
              )}
              
              {/* Actions column */}
              <TableHead className="w-[80px]">
                {selectedRows.length > 0 ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="h-8"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                ) : null}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || isSearching ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {isSearching ? 'Searching...' : 'Loading...'}
                </TableCell>
              </TableRow>
            ) : displayData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No phrases found.
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((phrase) => (
                <TableRow 
                  key={phrase.id}
                  className={cn(
                    selectedRows.includes(phrase.id) && "bg-muted",
                    newIds.includes(phrase.id) && "animate-flash"
                  )}
                >
                  {/* Checkbox */}
                  <TableCell className="w-12">
                    <Checkbox
                      checked={selectedRows.includes(phrase.id)}
                      onCheckedChange={() => toggleRowSelection(phrase.id)}
                    />
                  </TableCell>
                  
                  {/* Phrase */}
                  {!hiddenColumns.includes('phrase') && (
                    <TableCell className="font-medium">{phrase.phrase}</TableCell>
                  )}
                  
                  {/* Category */}
                  {!hiddenColumns.includes('category') && (
                    <TableCell>{phrase.category}</TableCell>
                  )}
                  
                  {/* Hint - Moved here */}
                  {!hiddenColumns.includes('hint') && (
                    <TableCell>{phrase.hint || '-'}</TableCell>
                  )}
                  
                  {/* Tags */}
                  {!hiddenColumns.includes('tags') && (
                    <TableCell>
                      <TagDisplay tags={phrase.tags || ''} />
                    </TableCell>
                  )}
                  
                  {/* Difficulty - Bar Style */}
                  {!hiddenColumns.includes('difficulty') && (
                    <TableCell>
                      {getDifficultyBar(phrase.difficulty)}
                    </TableCell>
                  )}
                  
                  {/* Reviewed Status */}
                  {!hiddenColumns.includes('reviewed') && (
                    <TableCell>
                      <div className="flex justify-center">
                        {phrase.reviewed ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <Check className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                    </TableCell>
                  )}
                  
                  {/* Actions */}
                  <TableCell>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEdit?.(phrase.id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this phrase?')) {
                                onDelete?.(phrase.id);
                              }
                            }}
                            className="text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}