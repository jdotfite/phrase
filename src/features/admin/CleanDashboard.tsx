'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/services/supabase';
import { useTheme } from 'next-themes';
import './dashboard.css';

// Refactored Components
import { StatsCards } from '@/components/dashboard/StatsCards';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardDataService } from '@/services/dashboard-data-service';

// Original Components
import { PhrasesTable } from '@/components/phrases/phrases-table';
import { DataTableFilters } from '@/components/tables/data-table/filters';
import BulkImportForm from '@/features/shared/BulkImportForm';
import FilterModal from '@/components/common/FilterModal';
import ExportModal from '@/components/common/ExportModal';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Hooks
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
  const [phrasesOverTime, setPhrasesOverTime] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Charts data
  const [monthlyActivityData, setMonthlyActivityData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [wordsAddedData] = useState([
    { name: "Words Added", value: 45, fill: "hsl(var(--primary))" },
    { name: "Goal", value: 100, fill: "hsl(var(--muted))" },
  ]);

  // Hooks
  const { stats, loading: statsLoading } = useStats();
  const { reviewers } = useReviewers();
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
  const { categories, difficulties, partsOfSpeech } = usePhraseMetadata();

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

  // Fetch phrases over time data
  useEffect(() => {
    fetchData();
  }, []);
  
  // Initialize analytics data
  useEffect(() => {
    setMonthlyActivityData(DashboardDataService.generateMonthlyActivityData());
    setCategoryData(DashboardDataService.generateCategoryData(categories));
  }, [categories]);

  // Fetch data for charts
  const fetchData = async () => {
    const { data, error } = await DashboardDataService.fetchPhrasesOverTime();
    
    if (error || !data) {
      setPhrasesOverTime(DashboardDataService.getErrorStateData());
      return;
    }
    
    const monthlyData = DashboardDataService.processTimestampData(data);
    setPhrasesOverTime(monthlyData);
  };

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

  // Handle export
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
            {/* Use existing DataTableFilters component for search */}
            <div className="px-2">
              <DataTableFilters
                tableState={tableState}
                onTableStateChange={handleTableStateChange}
              />
            </div>
            
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