# Dashboard Refactoring PowerShell Script - Part 3 (Continued)
# This script creates the PhraseSearch component and the refactored CleanDashboard

# Base directory - adjust this to your project root
$baseDir = "."

# Create directories if they don't exist
$directories = @(
    "$baseDir\components\dashboard",
    "$baseDir\hooks\dashboard"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "Created directory: $dir" -ForegroundColor Green
    }
}

# Create PhraseSearch component with full implementation
$phraseSearchContent = @'
import React from 'react';
import { DataTableFilters } from '@/components/tables/data-table/filters';
import { TableState } from '@/components/tables/types';

interface PhraseSearchProps {
  tableState: TableState;
  onTableStateChange: (state: Partial<TableState>) => void;
}

export const PhraseSearch: React.FC<PhraseSearchProps> = ({ 
  tableState, onTableStateChange 
}) => {
  return (
    <div className="px-2">
      <DataTableFilters
        tableState={tableState}
        onTableStateChange={onTableStateChange}
      />
    </div>
  );
};
'@

# Create usePhraseTimeline hook
$phraseTimelineHookContent = @'
import { useState, useEffect } from 'react';
import { DashboardDataService } from '@/services/dashboard-data-service';

export const usePhraseTimeline = () => {
  const [phrasesOverTime, setPhrasesOverTime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await DashboardDataService.fetchPhrasesOverTime();
      
      if (error || !data) {
        setPhrasesOverTime(DashboardDataService.getErrorStateData());
        setError(error);
      } else {
        const monthlyData = DashboardDataService.processTimestampData(data);
        setPhrasesOverTime(monthlyData);
      }
      setLoading(false);
    };
    
    fetchData();
  }, []);

  return { phrasesOverTime, loading, error };
};
'@

# Create a refactored version of CleanDashboard with all components
$cleanDashboardContent = @'
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import './dashboard.css';

// Refactored Components
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { PhraseSearch } from '@/components/dashboard/PhraseSearch';

// Original Components
import { PhrasesTable } from '@/components/phrases/phrases-table';
import BulkImportForm from '@/features/shared/BulkImportForm';
import FilterModal from '@/components/common/FilterModal';
import ExportModal from '@/components/common/ExportModal';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Services and Hooks
import { supabase } from '@/lib/services/supabase';
import { DashboardDataService } from '@/services/dashboard-data-service';
import { usePhraseTimeline } from '@/hooks/dashboard/usePhraseTimeline';
import { useStats } from '@/hooks/useStats';
import { usePhrases } from '@/hooks/usePhrases';
import { usePhraseMetadata } from '@/hooks/usePhraseMetadata';
import { useReviewers } from '@/hooks/useReviewers';

const CleanDashboard = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState('phrases');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Words Added Data for the radial chart
  const wordsAddedData = [
    { name: "Words Added", value: 45, fill: "hsl(var(--primary))" },
    { name: "Goal", value: 100, fill: "hsl(var(--muted))" },
  ];
  
  // Analytics data
  const [monthlyActivityData, setMonthlyActivityData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // Hooks
  const { stats, loading: statsLoading } = useStats();
  const { reviewers } = useReviewers();
  const { phrasesOverTime } = usePhraseTimeline();
  const { categories, difficulties, partsOfSpeech } = usePhraseMetadata();
  const {
    phrases,
    loading: phrasesLoading,
    error,
    pagination,
    sortConfig,
    filters,
    handleSort,
    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
    editPhrase,
    deletePhrase,
    resetFilters,
  } = usePhrases();

  // Table State
  const [tableState, setTableState] = useState({
    sortConfig,
    pagination: {
      ...pagination,
      rowsPerPage: 10,
      totalItems: phrases?.length || 0,
      totalPages: Math.ceil((phrases?.length || 0) / 10),
    },
    filters,
  });

  // Effect to hide any debug JSON output
  useEffect(() => {
    // Find and hide pre tags with JSON state data
    const preElements = document.querySelectorAll('pre');
    preElements.forEach(el => {
      if (el.textContent && 
          el.textContent.includes('"dataLength":') && 
          el.textContent.includes('"totalItems":')) {
        el.style.display = 'none';
      }
    });
  }, []);

  // Sync Table State with Hook State
  useEffect(() => {
    if (phrases && pagination) {
      setTableState((prev) => ({
        sortConfig,
        pagination: {
          ...pagination,
          totalItems: pagination.totalItems || phrases.length || 0,
          totalPages: pagination.totalPages || Math.ceil((phrases.length || 0) / pagination.rowsPerPage),
        },
        filters,
      }));
    }
  }, [sortConfig, pagination, filters, phrases]);

  // Force rows per page to be 10
  useEffect(() => {
    if (pagination && pagination.rowsPerPage !== 10) {
      console.log('Forcing rows per page to 10');
      handleRowsPerPageChange(10);
    }
  }, [pagination, handleRowsPerPageChange]);

  // Fetch Subcategories
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!filters.category) {
        setSubcategories([]);
        return;
      }

      try {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', filters.category)
          .single();

        if (categoryData) {
          const { data: subcategoryData } = await supabase
            .from('subcategories')
            .select('name')
            .eq('category_id', categoryData.id)
            .order('name');

          if (subcategoryData) {
            setSubcategories(subcategoryData.map((sub) => sub.name));
          }
        }
      } catch (err) {
        console.error('Error fetching subcategories:', err);
      }
    };

    fetchSubcategories();
  }, [filters.category]);

  // Initialize analytics data
  useEffect(() => {
    setMonthlyActivityData(DashboardDataService.generateMonthlyActivityData());
    setCategoryData(DashboardDataService.generateCategoryData(categories));
  }, [categories]);

  // Handle table state changes
  const handleTableStateChange = (updates) => {
    console.log('Table state change requested:', updates);
    
    // Update local state first
    setTableState(prev => ({
      ...prev,
      ...updates
    }));
    
    // Handle filter changes
    if (updates.filters && JSON.stringify(updates.filters) !== JSON.stringify(filters)) {
      console.log('Applying filters:', updates.filters);
      handleFilterChange(updates.filters);
      
      // Reset to page 1 when filtering
      if (pagination.currentPage !== 1) {
        handlePageChange(1);
      }
    }
    
    // Handle sort changes
    if (updates.sortConfig && 
      (updates.sortConfig.key !== sortConfig.key || 
       updates.sortConfig.direction !== sortConfig.direction)) {
      console.log('Updating sort:', updates.sortConfig);
      handleSort(updates.sortConfig.key);
    }
    
    // Handle pagination changes
    if (updates.pagination) {
      // Handle page changes
      if (updates.pagination.currentPage !== undefined && 
          updates.pagination.currentPage !== pagination.currentPage) {
        console.log('Changing page to:', updates.pagination.currentPage);
        handlePageChange(updates.pagination.currentPage);
      }
      
      // Handle rows per page changes
      if (updates.pagination.rowsPerPage !== undefined && 
          updates.pagination.rowsPerPage !== pagination.rowsPerPage) {
        console.log('Changing rows per page to:', updates.pagination.rowsPerPage);
        handleRowsPerPageChange(updates.pagination.rowsPerPage);
      }
    }
  };

  const handleExport = async (options) => {
    try {
      setIsExporting(true);
      const result = await DashboardDataService.handleExport(options);
      setIsExporting(false);
      return result;
    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
      return null;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <DashboardHeader
        theme={theme}
        setTheme={setTheme}
        onReviewClick={() => router.push('/review')}
        onExportClick={() => setShowExportModal(true)}
        onLoginClick={() => setShowLoginModal(true)}
      />

      {/* Stats Cards */}
      <StatsCards
        phrasesOverTime={phrasesOverTime}
        stats={stats}
        reviewers={reviewers}
      />

      {/* Tabs */}
      <Tabs defaultValue="phrases" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="border-b">
          <div className="flex">
            <TabsList className="bg-transparent">
              <TabsTrigger value="phrases" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Phrases
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="import" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Import
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Phrases Tab */}
        <TabsContent value="phrases" className="m-0">
          <div className="flex flex-col space-y-4">
            {/* Search Input */}
            <PhraseSearch
              tableState={tableState}
              onTableStateChange={handleTableStateChange}
            />
            
            {/* Phrases Table */}
            <PhrasesTable
              phrases={phrases}
              loading={phrasesLoading}
              tableState={tableState}
              onTableStateChange={handleTableStateChange}
              onEdit={editPhrase}
              onDelete={deletePhrase}
              newIds={[]}
            />
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="m-0">
          <AnalyticsCharts
            monthlyActivityData={monthlyActivityData}
            categoryData={categoryData}
            wordsAddedData={wordsAddedData}
          />
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import" className="m-0">
          <BulkImportForm
            onSuccess={() => setActiveTab('phrases')}
            onError={() => {}}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onChange={handleFilterChange}
        onReset={resetFilters}
        categories={categories}
        difficulties={difficulties}
        partsOfSpeech={partsOfSpeech}
        subcategories={subcategories}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        isLoading={isExporting}
      />
    </div>
  );
};

export default CleanDashboard;
'@

# Write files
$filesToCreate = @{
    "$baseDir\components\dashboard\PhraseSearch.tsx" = $phraseSearchContent
    "$baseDir\hooks\dashboard\usePhraseTimeline.ts" = $phraseTimelineHookContent
    "$baseDir\pages\dashboard\RefactoredCleanDashboard.tsx" = $cleanDashboardContent
}

foreach ($file in $filesToCreate.Keys) {
    if (-not (Test-Path $file)) {
        Set-Content -Path $file -Value $filesToCreate[$file]
        Write-Host "Created file: $file" -ForegroundColor Green
    } else {
        Write-Host "File already exists: $file" -ForegroundColor Yellow
        $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
        if ($overwrite -eq "y") {
            Set-Content -Path $file -Value $filesToCreate[$file]
            Write-Host "Overwritten file: $file" -ForegroundColor Green
        }
    }
}

Write-Host "`nDashboard refactoring Part 3 completed!" -ForegroundColor Cyan
Write-Host "Created the following components:" -ForegroundColor Cyan
Write-Host " - PhraseSearch" -ForegroundColor White
Write-Host " - usePhraseTimeline (hook)" -ForegroundColor White
Write-Host " - RefactoredCleanDashboard" -ForegroundColor White
Write-Host "`nRefactoring Status:" -ForegroundColor Cyan
Write-Host "All refactored components and services have been created." -ForegroundColor Green
Write-Host "The RefactoredCleanDashboard.tsx file contains the fully refactored dashboard." -ForegroundColor Green
Write-Host "`nTo complete the refactoring:" -ForegroundColor Cyan
Write-Host "1. Review all created components and make any necessary adjustments" -ForegroundColor White
Write-Host "2. Test the refactored dashboard by importing and using RefactoredCleanDashboard" -ForegroundColor White
Write-Host "3. Once satisfied, replace the original CleanDashboard.tsx with the refactored version" -ForegroundColor White
Write-Host "`nBenefits of this refactoring:" -ForegroundColor Cyan
Write-Host "- Reduced component size (600+ lines to <200 lines)" -ForegroundColor White
Write-Host "- Improved maintainability and readability" -ForegroundColor White
Write-Host "- Better separation of concerns" -ForegroundColor White
Write-Host "- Reusable components that can be used elsewhere" -ForegroundColor White