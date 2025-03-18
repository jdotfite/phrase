'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/services/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { 
  Phrase, 
  NewPhrase,
  Stats,
  Filters,
  PaginationState,
  SortConfig 
} from '@/types/types';

// Component imports
import AdminNavBar from '@/components/admin/AdminNavBar';
import StatsSection from '@/components/common/StatsSection';
import AddPhraseForm from '@/components/shared/AddPhraseForm';
import BulkImportForm from '@/components/shared/BulkImportForm';
import FilterControls from '@/components/common/FilterControls';
import PhrasesTable from '@/components/common/PhrasesTable';
import CardViewModal from '@/components/shared/CardViewModal';

// Hook imports
import { usePhrases } from '@/hooks/usePhrases';
import { usePhraseMetadata } from '@/hooks/use-data/usePhraseMetadata';
import { useStats } from '@/hooks/useStats';

		// Type definitions
		interface EditorState {
		  showCardModal: boolean;
		  currentCardIndex: number;
		  isEditing: boolean;
		  editedPhrase: Phrase | null;
		  newIds: number[];
		}

		const AdminDashboard: React.FC = () => {
		  // Auth State
		  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
		  const [session, setSession] = useState<Session | null>(null);
		  const [isLoading, setIsLoading] = useState<boolean>(true);

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

		  // Editor State
		  const [editorState, setEditorState] = useState<EditorState>({
			showCardModal: false,
			currentCardIndex: 0,
			isEditing: false,
			editedPhrase: null,
			newIds: []
		  });

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
			setEditorState(prev => ({ ...prev, newIds: importedIds }));
			setError(null);

			if (importedIds.length > 0) {
			  setTimeout(() => setEditorState(prev => ({ ...prev, newIds: [] })), 2000);
			}
		  };

		  const handleBulkImportError = (errorMessage: string) => {
			setError(errorMessage);
		  };

		  // Auth check
		  const checkAuth = async (): Promise<boolean> => {
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
			const phrase = phrases[editorState.currentCardIndex];
			if (!phrase) return;
			
			setEditorState(prev => ({
			  ...prev,
			  editedPhrase: phrase,
			  isEditing: true
			}));
		  };

		  const handleCardSave = async () => {
			if (!editorState.editedPhrase) return;
			await editPhrase(editorState.editedPhrase);
			setEditorState(prev => ({
			  ...prev,
			  showCardModal: false,
			  isEditing: false
			}));
		  };

		  const handleCardCancel = () => {
			setEditorState(prev => ({
			  ...prev,
			  editedPhrase: null,
			  isEditing: false
			}));
		  };

		  const handleTagClick = (tag: string) => {
			handleFilterChange('searchTerm', tag);
			setEditorState(prev => ({ ...prev, showCardModal: false }));
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
				  onShowCardView={() => setEditorState(prev => ({ ...prev, showCardModal: true }))}
				  newIds={editorState.newIds}
				/>

				{/* Modals */}
				{showLoginModal && (
				  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
					  <Login onClose={() => setShowLoginModal(false)} />
					</div>
				  </div>
				)}

				{editorState.showCardModal && (
				  <CardViewModal
					isOpen={editorState.showCardModal}
					onClose={() => setEditorState(prev => ({ ...prev, showCardModal: false }))}
					phrases={phrases}
					currentIndex={editorState.currentCardIndex}
					onNavigate={(index) => setEditorState(prev => ({ ...prev, currentCardIndex: index }))}
					isEditing={editorState.isEditing}
					editedPhrase={editorState.editedPhrase}
					onEdit={handleCardEdit}
					onSave={handleCardSave}
					onCancel={handleCardCancel}
					onEditChange={(field, value) => {
					  if (editorState.editedPhrase) {
						setEditorState(prev => ({
						  ...prev,
						  editedPhrase: { ...prev.editedPhrase!, [field]: value }
						}));
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