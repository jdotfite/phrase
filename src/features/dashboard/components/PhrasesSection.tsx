import React, { useEffect } from 'react';
import { PhrasesTable } from '@/features/phrases/phrasesTable';
import { FilterProvider } from '@/features/phrases/stores/filterContext';
import { useDeletePhrase } from '@/features/phrases/hooks/useDeletePhrase';
import { usePhrases } from '@/features/data/hooks/usePhrases';
import { useToast } from '@/hooks/useToast';

interface PhrasesSectionProps {
  newIds: number[];
  onEdit: (id: number) => void;
}

export const PhrasesSection: React.FC<PhrasesSectionProps> = ({ 
  newIds,
  onEdit
}) => {
  const { toast } = useToast();
  
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
  
  // Watch for errors from the delete mutation
  useEffect(() => {
    if (deletePhraseMutation.error) {
      toast({
        title: "Error",
        description: "Failed to delete phrase",
        variant: "destructive"
      });
    }
  }, [deletePhraseMutation.error, toast]);
  
  // Handle delete phrase
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this phrase?')) {
      deletePhraseMutation.mutate(id, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Phrase deleted successfully",
            variant: "success"
          });
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
          onEdit={onEdit}
          onDelete={handleDelete}
          newIds={newIds}
        />
      </FilterProvider>
    </div>
  );
};

export default PhrasesSection;