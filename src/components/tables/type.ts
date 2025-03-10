// src/components/tables/types.ts
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  totalItems: number;
}

export interface FiltersState {
  search?: string;
  category?: string;
  subcategory?: string;
  difficulty?: number | null;
  tags?: string[];
  [key: string]: any; // Allow for additional filter properties
}

export interface TableState {
  sortConfig: {
    key: string;
    direction: 'asc' | 'desc';
  };
  pagination: {
    currentPage: number;
    rowsPerPage: number;
    totalItems?: number;
    totalPages?: number;
  };
  filters: {
    search?: string;
    [key: string]: any;
  };
  hiddenColumns?: string[]; // Add this for column visibility
}

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  cellClassName?: string;
}

export interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}