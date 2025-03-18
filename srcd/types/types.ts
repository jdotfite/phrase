import type { Session } from '@supabase/supabase-js';

export interface PhraseWithRelations extends Phrase {
  categories: Category;
  subcategories?: Subcategory;
  phrase_tags: {
    tags: Tag;
  }[];
}

export interface SupabaseQueryResponse<T> {
  data: T[] | null;
  error: any;
  count?: number | null;
}

export interface Category {
  id: number;
  name: string;
}

export interface PhraseTagWithTag {
  tag_id: number;
  tags: {
    id: number;
    tag: string;
  };
}

export type SubcategoryName = {
  name: string;
}

export interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

export interface Tag {
  id: number;
  tag: string;
}

export interface PhraseTag {
  phrase_id: number;
  tag_id: number;
}

export interface PhraseBase {
  phrase: string;
  category_id: number;
  subcategory_id?: number | null;
  difficulty: number;  // Changed from string to number
  part_of_speech: string;
  hint?: string | null;
}

export interface Phrase extends Omit<PhraseBase, 'category_id' | 'subcategory_id'> {
  id: number;
  category: string;
  subcategory?: string;
  tags: string;
  difficulty: number;
}

export interface NewPhrase {
  phrase: string;
  category: string;
  subcategory?: string;
  difficulty: string;
  part_of_speech: string;
  hint?: string;
  tags?: string;
}

export interface Vote {
  id: string;
  reviewer_id: string;
  phrase_id: number;
  category: VoteCategory;
  vote: boolean;
  created_at: string;
}

export type VoteCategory = 'phrase' | 'category' | 'subcategory' | 'hint' | 'tags' | 'difficulty';

export interface Filters {
  searchTerm: string;
  category: string;
  difficulty: string;
  subcategory: string;
  part_of_speech: string;
}

export interface PaginationState {
  currentPage: number;
  rowsPerPage: number;
  totalPages: number;
}

export interface SortConfig {
  key: keyof Phrase | '';
  direction: 'asc' | 'desc';
}

export interface Stats {
  total: number;
  uniqueCategories: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface Reviewer {
  id: string;
  name: string;
  pin: string;
  total_reviews: number;
  current_streak: number;
  last_review_at: string | null;
}

export interface BulkImportFormProps {
  onSuccess: (importedIds?: number[]) => void;
  onError: (errorMessage: string) => void;
  categories?: string[];
  difficulties?: string[];
  partsOfSpeech?: string[];
}

export interface ImportedPhrase extends NewPhrase {
  id: number;
}

export interface AddPhraseFormProps {
  onAddPhrase: (phrase: NewPhrase) => Promise<void>;
  categories: string[];
  difficulties: string[];
  partsOfSpeech: string[];
  loading: boolean;
}

export interface FilterControlsProps {
  filters: Filters;
  onChange: (name: string, value: string) => void;
  onReset: () => void;
  categories: string[];
  difficulties: string[];
  partsOfSpeech: string[];
  loading?: boolean;
}

export interface PhrasesTableProps {
  phrases: Phrase[];
  loading: boolean;
  pagination: PaginationState;
  sortConfig: SortConfig;
  onSort: (key: keyof Phrase) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (phrase: Phrase) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
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
  reviewer?: Reviewer;
  onTagClick?: (tag: string) => void;
  loading?: boolean;
  error?: string | null;
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
  resetFilters: () => void;
  sortByIdDesc: () => void;
}

export interface TagValidationResult {
  isValid: boolean;
  formattedTags: string;
  errors?: string[];
}

export interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export interface TagDisplayProps {
  tags: string;
  onClick?: (tag: string) => void;
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

export interface StatsSectionProps {
  stats: Stats | null;
  loading: boolean;
}