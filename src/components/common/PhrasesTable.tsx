// components/common/PhrasesTable.tsx
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import TagDisplay from '@/components/common/TagDisplay';
import { cn } from "@/lib/utils";

const PhrasesTable = ({
  phrases = [],
  loading,
  sortConfig = { key: '', direction: 'asc' },
  pagination,
  onSort,
  onEdit,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
  newIds = [],
  onShowFilters
}) => {
  // State for selected rows
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Column headers definition
  const columnHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'phrase', label: 'Phrase' },
    { key: 'category', label: 'Category' },
    { key: 'difficulty', label: 'Difficulty' },
    { key: 'tags', label: 'Tags' },
    { key: 'hint', label: 'Hint' }
  ];

  // Define difficulty labels
  const difficultyLabels = {
    1: 'Easy',
    2: 'Medium',
    3: 'Hard',
  };

  // Ensure the dropdown displays the correct rows per page on load
  useEffect(() => {
    // This ensures we show the correct value in the dropdown
    if (pagination.rowsPerPage !== 20) {
      onRowsPerPageChange(20);
    }
  }, []);

  // Clear selected rows when page changes
  useEffect(() => {
    setSelectedRows([]);
  }, [pagination.currentPage]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this phrase?')) {
      await onDelete(id);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} phrases?`)) {
      // Assuming onDelete can handle an array of IDs for bulk deletion
      // If it can't, you would need to loop through and delete each one
      await Promise.all(selectedRows.map(id => onDelete(id)));
      setSelectedRows([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === phrases.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(phrases.map(phrase => phrase.id));
    }
  };

  const toggleRowSelection = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const getDifficultyColor = (difficulty) => {
    // If difficulty is null or undefined, return the default color
    if (difficulty === null || difficulty === undefined) {
      return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }

    // Handle numeric difficulty values - using the gray shades from the chart
    switch (difficulty) {
      case 1: // Easy
        return 'bg-[#EEEEEE] text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 2: // Medium
        return 'bg-[#AAAAAA] text-white dark:bg-gray-600 dark:text-gray-200';
      case 3: // Hard
        return 'bg-[#666666] text-white dark:bg-gray-800 dark:text-gray-100';
      default:
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Loading phrases...
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      {/* Table Header Controls */}
      <div className="p-4 border-b flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Delete Selected Button - Shows only when rows are selected */}
          {selectedRows.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBulkDelete}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete {selectedRows.length} selected
            </Button>
          )}
          
          {selectedRows.length === 0 && (
            <>
              {/* Rows per page selector */}
              <Select
                value={pagination.rowsPerPage.toString()}
                onValueChange={(value) => onRowsPerPageChange(Number(value))}
                defaultValue="20"
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="20 per page" />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 25, 50, 100].map(value => (
                    <SelectItem key={value} value={value.toString()}>
                      {value} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="text-sm text-muted-foreground">
                {pagination.totalPages > 0
                  ? `Page ${pagination.currentPage} of ${pagination.totalPages}`
                  : 'No results'}
              </span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {/* Filter button - Hide when rows are selected */}
          {selectedRows.length === 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={onShowFilters}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          )}
          
          {/* Pagination Controls */}
          <div className="flex gap-2">
            <Button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Select All Checkbox */}
              <TableHead className="w-12">
                <Checkbox 
                  checked={phrases.length > 0 && selectedRows.length === phrases.length}
                  indeterminate={selectedRows.length > 0 && selectedRows.length < phrases.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              
              {columnHeaders.map(({ key, label }) => (
                <TableHead 
                  key={key}
                  onClick={() => onSort(key)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {label}
                    {sortConfig.key === key && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {phrases.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columnHeaders.length + 2} 
                  className="text-center h-24"
                >
                  No phrases found
                </TableCell>
              </TableRow>
            ) : (
              phrases.map((phrase, index) => (
                <TableRow 
                  key={phrase.id}
                  className={cn(
                    newIds.includes(phrase.id) ? 'animate-flash' : '',
                    selectedRows.includes(phrase.id) ? 'bg-muted' : ''
                  )}
                >
                  {/* Row Selection Checkbox */}
                  <TableCell className="w-12">
                    <Checkbox 
                      checked={selectedRows.includes(phrase.id)}
                      onCheckedChange={() => toggleRowSelection(phrase.id)}
                      aria-label={`Select row ${index}`}
                    />
                  </TableCell>
                  
                  <TableCell className="text-muted-foreground">{phrase.id}</TableCell>
                  <TableCell>{phrase.phrase}</TableCell>
                  <TableCell className="text-muted-foreground">{phrase.category}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs",
                      getDifficultyColor(phrase.difficulty)
                    )}>
                      {difficultyLabels[phrase.difficulty] || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TagDisplay tags={phrase.tags} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{phrase.hint || '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(phrase)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(phrase.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom Pagination */}
      <div className="p-4 border-t flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {`Showing ${phrases.length} of ${pagination.totalPages * pagination.rowsPerPage} phrases`}
          {selectedRows.length > 0 && ` • ${selectedRows.length} selected`}
        </span>
        <div className="flex gap-2">
          <Button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            variant="outline"
            size="sm"
            className="rounded-md"
          >
            Previous
          </Button>
          <Button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            variant="outline"
            size="sm"
            className="rounded-md"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhrasesTable;