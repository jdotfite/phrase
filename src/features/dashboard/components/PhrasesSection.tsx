// features/dashboard/components/PhrasesSection.tsx
import React from 'react';
import { PhrasesTable } from '@/features/phrases/phrasesTable';
import { FilterProvider } from '@/features/phrases/stores/filterContext';
import { useDeletePhrase } from '@/features/phrases/hooks/useDeletePhrase';
import { usePhrases } from '@/features/data/hooks/usePhrases';

interface PhrasesSectionProps {
  newIds: number[];
}

export const PhrasesSection: React.FC<PhrasesSectionProps> = ({ newIds }) => {
  const {
    phrases,
    loading: phrasesLoading,
    filters,
    pagination,
    sortConfig,
    handleSort,
    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
    fetchPhrases
  } = usePhrases();

  // Initialize the delete phrase mutation
  const deletePhraseMutation = useDeletePhrase();
  
  // Add handlers for edit and delete
  const handleEdit = (id: number) => {
    console.log('Editing phrase with ID:', id);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this phrase?')) {
      deletePhraseMutation.mutate(id, {
        onSuccess: () => {
          fetchPhrases();
        }
      });
    }
  };

  // Create a tableState object from the hook's state
  const tableState = {
    sortConfig,
    pagination,
    filters
  };

  // Function to update the table state
  const handleTableStateChange = (updates: any) => {
    if (updates.filters) {
      Object.entries(updates.filters).forEach(([key, value]) => {
        if (value !== undefined) {
          handleFilterChange(key, value as string);
        }
      });
    }
    
    if (updates.sortConfig?.key) {
      handleSort(updates.sortConfig.key);
    }
    
    if (updates.pagination) {
      if (updates.pagination.rowsPerPage) {
        handleRowsPerPageChange(updates.pagination.rowsPerPage);
      }
      
      if (updates.pagination.currentPage) {
        handlePageChange(updates.pagination.currentPage);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-4">
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
  );
};