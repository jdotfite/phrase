'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { saveAs } from 'file-saver';
import styles from '@/features/dashboard/styles/Dashboard.module.css';
import { cn } from "@/lib/utils";

// Services
import { supabase } from '@/lib/services/supabase';

// Feature Components - These should be moved to the features directory
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { StatsCards } from '@/features/dashboard/components/StatsCards';
import { AnalyticsCharts } from '@/features/dashboard/components/AnalyticsCharts';
import { PhraseSearch } from '@/features/dashboard/components/PhraseSearch';

// Components from other features - Consider moving these
import { PhrasesTable } from '@/features/phrases/components/PhrasesTable'; // Move from @/components/phrases/phrases-table
import { BulkImportForm } from '@/features/phrases/components/BulkImportForm'; // Move from @/components/shared/BulkImportForm
import { FilterModal } from '@/features/phrases/components/FilterModal'; // Move from @/components/common/FilterModal
import { ExportModal } from '@/features/dashboard/components/ExportModal'; // Move from @/components/common/ExportModal

// UI Components - These can stay in @/components/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';

// Data Table Components - These should be moved to @/components/ui/data-table
import { DataTableFilters } from '@/components/ui/data-table/filters'; // Move from @/components/tables/data-table/filters

// External Libraries - These are fine as is
import {
  RadialBarChart, RadialBar, BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Icons - These are fine as is
import {
  FileText, Users, Award, Moon, Sun, Filter, TrendingUp,
  BarChart2, PieChartIcon, FileDownIcon, X
} from "lucide-react";

// Hooks - Move these to appropriate locations
import { useStats } from '@/hooks/dashboard/useStats'; // Update from @/hooks/use-data/useStats
import { usePhrases } from '@/hooks/phrases/usePhrases'; // Update from @/hooks/use-data/usePhrases
import { usePhraseMetadata } from '@/hooks/phrases/usePhraseMetadata'; // Update from @/hooks/use-data/usePhraseMetadata
import { useReviewers } from '@/hooks/reviewers/useReviewers'; // Update from @/hooks/use-data/useReviewers

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

  // Words Added Data for the radial chart
  const wordsAddedData = [
    { name: "Words Added", value: 45, fill: "hsl(var(--primary))" },
    { name: "Goal", value: 100, fill: "hsl(var(--muted))" },
  ];

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
    fetchPhrasesOverTime();
  }, []);

  // Main function to fetch phrase timestamps
  const fetchPhrasesOverTime = async () => {
    try {
      // Now using the created_at column we added to the phrases table
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

  // Process timestamp data into monthly buckets
  const processTimestampData = (data) => {
    const monthCounts = {};

    data.forEach((item) => {
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

    // Convert to array, sort by date, and take the most recent 6 months
    return Object.values(monthCounts)
      .sort((a, b) => a.fullDate - b.fullDate)
      .map((item) => ({
        month: item.month,
        year: item.year,
        phrases: item.count,
      }))
      .slice(-6);
  };

  // Generate error state data when no data is available
  const getErrorStateData = () => {
    // Return a special data format that indicates an error condition
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => ({
      month,
      year: new Date().getFullYear(),
      phrases: null // Use null to indicate missing/error data
    }));
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

  // Generate monthly activity data
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

  // Generate category distribution data
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

  const handleExport = async (options) => {
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

      const tagsByPhraseId = {};
      phraseTags.forEach((item) => {
        if (!tagsByPhraseId[item.phrase_id]) {
          tagsByPhraseId[item.phrase_id] = [];
        }
        tagsByPhraseId[item.phrase_id].push(item.tags.tag);
      });

      const categorizedPhrases = {};
      phrases.forEach((phrase) => {
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

      const esp32Data = {};
      Object.keys(categorizedPhrases).forEach((cat) => {
        if (options.optimizeForESP32) {
          // Optimized format for ESP32
          esp32Data[cat] = categorizedPhrases[cat].map(p => ({
            t: p.text,                    // text (shortened property name)
            h: p.hint || '',              // hint (shortened property name)
            d: p.difficulty || 1          // difficulty (shortened property name)
          }));
        } else {
          // Full format
          esp32Data[cat] = categorizedPhrases[cat];
        }
      });

      const headerContent = options.exportHeader ? generateArduinoHeader(esp32Data) : '';

      setIsExporting(false);
      return {
        jsonData: esp32Data,
        headerContent,
      };
    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
      return null;
    }
  };

  const generateArduinoHeader = (data) => {
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

    Object.keys(data).forEach((category) => {
      const categoryVar = category.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const phrases = data[category];

      headerContent += `// ${category} phrases\n`;
      headerContent += `constexpr Phrase ${categoryVar}_phrases[] PROGMEM = {\n`;

      phrases.forEach((phrase) => {
        const text = phrase.t || phrase.text;
        const hint = phrase.h || phrase.hint || '';
        const difficulty = phrase.d || phrase.difficulty || 1;

        headerContent += `  {"${escapeString(text)}", "${escapeString(hint)}", ${difficulty}},\n`;
      });

      headerContent += `};\n\n`;
      headerContent += `constexpr size_t ${categoryVar}_count = ${phrases.length};\n\n`;
    });

    headerContent += `// Category index\n`;
    headerContent += `struct PhraseCategory {\n`;
    headerContent += `  const char* name;\n`;
    headerContent += `  const Phrase* phrases;\n`;
    headerContent += `  size_t count;\n`;
    headerContent += `};\n\n`;

    headerContent += `constexpr PhraseCategory phrase_categories[] PROGMEM = {\n`;
    Object.keys(data).forEach((category) => {
      const categoryVar = category.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      headerContent += `  {"${escapeString(category)}", ${categoryVar}_phrases, ${categoryVar}_count},\n`;
    });
    headerContent += `};\n\n`;

    headerContent += `constexpr size_t category_count = ${Object.keys(data).length};\n\n`;
    headerContent += `#endif // PHRASES_H\n`;

    return headerContent;
  };

  const escapeString = (str) => {
    if (!str) return "";
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
  };

  // Render
  return (
    <div className={cn(styles.container, "mx-auto py-6 space-y-6")}>
      {/* Header */}
      <DashboardHeader 
  theme={theme}
  setTheme={setTheme}
  onReviewClick={() => router.push('/review')}
  onExportClick={() => setShowExportModal(true)}
  onLoginClick={() => setShowLoginModal(true)}
/>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Phrases Chart */}
        <Card className="border rounded-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Phrases</CardTitle>
            <CardDescription>Growth trend over time</CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={phrasesOverTime} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid stroke="#3F3F46" strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fill: 'white', fontSize: 10 }} axisLine={{ stroke: '#3F3F46' }} tickLine={{ stroke: '#3F3F46' }} />
                  <YAxis tick={{ fill: 'white', fontSize: 10 }} axisLine={{ stroke: '#3F3F46' }} tickLine={{ stroke: '#3F3F46' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: 'white', fontSize: '12px' }} 
                    labelStyle={{ fontWeight: 'bold' }}
                    formatter={(value) => value === null ? 'N/A' : value} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="phrases" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8', r: 4 }}
                    activeDot={{ r: 6, fill: '#8884d8' }}
                    isAnimationActive={false}
                  />
                  
                  {/* Add text overlay when data is null/error state */}
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

        {/* Difficulty Radar Chart */}
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
                    <Cell fill="#D4D4D8" />
                    <Cell fill="#A1A1AA" />
                    <Cell fill="#71717A" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: 'white', borderRadius: '0.5rem', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="pt-3">
            <div className="flex w-full items-center gap-4 text-sm justify-around">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#D4D4D8" }}></div>
                <span className="text-xs">Easy</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#A1A1AA" }}></div>
                <span className="text-xs">Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#71717A" }}></div>
                <span className="text-xs">Hard</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Top Reviewers */}
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
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs">
                      {reviewer.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{reviewer.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-bold">{reviewer.total_reviews || index === 0 ? 4 : index === 1 ? 1 : 0}</span>
                    <span className="text-xs text-muted-foreground ml-1">reviews</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
    {/* PhrasesTable - No separate search input above the table */}
    <PhrasesTable
  phrases={phrases}
  loading={phrasesLoading}
  tableState={tableState}
  onTableStateChange={handleTableStateChange}
  onEdit={editPhrase}
  onDelete={deletePhrase}
  newIds={[]}
  onShowFilters={() => setShowFilterModal(true)}
  animateFlashClass={styles.animateFlash} // Pass the CSS module class
/>
  </div>
</TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="m-0">
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
                      <CartesianGrid vertical={false} stroke="#3F3F46" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fill: "white" }} tickLine={{ stroke: "#3F3F46" }} axisLine={{ stroke: "#3F3F46" }} />
                      <YAxis tick={{ fill: "white" }} tickLine={{ stroke: "#3F3F46" }} axisLine={{ stroke: "#3F3F46" }} />
                      <Tooltip contentStyle={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: 'white', borderRadius: '0.5rem' }} />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <Bar dataKey="reviews" fill="#71717A" />
                      <Bar dataKey="additions" fill="#3F3F46" />
                      <Bar dataKey="edits" fill="#18181B" />
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
                        <Cell fill="#D4D4D8" />
                        <Cell fill="#A1A1AA" />
                        <Cell fill="#71717A" />
                        <Cell fill="#3F3F46" />
                        <Cell fill="#18181B" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: 'white', borderRadius: '0.5rem' }} />
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#3F3F46" />
                      <XAxis 
                        type="number"
                        tick={{ fill: "white" }}
                        tickLine={{ stroke: "#3F3F46" }}
                        axisLine={{ stroke: "#3F3F46" }}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category"
                        tick={{ fill: "white" }}
                        tickLine={{ stroke: "#3F3F46" }}
                        axisLine={{ stroke: "#3F3F46" }}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#27272A', 
                          borderColor: '#3F3F46',
                          color: 'white',
                          borderRadius: '0.5rem' 
                        }}
                      />
                      <Legend />
                      <Bar dataKey="reviews" fill="#71717A" />
                      <Bar dataKey="streak" fill="#18181B" />
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
                    Goal: <span className="font-bold text-white">100 words</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Remaining: <span className="font-bold text-white">{100 - wordsAddedData[0].value}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
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