// In PhrasesList.tsx, update the difficulty rendering section
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import TagDisplay from '@/components/ui/tags';
import { Pencil, Trash, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PhraseListProps } from './types';
import { getDifficultyBar } from '../../utils/formatting'; 
import { cn } from '@/lib/utils';

export function PhrasesList({
  phrases,
  loading,
  selectedRows,
  hiddenColumns,
  onSelectRow,
  onSelectAll,
  onEdit,
  onDelete,
  newIds = []
}: PhraseListProps) {
  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="h-24 text-center">
          Loading...
        </TableCell>
      </TableRow>
    );
  }

  if (phrases.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="h-24 text-center">
          No phrases found.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {/* Checkbox column */}
          <TableHead className="w-12">
            <Checkbox
              checked={selectedRows.length > 0 && selectedRows.length === phrases.length}
              indeterminate={selectedRows.length > 0 && selectedRows.length < phrases.length ? true : undefined}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          
          {/* Phrase column */}
          {!hiddenColumns.includes('phrase') && (
            <TableHead>Phrase</TableHead>
          )}
          
          {/* Category column */}
          {!hiddenColumns.includes('category') && (
            <TableHead>Category</TableHead>
          )}
          
          {/* Hint column */}
          {!hiddenColumns.includes('hint') && (
            <TableHead>Hint</TableHead>
          )}
          
          {/* Tags column */}
          {!hiddenColumns.includes('tags') && (
            <TableHead>Tags</TableHead>
          )}
          
          {/* Difficulty column */}
          {!hiddenColumns.includes('difficulty') && (
            <TableHead>Difficulty</TableHead>
          )}
          
          {/* Actions column */}
          <TableHead className="w-[80px]">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {phrases.map((phrase) => (
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
                onCheckedChange={() => onSelectRow(phrase.id)}
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
            
            {/* Hint */}
            {!hiddenColumns.includes('hint') && (
              <TableCell>{phrase.hint || '-'}</TableCell>
            )}
            
            {/* Tags */}
            {!hiddenColumns.includes('tags') && (
              <TableCell>
                <TagDisplay tags={phrase.tags || ''} />
              </TableCell>
            )}
            
            {/* Difficulty - use the utility function */}
            {!hiddenColumns.includes('difficulty') && (
              <TableCell>
                {/* Use the returned CSS classes */}
                <div className={getDifficultyBar(phrase.difficulty).containerClass}>
                  <div className={getDifficultyBar(phrase.difficulty).barClass}></div>
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
                    <DropdownMenuItem onClick={() => onEdit(phrase.id)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(phrase.id)}
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
        ))}
      </TableBody>
    </Table>
  );
}