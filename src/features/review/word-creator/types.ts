// components/reviewer/WordCreator/types.ts
import type { Reviewer } from '@/types/types';

export interface WordCreatorProps {
  reviewer: Reviewer;
  categories: string[];
  onSwitchMode: () => void;
}

export interface GeneratedPhrase {
  id: string;
  phrase: string;
  hint?: string;
  category?: string;
  subcategory?: string;
  difficulty?: number;
  tags?: string;
  edited?: boolean;
  saved?: boolean;
  dbId?: number; // Reference to the saved database ID
}

export enum WordCreationStep {
  GENERATE = 'generate',
  SELECT = 'select',
  EDIT = 'edit'
}

export const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];