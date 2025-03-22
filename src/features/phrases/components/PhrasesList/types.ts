// src/features/phrases/components/PhrasesList/types.ts
import { Phrase } from '@/types';

export interface PhraseListProps {
  phrases: Phrase[];
  loading: boolean;
  selectedRows: number[];
  hiddenColumns: string[];
  onSelectRow: (id: number) => void;
  onSelectAll: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  newIds?: number[];
}