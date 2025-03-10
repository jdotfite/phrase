'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/services/supabase';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';

// UI Components from shadcn
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatCard } from "@/components/ui/stat-card";

// Icons
import { FileText, Users, Award, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";

// Custom components
import FilterControls from '@/components/common/FilterControls';
import PhrasesTable from '@/components/common/PhrasesTable';
import BulkImportForm from '@/features/shared/BulkImportForm';
import Login from '@/components/common/Login';

// Hooks
import { useStats } from '@/hooks/useStats';
import { usePhrases } from '@/hooks/usePhrases';
import { usePhraseMetadata } from '@/hooks/usePhraseMetadata';
import { useReviewers } from '@/hooks/useReviewers';

const ImprovedDashboard = () => {
  // Auth state
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'phrases' | 'import' | 'stats'>('phrases');

  // Initialize hooks
  const { stats, loading: statsLoading } = useStats();
  const { reviewers, loading: reviewersLoading } = useReviewers();
  
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

  // Initialize Auth
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
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

  const handleBulkImportSuccess = (importedIds = []) => {
    fetchPhrases();
    setError(null);
    setActiveSection('phrases');
  };

  const handleBulkImportError = (errorMessage) => {
    setError(errorMessage);
  };

  const goToReviewPage = () => {
    router.push('/review');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

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
            <p className="text-gray-400 mt-1">Manage your catch phrases</p>
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
            icon={<FileText className="h-4 w-4" />}
            description="Catch phrases in database"
          />
          <StatCard 
            title="Categories" 
            value={stats?.uniqueCategories || 0} 
            icon={<ChevronDown className="h-4 w-4" />}
            description="Different word categories"
            trend={{ value: 2.5, label: "from last month", direction: "up" }}
          />
          <StatCard 
            title="Active Reviewers" 
            value={reviewers?.length || 0} 
            icon={<Users className="h-4 w-4" />}
            description="Contributors this month"
            trend={{ value: 12, label: "from last month", direction: "up" }}
          />
          {reviewers && reviewers.length > 0 && (
            <StatCard 
              title="Top Contributor" 
              value={reviewers[0]?.name || 'None'} 
              icon={<Award className="h-4 w-4" />}
              description={`${reviewers[0]?.total_reviews || 0} reviews`}
              trend={{ value: 5, label: "increase in streak", direction: "up" }}
            />
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Section Navigation */}
        <div className="flex space-x-2 mb-6">
          <Button 
            variant={activeSection === 'phrases' ? 'default' : 'outline'}
            onClick={() => setActiveSection('phrases')}
          >
            Phrases
          </Button>
          <Button 
            variant={activeSection === 'import' ? 'default' : 'outline'}
            onClick={() => setActiveSection('import')}
          >
            Import Phrases
          </Button>
          <Button 
            variant={activeSection === 'stats' ? 'default' : 'outline'}
            onClick={() => setActiveSection('stats')}
          >
            Analytics
          </Button>
        </div>

        {/* Content Sections */}
        {activeSection === 'phrases' && (
          <>
            <FilterControls
              filters={filters}
              onChange={handleFilterChange}
              onReset={resetFilters}
              categories={categories}
              difficulties={difficulties}
              partsOfSpeech={partsOfSpeech}
            />

            <PhrasesTable
              phrases={phrases}
              loading={phrasesLoading}
              pagination={pagination}
              sortConfig={sortConfig}
              onSort={handleSort}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onEdit={editPhrase}
              onDelete={deletePhrase}
              onShowCardView={() => {}}
              newIds={[]}
            />
          </>
        )}

        {activeSection === 'import' && (
          <Card>
            <CardHeader>
              <CardTitle>Bulk Import</CardTitle>
              <CardDescription>
                Import multiple phrases at once using CSV format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkImportForm
                onSuccess={handleBulkImportSuccess}
                onError={handleBulkImportError}
              />
            </CardContent>
          </Card>
        )}

        {activeSection === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Difficulty Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full items-center justify-center">
                  <div className="w-full max-w-md">
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span>Easy</span>
                        <span>{stats?.difficultyBreakdown?.easy || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${stats?.difficultyBreakdown?.easy || 0}%` }}></div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span>Medium</span>
                        <span>{stats?.difficultyBreakdown?.medium || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: `${stats?.difficultyBreakdown?.medium || 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Hard</span>
                        <span>{stats?.difficultyBreakdown?.hard || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${stats?.difficultyBreakdown?.hard || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Reviewers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead>Streak</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewersLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : reviewers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">No reviewers found</TableCell>
                      </TableRow>
                    ) : (
                      reviewers.slice(0, 5).map((reviewer) => (
                        <TableRow key={reviewer.id}>
                          <TableCell>{reviewer.name}</TableCell>
                          <TableCell>{reviewer.total_reviews}</TableCell>
                          <TableCell>
                            {reviewer.current_streak > 0 ? (
                              <span className="flex items-center gap-1">
                                {reviewer.current_streak} 🔥
                              </span>
                            ) : (
                              '0'
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovedDashboard;