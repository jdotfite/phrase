// src/components/phrases/phrases-table/actions.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Phrase } from './columns';

interface RowActionsProps {
  phrase: Phrase;
  onEdit: (phrase: Phrase) => void;
  onDelete: (id: string | number) => void;
}

export function PhraseRowActions({ phrase, onEdit, onDelete }: RowActionsProps) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this phrase?')) {
      onDelete(phrase.id);
    }
  };

  return (
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
          onClick={handleDelete}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface BulkActionsProps {
  selectedCount: number;
  onDelete: () => void;
}

export function PhraseBulkActions({ selectedCount, onDelete }: BulkActionsProps) {
  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={onDelete}
      className="flex items-center gap-1"
    >
      <Trash2 className="h-4 w-4" />
      Delete {selectedCount} selected
    </Button>
  );
}