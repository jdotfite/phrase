// features/dashboard/types.ts
export interface TableState {
    sortConfig: {
      key: string;
      direction: 'asc' | 'desc';
    };
    pagination: {
      currentPage: number;
      rowsPerPage: number;
      totalItems: number;
      totalPages: number;
    };
    filters: {
      searchTerm: string;
      category: string;
      difficulty: string;
      subcategory: string;
      part_of_speech: string;
    };
  }
  
  export interface DashboardStateHook {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    showWordCreatorModal: boolean;
    setShowWordCreatorModal: (show: boolean) => void;
    showReviewModal: boolean;
    setShowReviewModal: (show: boolean) => void;
    showFilterModal: boolean;
    setShowFilterModal: (show: boolean) => void;
    showExportModal: boolean;
    setShowExportModal: (show: boolean) => void;
    newIds: number[];
    setNewIds: (ids: number[]) => void;
    dateRange: number;
    updateDateRange: (days: number) => void;
  }