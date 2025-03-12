// components/ImprovedDashboard/index.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/services/supabase';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, Users, FileText, Award, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FilterControls from '@/components/common/FilterControls';
import PhrasesTable from '@/components/common/PhrasesTable';
import BulkImportForm from '@/components/shared/BulkImportForm';
import Login from '@/components/common/Login';
import { useStats } from '@/hooks/useStats';
import { usePhrases } from '@/hooks/usePhrases';
import { usePhraseMetadata } from '@/hooks/usePhraseMetadata';
import { cn } from '@/lib/utils';

const ImprovedDashboard = () => {
  // Auth state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [session, setSession] = useState(null);
  const [bulkImportVisible, setBulkImportVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [topReviewers, setTopReviewers] = useState([]);
  const [greeting, setGreeting] = useState('');

  // Initialize hooks
  const { stats, loading: statsLoading } = useStats();
  const {
    phrases,
    loading: phrasesLoading,
    error,
    setError,
    pagination,
    sortConfig,
    filters,
    handleSort,
    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
    editPhrase,
    deletePhrase,
    fetchPhrases,
    resetFilters,
  } = usePhrases();

  const { 
    categories, 
    difficulties, 
    partsOfSpeech
  } = usePhraseMetadata();

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = '';
    
    if (hour < 12) {
      newGreeting = 'Good morning';
    } else if (hour < 18) {
      newGreeting = 'Good afternoon';
    } else {
      newGreeting = 'Good evening';
    }
    
    setGreeting(newGreeting);
  }, []);

  // Fetch top reviewers
  useEffect(() => {
    const fetchTopReviewers = async () => {
      try {
        const { data, error } = await supabase
          .from('reviewers')
          .select('*')
          .order('total_reviews', { ascending: false })
          .limit(3);
          
        if (error) throw error;
        setTopReviewers(data || []);
      } catch (err) {
        console.error('Error fetching top reviewers:', err);
      }
    };

    fetchTopReviewers();
  }, []);

  // Initialize Auth
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session) {
          setShowLoginModal(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Generate sample data for charts
  const generateActivityData = () => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return daysOfWeek.map(day => ({
      name: day,
      reviews: Math.floor(Math.random() * 20) + 5,
      newPhrases: Math.floor(Math.random() * 10) + 1,
    }));
  };

  const activityData = generateActivityData();

  // Simple formatter for numbers
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const handleBulkImportSuccess = (importedIds = []) => {
    fetchPhrases();
    setBulkImportVisible(false);
    setError(null);
  };

  const handleBulkImportError = (errorMessage) => {
    setError(errorMessage);
  };

  const StatCard = ({ title, value, icon, colorClass, subtitle }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-bold text-white">{formatNumber(value)}</span>
          </div>
          {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
        </div>
        <div className={cn("rounded-lg p-3", colorClass)}>
          {icon}
        </div>
      </div>
    </div>
  );

  const goToReviewPage = () => {
    window.location.href = '/review';
  };

  // Render dashboard
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-8">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <Login onClose={() => setShowLoginModal(false)} />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-[1920px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">{greeting}, {session?.user?.email || 'welcome back'}</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={goToReviewPage}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Review Words
            </Button>
            {!session ? (
              <Button
                onClick={() => setShowLoginModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Login
              </Button>
            ) : (
              <Button
                onClick={() => supabase.auth.signOut()}
                variant="destructive"
                className="hover:bg-red-700"
              >
                Logout
              </Button>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Phrases" 
            value={stats?.total || 0} 
            icon={<FileText className="h-6 w-6 text-blue-400" />}
            colorClass="bg-blue-500/10"
            subtitle="Catch phrases in database"
          />
          <StatCard 
            title="Categories" 
            value={stats?.uniqueCategories || 0} 
            icon={<ChevronDown className="h-6 w-6 text-green-400" />}
            colorClass="bg-green-500/10"
            subtitle="Different word categories"
          />
          <StatCard 
            title="Reviewers" 
            value={topReviewers.length || 0} 
            icon={<Users className="h-6 w-6 text-purple-400" />}
            colorClass="bg-purple-500/10"
            subtitle="Active content reviewers"
          />
          <StatCard 
            title="Top Contributor" 
            value={topReviewers[0]?.total_reviews || 0} 
            icon={<Award className="h-6 w-6 text-yellow-400" />}
            colorClass="bg-yellow-500/10"
            subtitle={topReviewers[0]?.name || 'No reviewers yet'}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Weekly Activity</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                <Bar dataKey="reviews" fill="#8884d8" name="Reviews" />
                <Bar dataKey="newPhrases" fill="#82ca9d" name="New Phrases" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Difficulty Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart layout="vertical" data={[
                { name: 'Easy', value: stats?.difficultyBreakdown?.easy || 0 },
                { name: 'Medium', value: stats?.difficultyBreakdown?.medium || 0 },
                { name: 'Hard', value: stats?.difficultyBreakdown?.hard || 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#F3F4F6' }}
                />
                <Bar dataKey="value" fill="#10B981" name="Percentage" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Top Contributors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topReviewers.map((reviewer, index) => (
              <div key={reviewer.id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    {['🥇', '🥈', '🥉'][index]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{reviewer.name}</h3>
                    <p className="text-gray-400">{reviewer.total_reviews} reviews</p>
                    <div className="mt-2 flex items-center gap-2">
                      {reviewer.current_streak > 0 && (
                        <span className="bg-orange-900/30 text-orange-400 text-xs px-2 py-1 rounded-full">
                          🔥 {reviewer.current_streak} day streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <Button
              onClick={() => setFiltersVisible(!filtersVisible)}
              variant="outline"
            >
              {filtersVisible ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button
              onClick={() => setBulkImportVisible(!bulkImportVisible)}
              variant="outline"
            >
              {bulkImportVisible ? 'Hide Bulk Import' : 'Bulk Import'}
            </Button>
          </div>
        </div>

        {/* Filters Section (Conditionally Rendered) */}
        {filtersVisible && (
          <FilterControls
            filters={filters}
            onChange={handleFilterChange}
            onReset={resetFilters}
            categories={categories}
            difficulties={difficulties}
            partsOfSpeech={partsOfSpeech}
          />
        )}

        {/* Bulk Import Form (Conditionally Rendered) */}
        {bulkImportVisible && (
          <div className="mb-8">
            <BulkImportForm
              onSuccess={handleBulkImportSuccess}
              onError={handleBulkImportError}
            />
          </div>
        )}

        {/* Phrases Table */}
        <PhrasesTable
          phrases={phrases}
          loading={phrasesLoading}
          sortConfig={sortConfig}
          pagination={pagination}
          onSort={handleSort}
          onEdit={editPhrase}
          onDelete={deletePhrase}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onShowCardView={() => {}}
          newIds={[]}
        />
      </div>
    </div>
  );
};

export default ImprovedDashboard;
