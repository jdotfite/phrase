'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

// Components
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { StatsCards } from '@/features/dashboard/components/StatsCards';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/providers/ToastProvider';
import { PillTabs, PillTabsContent } from '@/components/ui/pill-tabs';
import FilterModal from '@/features/filters/FilterModal';
import ExportModal from '@/features/dashboard/components/ExportModal';
import WordCreatorModal from '@/features/phrases/WordCreatorModal';
import ReviewModal from '@/features/phrases/ReviewModal';
import AnalyticsSection from '@/features/dashboard/components/AnalyticsSection';
import { PhrasesSection } from './components/PhrasesSection';
import { AccentDemo } from '@/components/ui/theme/AccentDemo';

// Hooks
import { useTheme } from 'next-themes';
import { useDashboardState } from '@/features/dashboard/hooks/useDashboardState';
import { usePhraseMetadata } from '@/features/data/hooks/usePhraseMetadata';
import { useExport, type ExportOptions } from '@/features/dashboard/hooks/useExport';
import { useToast } from '@/hooks/useToast';

// Types
import type { Reviewer } from '@/types/types';

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  // Use dashboard state hook for centralized state management
  const {
    activeTab, 
    setActiveTab,
    showWordCreatorModal, 
    setShowWordCreatorModal,
    showReviewModal, 
    setShowReviewModal,
    showFilterModal, 
    setShowFilterModal,
    showExportModal, 
    setShowExportModal,
    selectedPhraseId,
    setSelectedPhraseId,
    newIds, 
    setNewIds,
    currentReviewer,
    setCurrentReviewer, 
    isExporting: dashboardExporting,
    setIsExporting: setDashboardExporting,
    handleLoginSuccess,
    handleLogout,
    handleWordAdded
  } = useDashboardState();
  
  // Get metadata for filters
  const { categories, difficulties, partsOfSpeech } = usePhraseMetadata();

  /**
   * Handle adding words action
   */
  const handleAddWordsClick = () => {
    setShowWordCreatorModal(true);
  };
  
  /**
   * Handle review words action
   */
  const handleReviewWordsClick = () => {
    setShowReviewModal(true);
  };

  // Use the export hook for handling exports
  const { 
    exportPhrases, 
    downloadExport, 
    isExporting 
  } = useExport();
  
  /**
   * Handle exporting data
   */
  const handleExport = async (options: ExportOptions) => {
    const exportData = await exportPhrases(options);
    
    if (exportData) {
      downloadExport(exportData, options);
      return exportData;
    }
    
    return null;
  };

  return (
    <ToastProvider>
      <div className="container mx-auto py-6 px-4 sm:px-6 md:px-8 space-y-6">
        {/* Header Component */}
      <DashboardHeader
        theme={theme}
        setTheme={setTheme}
        onExportClick={() => setShowExportModal(true)}
        currentReviewer={currentReviewer}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onAddWordsClick={handleAddWordsClick}
        onReviewWordsClick={handleReviewWordsClick}
      />

      {/* Stats Cards */}
      <StatsCards />

      <div className="mb-6">
        {/* Modals */}
        {currentReviewer && (
          <>
            {/* Word Creator Modal */}
            <WordCreatorModal
              isOpen={showWordCreatorModal}
              onClose={() => setShowWordCreatorModal(false)}
              reviewer={currentReviewer}
              onWordAdded={handleWordAdded}
            />

            {/* Review Modal */}
            <ReviewModal
              isOpen={showReviewModal}
              onClose={() => {
                setShowReviewModal(false);
                setSelectedPhraseId(null);
              }}
              reviewer={currentReviewer}
              selectedPhraseId={selectedPhraseId}
            />
          </>
        )}

        {/* Main Tabs */}
        <PillTabs
          tabs={[
            { value: 'phrases', label: 'Phrases' },
            { value: 'analytics', label: 'Analytics' }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="py-3 border-dashed border-y"
        />

        {/* Phrases Tab */}
        <PillTabsContent value="phrases" activeTab={activeTab}>
          <PhrasesSection 
            newIds={newIds}
            onEdit={(id: number) => {
              setSelectedPhraseId(id);
              setShowReviewModal(true);
            }}
          />
        </PillTabsContent>

        {/* Analytics Tab */}
        <PillTabsContent value="analytics" activeTab={activeTab}>
          <AnalyticsSection />
        </PillTabsContent>
      </div>

      {/* Additional Modals */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={{
          searchTerm: '',
          category: '',
          difficulty: '',
          subcategory: '',
          part_of_speech: ''
        }}
        onChange={() => {}}
        onReset={() => {}}
        categories={categories}
        difficulties={difficulties}
        partsOfSpeech={partsOfSpeech}
        subcategories={[]}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        isLoading={isExporting}
      />
      
      </div>
    </ToastProvider>
  );
};

export default Dashboard;
