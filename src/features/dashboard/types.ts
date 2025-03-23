// features/dashboard/types.ts
import type { Reviewer } from '@/types/types';
export interface DashboardStateHook {
  // Tab and Modal States
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
  
  // Data States
  selectedPhraseId: number | null;
  setSelectedPhraseId: (id: number | null) => void;
  newIds: number[];
  setNewIds: (ids: number[]) => void;
  dateRange: number;
  updateDateRange: (days: number) => void;
  currentReviewer: Reviewer | null;
  isExporting: boolean;
  setIsExporting: (isExporting: boolean) => void;
  
  // Loading States
  isLoading: boolean;
  error: string | null;
  
  // Handlers
  handleLoginSuccess: (reviewer: Reviewer) => void;
  handleLogout: () => void;
  handleWordAdded: (id: number) => void;
}