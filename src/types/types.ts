import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

/**
 * Base interface for phrases
 */
export interface PhraseBase {
  phrase: string;
  category: string;
  difficulty: string;
  subcategory: string;
  tags: string;
  hint: string;
  part_of_speech: string;
}

/**
 * Full phrase interface including ID and optional fields
 */
export interface Phrase extends PhraseBase {
  id: number;
  last_used?: string | null;
}

/**
 * New phrase without ID (for creation)
 */
export type NewPhrase = PhraseBase;

/**
 * Filter options for the phrases table
 */
export interface Filters {
  searchTerm: string;
  category: string;
  difficulty: string;
  subcategory: string;
  part_of_speech: string;
}

/**
 * Pagination state
 */
export interface PaginationState {
  currentPage: number;
  rowsPerPage: number;
  totalPages: number;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  key: keyof Phrase | '';
  direction: 'asc' | 'desc';
}

/**
 * Stats data structure
 */
export interface Stats {
  total: number;
  uniqueCategories: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

/**
 * Component Props
 */
export interface AddPhraseFormProps {
  onAddPhrase: (phrase: NewPhrase) => Promise<void>;
  categories: string[];
  difficulties: string[];
  partsOfSpeech: string[];
  loading: boolean;
}

export interface BulkImportFormProps {
  onSuccess: (newIds?: number[]) => void;
  onError: (message: string) => void;
}

export interface FilterControlsProps {
  filters: Filters;
  onChange: (name: string, value: string) => void;
  onReset: () => void;
  categories: string[];
  difficulties: string[];
  partsOfSpeech: string[];
}

export interface AdminNavBarProps {
  session: Session | null;
  setShowLoginModal: (show: boolean) => void;
}

export interface StatsSectionProps {
  stats: Stats;
  loading?: boolean;
}

export interface LoginProps {
  onClose: () => void;
}

export interface PhrasesTableProps {
  phrases: Phrase[];
  loading: boolean;
  pagination: PaginationState;
  sortConfig: SortConfig;
  onSort: (key: keyof Phrase) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (phrase: Phrase) => void;
  onDelete: (id: number) => void;
  onShowCardView: () => void;
  newIds?: number[];
}

export interface CardViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  phrases: Phrase[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  isEditing: boolean;
  editedPhrase: Phrase | null;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onEditChange: (field: keyof Phrase, value: string) => void;
  categories: string[];
  difficulties: string[];
  partsOfSpeech: string[];
  onTagClick?: (tag: string) => void;
}

export interface TagDisplayProps {
  tags: string;
  onClick?: (tag: string) => void;
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  delay?: number;
}

/**
 * Hook Types
 */
export interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

export interface UsePhrasesReturn {
  phrases: Phrase[];
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  pagination: PaginationState;
  sortConfig: SortConfig;
  filters: Filters;
  handleSort: (key: keyof Phrase) => void;
  handlePageChange: (page: number) => void;
  handleRowsPerPageChange: (rowsPerPage: number) => void;
  handleFilterChange: (name: string, value: string) => void;
  addPhrase: (phrase: NewPhrase) => Promise<void>;
  editPhrase: (phrase: Phrase) => Promise<void>;
  deletePhrase: (id: number) => Promise<void>;
  fetchPhrases: () => Promise<void>;
  applyFilters: () => void;
  resetFilters: () => void;
  sortByIdDesc: () => void;
}

/**
 * Utility Types
 */
export interface TagValidationResult {
  isValid: boolean;
  formattedTags: string;
  errors?: string[];
}

export interface BulkImportResult {
  success: boolean;
  message: string;
  newIds?: number[];
}