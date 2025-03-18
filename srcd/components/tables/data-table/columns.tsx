// src/components/phrases/phrases-table/columns.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import TagDisplay from '@/components/common/TagDisplay';
import { ColumnDef } from '@/components/tables/types';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Define the Phrase type
export interface Phrase {
  id: number | string;
  phrase: string;
  category: string;
  difficulty: number;
  tags: string[];
  hint?: string;
  [key: string]: any;
}

// Difficulty label mapping
export const difficultyLabels: Record<number, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

// Function to get the appropriate color for difficulty level
export const getDifficultyColor = (difficulty: number | null | undefined): string => {
  if (difficulty === null || difficulty === undefined) {
    return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

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

// Define column configuration for phrases
export const getPhrasesColumns = (sortConfig: { key: string; direction: 'asc' | 'desc' }): ColumnDef<Phrase>[] => [
  { 
    key: 'id', 
    header: (
      <div className="flex items-center gap-2">
        ID
        {sortConfig.key === 'id' && (
          sortConfig.direction === 'asc' 
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    ),
    cellClassName: 'text-muted-foreground'
  },
  { 
    key: 'phrase', 
    header: (
      <div className="flex items-center gap-2">
        Phrase
        {sortConfig.key === 'phrase' && (
          sortConfig.direction === 'asc' 
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    ),
  },
  { 
    key: 'category', 
    header: (
      <div className="flex items-center gap-2">
        Category
        {sortConfig.key === 'category' && (
          sortConfig.direction === 'asc' 
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    ),
    cellClassName: 'text-muted-foreground'
  },
  { 
    key: 'difficulty', 
    header: (
      <div className="flex items-center gap-2">
        Difficulty
        {sortConfig.key === 'difficulty' && (
          sortConfig.direction === 'asc' 
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    ),
    cell: (row) => (
      <span className={cn(
        "px-2 py-1 rounded-full text-xs",
        getDifficultyColor(row.difficulty)
      )}>
        {difficultyLabels[row.difficulty] || '-'}
      </span>
    )
  },
  { 
    key: 'tags', 
    header: (
      <div className="flex items-center gap-2">
        Tags
        {sortConfig.key === 'tags' && (
          sortConfig.direction === 'asc' 
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    ),
    cell: (row) => <TagDisplay tags={row.tags} />
  },
  { 
    key: 'hint', 
    header: (
      <div className="flex items-center gap-2">
        Hint
        {sortConfig.key === 'hint' && (
          sortConfig.direction === 'asc' 
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    ),
    cellClassName: 'text-muted-foreground',
    cell: (row) => row.hint || '-'
  },
];