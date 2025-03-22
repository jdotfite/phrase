'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/services/supabase';
import { useTheme } from 'next-themes';
import './styles/dashboard.css';

// Import chart components
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/features/charts';
import WordCreatorModal from '@/features/phrases/WordCreatorModal';
import ReviewModal from '@/features/phrases/ReviewModal';

// Components
import { PhrasesTable } from '@/features/phrases/phrasesTable';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import ExportModal from '@/features/dashboard/components/ExportModal';
import FilterModal from '@/features/filters/FilterModal';
import { FilterProvider } from '@/features/phrases/stores/filterContext';
import { StatsCards } from '@/features/dashboard/components/StatsCards';
import AnalyticsSection from '@/features/dashboard/components/AnalyticsSection';

// Recharts components
import {
  RadialBarChart, RadialBar, BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell, PolarGrid, PolarRadiusAxis
} from 'recharts';

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PillTabs, PillTabsContent } from '@/components/ui/pill-tabs'; 

// Icons
import {
  FileText, Users, Award, Moon, Sun, Filter, TrendingUp,
  BarChart2, PieChartIcon, FileDownIcon, X
} from "lucide-react";

// Hooks
import { useStats } from '@/features/data/hooks/useStats';
import { usePhrases } from '@/features/data/hooks/usePhrases';
import { usePhraseMetadata } from '@/features/data/hooks/usePhraseMetadata';
import { useReviewers } from '@/features/data/hooks/useReviewers';
import { useDeletePhrase } from '@/features/phrases/hooks/useDeletePhrase';

// Types
import type { Reviewer, Phrase } from '@/types/types';

const Dashboard = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [showWordCreatorModal, setShowWordCreatorModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPhraseId, setSelectedPhraseId] = useState<number | null>(null); 

  // Added this state for tracking newly added phrase IDs
  const [newIds, setNewIds] = useState<number[]>([]);
  
  // Initialize the delete phrase mutation
  const deletePhraseMutation = useDeletePhrase();
  
  // ======= REVIEWER AUTH STATE =======
  // State for current logged-in reviewer
  const [currentReviewer, setCurrentReviewer] = useState<Reviewer | null>(null);
  const handleAddWordsClick = () => {
    setShowWordCreatorModal(true);
  };
  
  const handleReviewWordsClick = () => {
    setShowReviewModal(true);
  };
  
  const handleWordAdded = (id: number) => {
    // Track newly added phrase ID
    setNewIds(prev => [...prev, id]);
    // Refresh data after a word is added
    fetchPhrases();
  };
  
  // Add handlers for edit and delete
  const handleEdit = (id: number) => {
    setSelectedPhraseId(id);
    setShowReviewModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this phrase?')) {
      deletePhraseMutation.mutate(id, {
        onSuccess: () => {
          // Refresh the phrases list after deletion
          fetchPhrases();
        }
      });
    }
  };
  
  // ======= DASHBOARD UI STATE =======
  const [activeTab, setActiveTab] = useState('phrases');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [phrasesOverTime, setPhrasesOverTime] = useState<any[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // ======= DATA HOOKS =======
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
    fetchPhrases,
  } = usePhrases();
  const { categories, difficulties, partsOfSpeech } = usePhraseMetadata();

  // Find reviewer index for the avatar
  const reviewerIndex = currentReviewer 
    ? reviewers?.findIndex(r => r.id === currentReviewer.id) ?? 0
    : 0;

  // ======= TABLE STATE =======
  const [tableState, setTableState] = useState<TableState>({
    sortConfig: {
      key: '',
      direction: 'asc'
    },
    pagination: {
      currentPage: 1,
      rowsPerPage: 10,  // Set default to 10
      totalItems: 0,
      totalPages: 1
    },
    filters: {
      searchTerm: '',
      category: '',
      difficulty: '',
      subcategory: '',
      part_of_speech: ''
    }
  });

 
  
  // ======= CHART DATA =======
  // Data for the radial chart
  const wordsAddedData = [
    { name: "Words Added", value: 45, fill: "hsl(var(--primary))" },
    { name: "Goal", value: 100, fill: "hsl(var(--muted))" },
  ];

  // Chart configuration
  const chartConfig = {
    phrases: { label: 'Phrases', color: 'var(--chart-1)' },
    reviews: { label: 'Reviews', color: 'var(--chart-2)' },
    additions: { label: 'Additions', color: 'var(--chart-3)' },
    edits: { label: 'Edits', color: 'var(--chart-4)' }
  };

  // ======= AUTH HANDLERS =======
  /**
   * Handle successful login
   */
  const handleLoginSuccess = (reviewer: Reviewer) => {
    setCurrentReviewer(reviewer);
    localStorage.setItem('currentReviewer', JSON.stringify(reviewer));
    console.log('Reviewer logged in:', reviewer.name);
  };
  
  /**
   * Handle logout
   */
  const handleLogout = () => {
    setCurrentReviewer(null);
    localStorage.removeItem('currentReviewer');
  };

  // ======= EFFECTS =======
  
  // Load reviewer from localStorage on initial render
  useEffect(() => {
    const savedReviewer = localStorage.getItem('currentReviewer');
    if (savedReviewer) {
      try {
        setCurrentReviewer(JSON.parse(savedReviewer));
      } catch (e) {
        console.error("Error parsing saved reviewer:", e);
        localStorage.removeItem('currentReviewer');
      }
    }
  }, []);

  // Hide any debug JSON output on load
  useEffect(() => {
    const preElements = document.querySelectorAll('pre');
    preElements.forEach(el => {
      if (
        el.textContent &&
        el.textContent.includes('"dataLength":') &&
        el.textContent.includes('"totalItems":')
      ) {
        el.style.display = 'none';
      }
    });
  }, []);

  // Sync Table State with hook state
  useEffect(() => {
    if (phrases && pagination) {
      const totalItems = pagination.totalItems || phrases.length || 0;
      const rowsPerPage = pagination.rowsPerPage || 10; // Get rowsPerPage from pagination
      const totalPages = Math.ceil(totalItems / rowsPerPage);
      
      setTableState(prev => ({
        ...prev,
        sortConfig,
        pagination: {
          ...pagination,
          rowsPerPage,
          totalItems,
          totalPages,
          currentPage: Math.min(pagination.currentPage, totalPages || 1)
        },
        filters,
      }));
    }
  }, [phrases, pagination, sortConfig, filters]);



  // Fetch subcategories when the category filter changes
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
            setSubcategories(subcategoryData.map(sub => sub.name));
          }
        }
      } catch (err) {
        console.error('Error fetching subcategories:', err);
      }
    };
    fetchSubcategories();
  }, [filters.category]);

  // Fetch phrases over time
  useEffect(() => {
    fetchPhrasesOverTime();
  }, []);

  // ======= DATA FUNCTIONS =======
  /**
   * Fetch phrases over time data for chart
   */
  const fetchPhrasesOverTime = async () => {
    try {
      const { data, error } = await supabase
        .from('phrases')
        .select('created_at')
        .order('created_at');
      if (error) {
        console.error('Error fetching phrase timestamps:', error);
        setPhrasesOverTime(getErrorStateData());
        return;
      }
      if (data && data.length > 0) {
        const monthlyData = processTimestampData(data);
        setPhrasesOverTime(monthlyData);
      } else {
        setPhrasesOverTime(getErrorStateData());
      }
    } catch (err) {
      console.error('Error fetching phrase timestamps:', err);
      setPhrasesOverTime(getErrorStateData());
    }
  };

  /**
   * Process timestamp data for charts
   */
  const processTimestampData = (data: any[]) => {
    const monthCounts: Record<string, any> = {};
    data.forEach(item => {
      if (!item.created_at) return;
      const date = new Date(item.created_at);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      if (!monthCounts[key]) {
        monthCounts[key] = { month, year, count: 0, fullDate: date };
      }
      monthCounts[key].count++;
    });
    return Object.values(monthCounts)
      .sort((a, b) => a.fullDate - b.fullDate)
      .map(item => ({ month: item.month, year: item.year, phrases: item.count }))
      .slice(-6);
  };

  /**
   * Get fallback data for charts when error occurs
   */
  const getErrorStateData = () => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(month => ({
      month,
      year: new Date().getFullYear(),
      phrases: null
    }));
  };
  /**
   * Handle table state changes
   */
  const handleTableStateChange = (updates: Partial<TableState>) => {
    // Update local state first
    setTableState(prev => {
      const newState = { ...prev };
      
      if (updates.filters) {
        newState.filters = { ...prev.filters, ...updates.filters };
      }
      
      if (updates.sortConfig) {
        newState.sortConfig = { ...prev.sortConfig, ...updates.sortConfig };
      }
      
      if (updates.pagination) {
        // Make sure all pagination properties are properly set
        newState.pagination = { ...prev.pagination, ...updates.pagination };
      }
      
      return newState;
    });
    
    // Then immediately propagate changes to the hooks
    if (updates.filters) {
      // Apply each filter individually to ensure all are updated
      Object.entries(updates.filters).forEach(([key, value]) => {
        if (value !== undefined) { // Only update if value is provided
          handleFilterChange(key, value || '');
        }
      });
    }
    
    if (updates.sortConfig && updates.sortConfig.key) {
      handleSort(updates.sortConfig.key as keyof Phrase);
    }
    
    if (updates.pagination) {
      // Note: Order matters here! First update rows per page, then page number
      if (updates.pagination.rowsPerPage) {
        handleRowsPerPageChange(updates.pagination.rowsPerPage);
      }
      
      if (updates.pagination.currentPage) {
        handlePageChange(updates.pagination.currentPage);
      }
    }
  };

  /**
   * Generate monthly activity data for charts
   */
  const generateMonthlyActivityData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      name: month,
      reviews: Math.floor(Math.random() * 100) + 50,
      additions: Math.floor(Math.random() * 40) + 10,
      edits: Math.floor(Math.random() * 30) + 5,
    }));
  };

  const monthlyActivityData = generateMonthlyActivityData();

  /**
   * Generate category data for charts
   */
  const generateCategoryData = () => {
    if (categories && categories.length > 0) {
      return [
        { name: 'Animals & Plants', value: 30 },
        { name: 'Art & Design', value: 22 },
        { name: 'Education & Learning', value: 13 },
        { name: 'Celebrations & Traditions', value: 16 },
        { name: 'Business & Careers', value: 19 },
      ];
    }
    return [
      { name: 'Animals & Plants', value: 30 },
      { name: 'Art & Design', value: 22 },
      { name: 'Education & Learning', value: 13 },
      { name: 'Celebrations & Traditions', value: 16 },
      { name: 'Business & Careers', value: 19 },
    ];
  };

  const categoryData = generateCategoryData();

  /**
   * Handle exporting data
   */
  const handleExport = async (options: any) => {
    try {
      setIsExporting(true);
      const { data: phrases, error: phrasesError } = await supabase
        .from('phrases')
        .select(`
          id,
          phrase,
          part_of_speech,
          hint,
          category_id,
          subcategory_id,
          difficulty,
          categories:category_id(name),
          subcategories:subcategory_id(name)
        `);
      if (phrasesError) throw phrasesError;
      const { data: phraseTags, error: tagsError } = await supabase
        .from('phrase_tags')
        .select(`
          phrase_id,
          tags:tag_id(tag)
        `);
      if (tagsError) throw tagsError;
      
      // Process data
      const tagsByPhraseId: Record<string, string[]> = {};
      phraseTags.forEach((item: any) => {
        if (!tagsByPhraseId[item.phrase_id]) {
          tagsByPhraseId[item.phrase_id] = [];
        }
        tagsByPhraseId[item.phrase_id].push(item.tags.tag);
      });
      
      const categorizedPhrases: Record<string, any[]> = {};
      phrases.forEach((phrase: any) => {
        const categoryName = phrase.categories ? phrase.categories.name : 'Uncategorized';
        if (!categorizedPhrases[categoryName]) {
          categorizedPhrases[categoryName] = [];
        }
        categorizedPhrases[categoryName].push({
          text: phrase.phrase,
          pos: phrase.part_of_speech,
          hint: phrase.hint || '',
          difficulty: phrase.difficulty || 1,
          subcategory: phrase.subcategories ? phrase.subcategories.name : null,
          tags: tagsByPhraseId[phrase.id] || [],
        });
      });
      
      const esp32Data: Record<string, any[]> = {};
      Object.keys(categorizedPhrases).forEach(cat => {
        if (options.optimizeForESP32) {
          esp32Data[cat] = categorizedPhrases[cat].map(p => ({
            t: p.text,
            h: p.hint || '',
            d: p.difficulty || 1
          }));
        } else {
          esp32Data[cat] = categorizedPhrases[cat];
        }
      });
      
      const headerContent = options.exportHeader ? generateArduinoHeader(esp32Data) : '';
      setIsExporting(false);
      return { jsonData: esp32Data, headerContent };
    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
      return null;
    }
  };

  /**
   * Generate Arduino header file
   */
  const generateArduinoHeader = (data: Record<string, any[]>) => {
    let headerContent = `// Auto-generated phrases header file
#ifndef PHRASES_H
#define PHRASES_H

#include <Arduino.h>

struct Phrase {
  const char* text;
  const char* hint;
  uint8_t difficulty;
};
`;
    Object.keys(data).forEach(category => {
      const categoryVar = category.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const phrases = data[category];
      headerContent += `// ${category} phrases
constexpr Phrase ${categoryVar}_phrases[] PROGMEM = {
`;
      phrases.forEach(phrase => {
        const text = phrase.t || phrase.text;
        const hint = phrase.h || phrase.hint || '';
        const difficulty = phrase.d || phrase.difficulty || 1;
        headerContent += `  {"${escapeString(text)}", "${escapeString(hint)}", ${difficulty}},
`;
      });
      headerContent += `};

constexpr size_t ${categoryVar}_count = ${phrases.length};

`;
    });
    headerContent += `// Category index
struct PhraseCategory {
  const char* name;
  const Phrase* phrases;
  size_t count;
};

constexpr PhraseCategory phrase_categories[] PROGMEM = {
`;
    Object.keys(data).forEach(category => {
      const categoryVar = category.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      headerContent += `  {"${escapeString(category)}", ${categoryVar}_phrases, ${categoryVar}_count},
`;
    });
    headerContent += `};

constexpr size_t category_count = ${Object.keys(data).length};

#endif // PHRASES_H
`;
    return headerContent;
  };

  /**
   * Escape strings for C++ code
   */
  const escapeString = (str: string) => {
    if (!str) return "";
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  };

  // ======= RENDER =======
  return (
    <div className="container mx-auto py-6 space-y-6">
    {/* Header with login */}
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
    
    {/* Add the StatsCards component here */}
    <StatsCards />

      <div className="mb-6">
        {/* Word Creator Modal */}
{currentReviewer && (
  <WordCreatorModal
    isOpen={showWordCreatorModal}
    onClose={() => setShowWordCreatorModal(false)}
    reviewer={currentReviewer}
    onWordAdded={handleWordAdded}
  />
)}

{/* Review Modal */}
{currentReviewer && (
  <ReviewModal
  isOpen={showReviewModal}
  onClose={() => {
    setShowReviewModal(false);
    setSelectedPhraseId(null);
  }}
  reviewer={currentReviewer}
  selectedPhraseId={selectedPhraseId}
/>
)}
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
  <div className="flex flex-col space-y-4">
    {/* Wrap your existing PhrasesTable with FilterProvider */}
    <FilterProvider>
      <PhrasesTable
        phrases={phrases}
        loading={phrasesLoading}
        tableState={tableState}
        onTableStateChange={handleTableStateChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        newIds={newIds}
      />
    </FilterProvider>
  </div>
</PillTabsContent>

        {/* Analytics Tab */}
        <PillTabsContent value="analytics" activeTab={activeTab}>
          <AnalyticsSection />
        </PillTabsContent>
          </div>

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

export default Dashboard;