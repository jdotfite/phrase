import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { Phrase, NewPhrase } from '@/types/types';

// Component imports
import AdminNavBar from '@/components/AdminNavBar';
import StatsSection from '@/components/stats/StatsSection';
import AddPhraseForm from '@/components/forms/AddPhraseForm';
import BulkImportForm from '@/components/forms/BulkImportForm';
import FilterControls from '@/components/filters/FilterControls';
import PhrasesTable from '@/components/table/PhrasesTable';
import CardViewModal from '@/components/modals/CardViewModal';
import Login from '@/components/Login';

// Hook imports
import { usePhrases } from '@/hooks/usePhrases';
import { usePhraseMetadata } from '@/hooks/usePhraseMetadata';
import { useStats } from '@/hooks/useStats';

const AdminDashboard: React.FC = () => {
  // Auth State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Hooks
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
    addPhrase,
    editPhrase,
    deletePhrase,
    fetchPhrases,
    resetFilters,
    sortByIdDesc
  } = usePhrases();

  const { 
    categories, 
    difficulties, 
    partsOfSpeech, 
    loading: metadataLoading 
  } = usePhraseMetadata();

  const { stats, loading: statsLoading } = useStats();

  // Modal State
  const [showCardModal, setShowCardModal] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPhrase, setEditedPhrase] = useState<Phrase | null>(null);
  const [newIds, setNewIds] = useState<number[]>([]);

  // Initialize Auth
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        if (session) {
          setShowLoginModal(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handlers
  const handleBulkImportSuccess = (importedIds: number[] = []) => {
    fetchPhrases();
    sortByIdDesc();
    setNewIds(importedIds);
    setError(null);

    if (importedIds.length > 0) {
      setTimeout(() => setNewIds([]), 2000);
    }
  };

  const handleBulkImportError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Auth check
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (!session) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  // Card Modal Handlers
  const handleCardEdit = async () => {
    if (!(await checkAuth())) return;
    setEditedPhrase(phrases[currentCardIndex]);
    setIsEditing(true);
  };

  const handleCardSave = async () => {
    if (!editedPhrase) return;
    await editPhrase(editedPhrase);
    setShowCardModal(false);
    setIsEditing(false);
  };

  const handleCardCancel = () => {
    setEditedPhrase(null);
    setIsEditing(false);
  };

  const handleTagClick = (tag: string) => {
    handleFilterChange('searchTerm', tag);
    setShowCardModal(false);
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
      {/* Navigation */}
      <AdminNavBar 
        session={session} 
        setShowLoginModal={setShowLoginModal} 
      />

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto">
        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Section */}
        <StatsSection 
          stats={stats} 
          loading={statsLoading} 
        />

        {/* Forms Section */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <AddPhraseForm
            onAddPhrase={addPhrase}
            categories={categories}
            difficulties={difficulties}
            partsOfSpeech={partsOfSpeech}
            loading={metadataLoading}
          />
          <BulkImportForm
            onSuccess={handleBulkImportSuccess}
            onError={handleBulkImportError}
          />
        </div>

        {/* Filters */}
        <FilterControls
          filters={filters}
          onChange={handleFilterChange}
          onReset={resetFilters}
          categories={categories}
          difficulties={difficulties}
          partsOfSpeech={partsOfSpeech}
        />

        {/* Table */}
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
          onShowCardView={() => setShowCardModal(true)}
          newIds={newIds}
        />

        {/* Modals */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
              <Login onClose={() => setShowLoginModal(false)} />
            </div>
          </div>
        )}

        {showCardModal && (
          <CardViewModal
            isOpen={showCardModal}
            onClose={() => setShowCardModal(false)}
            phrases={phrases}
            currentIndex={currentCardIndex}
            onNavigate={setCurrentCardIndex}
            isEditing={isEditing}
            editedPhrase={editedPhrase}
            onEdit={handleCardEdit}
            onSave={handleCardSave}
            onCancel={handleCardCancel}
            onEditChange={(field, value) => {
              if (editedPhrase) {
                setEditedPhrase({ ...editedPhrase, [field]: value });
              }
            }}
            categories={categories}
            difficulties={difficulties}
            partsOfSpeech={partsOfSpeech}
            onTagClick={handleTagClick}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;