'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/services/supabase';
import { useTheme } from 'next-themes';
import { saveAs } from 'file-saver';
import './styles/dashboard.css';

// Import chart components
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/features/charts';

// Components
import { PhrasesTable } from '@/features/phrases/PhrasesTable';
import { DataTableFilters } from '@/features/filters/DataTableFilters';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import ExportModal from '@/features/dashboard/components/ExportModal';
import BulkImportForm from '@/features/import/BulkImportForm';
import FilterModal from '@/features/filters/FilterModal';

// Recharts components
import {
  RadialBarChart, RadialBar, BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Types
import type { Reviewer } from '@/types/types';

const Dashboard = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // ======= REVIEWER AUTH STATE =======
  // State for current logged-in reviewer
  const [currentReviewer, setCurrentReviewer] = useState<Reviewer | null>(null);
  
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
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border rounded-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Phrases</CardTitle>
            <CardDescription>Growth trend over time</CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="h-[120px]">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={phrasesOverTime} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid stroke="#3F3F46" strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fill: 'white', fontSize: 10 }} axisLine={{ stroke: '#3F3F46' }} tickLine={{ stroke: '#3F3F46' }} />
                    <YAxis tick={{ fill: 'white', fontSize: 10 }} axisLine={{ stroke: '#3F3F46' }} tickLine={{ stroke: '#3F3F46' }} />
                    <ChartTooltip content={props => <ChartTooltipContent {...props} config={chartConfig} />} />
                    <Line
                      type="monotone"
                      dataKey="phrases"
                      stroke="var(--color-phrases)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--color-phrases)', r: 4 }}
                      activeDot={{ r: 6, fill: 'var(--color-phrases)' }}
                      isAnimationActive={false}
                    />
                    {phrasesOverTime[0]?.phrases === null && (
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#FF6B6B"
                        fontSize="14px"
                        fontWeight="bold"
                      >
                        No Data Available
                      </text>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-0">
                <div className="flex items-center gap-1 font-medium text-lg">
                  {stats?.total || 1392} total phrases <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  Last 6 months
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card className="border rounded-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Difficulty Distribution</CardTitle>
            <CardDescription>Distribution by difficulty level</CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Easy', value: stats?.difficultyBreakdown?.easy || 30 },
                      { name: 'Medium', value: stats?.difficultyBreakdown?.medium || 20 },
                      { name: 'Hard', value: stats?.difficultyBreakdown?.hard || 10 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    <Cell fill="hsl(var(--primary) / 60%)" />
                    <Cell fill="hsl(var(--primary) / 80%)" />
                    <Cell fill="hsl(var(--primary))" />
                  </Pie>
                  <ChartTooltip content={props => <ChartTooltipContent {...props} config={chartConfig} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="pt-3">
            <div className="flex w-full items-center gap-4 text-sm justify-around">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary/60"></div>
                <span className="text-xs">Easy</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary/80"></div>
                <span className="text-xs">Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs">Hard</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card className="border rounded-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Top Reviewers</CardTitle>
            <CardDescription>Most active contributors</CardDescription>
          </CardHeader>
          <CardContent className="p-2 pb-4">
            <div className="space-y-2 mt-2">
              {reviewers?.slice(0, 3).map((reviewer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                      {reviewer.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{reviewer.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-bold">
                      {reviewer.total_reviews || (index === 0 ? 4 : index === 1 ? 1 : 0)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">reviews</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
  <PillTabs
    tabs={[
      { value: 'phrases', label: 'Phrases' },
      { value: 'analytics', label: 'Analytics' },
      { value: 'import', label: 'Import' }
    ]}
    activeTab={activeTab}
    onTabChange={setActiveTab}
    className="py-3 border-dashed border-y"
  />

  {/* Phrases Tab */}
  <PillTabsContent value="phrases" activeTab={activeTab}>
    <div className="flex flex-col space-y-4">
      <PhrasesTable
        phrases={phrases}
        loading={phrasesLoading}
        tableState={tableState}
        onTableStateChange={handleTableStateChange}
        onEdit={editPhrase}
        onDelete={deletePhrase}
        newIds={[]}
        onShowFilters={() => setShowFilterModal(true)}
      />
    </div>
  </PillTabsContent>

        {/* Analytics Tab */}
        <PillTabsContent value="analytics" activeTab={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Activity */}
            <Card className="border rounded-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monthly Activity</CardTitle>
                <CardDescription>Reviews, additions and edits over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyActivityData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid vertical={false} stroke="hsl(var(--muted-foreground) / 20%)" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fill: "hsl(var(--foreground))" }} tickLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }} axisLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }} />
                      <YAxis tick={{ fill: "hsl(var(--foreground))" }} tickLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }} axisLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }} />
                      <ChartTooltip 
                        content={props => 
                          <ChartTooltipContent 
                            {...props} 
                            config={chartConfig}
                          />
                        }
                      />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <Bar dataKey="reviews" fill="hsl(var(--primary) / 80%)" />
                      <Bar dataKey="additions" fill="hsl(var(--primary) / 60%)" />
                      <Bar dataKey="edits" fill="hsl(var(--primary) / 40%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="border rounded-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Category Distribution</CardTitle>
                <CardDescription>Phrases by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="hsl(var(--primary))" />
                        <Cell fill="hsl(var(--primary) / 90%)" />
                        <Cell fill="hsl(var(--primary) / 80%)" />
                        <Cell fill="hsl(var(--primary) / 70%)" />
                        <Cell fill="hsl(var(--primary) / 60%)" />
                      </Pie>
                      <ChartTooltip 
                        content={props => 
                          <ChartTooltipContent 
                            {...props} 
                            config={chartConfig}
                          />
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Reviewers Performance */}
            <Card className="border rounded-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Top Reviewers Performance</CardTitle>
                <CardDescription>Reviews and streaks by contributor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { name: "Kari", reviews: 120, streak: 14 },
                        { name: "Sarah", reviews: 85, streak: 7 },
                        { name: "Justin", reviews: 65, streak: 5 },
                        { name: "Alex", reviews: 45, streak: 3 },
                        { name: "Morgan", reviews: 30, streak: 2 }
                      ]}
                      margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 20%)" />
                      <XAxis
                        type="number"
                        tick={{ fill: "hsl(var(--foreground))" }}
                        tickLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }}
                        axisLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fill: "hsl(var(--foreground))" }}
                        tickLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }}
                        axisLine={{ stroke: "hsl(var(--muted-foreground) / 40%)" }}
                      />
                      <ChartTooltip 
                        content={props => 
                          <ChartTooltipContent 
                            {...props} 
                            config={chartConfig}
                          />
                        }
                      />
                      <Legend />
                      <Bar dataKey="reviews" fill="hsl(var(--primary) / 80%)" />
                      <Bar dataKey="streak" fill="hsl(var(--primary) / 40%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Words Added This Month */}
            <Card className="border rounded-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Words Added This Month</CardTitle>
                <CardDescription>Progress towards the goal of 100 words</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      data={wordsAddedData}
                      innerRadius="80%"
                      outerRadius="100%"
                      startAngle={180}
                      endAngle={0}
                    >
                      <PolarGrid stroke="hsl(var(--muted))" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                      <RadialBar
                        dataKey="value"
                        cornerRadius={10}
                        background
                        fill="hsl(var(--primary))"
                      />
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground text-2xl font-bold"
                      >
                        {wordsAddedData[0].value} / 100
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Goal: <span className="font-bold text-foreground">100 words</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Remaining: <span className="font-bold text-foreground">{100 - wordsAddedData[0].value}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
          </PillTabsContent>

        {/* Import Tab */}
        <PillTabsContent value="import" activeTab={activeTab}>
          <BulkImportForm onSuccess={() => setActiveTab('phrases')} onError={() => {}} />
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