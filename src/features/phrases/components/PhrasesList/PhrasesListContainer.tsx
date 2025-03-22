// features/phrases/components/PhrasesList/PhrasesListContainer.tsx
import React, { useState } from 'react';
import { usePhrases } from '../../hooks/usePhrases';
import { useDeletePhrase } from '../../hooks/useDeletePhrase';
import { PhrasesList } from './PhrasesList';
import { Pagination } from '@/components/ui/pagination';
import { useFilter } from '../../stores/filterContext';
import { useRouter } from 'next/navigation';
import { getDifficultyBar } from '../../utils/formatting';

export function PhrasesListContainer() {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  
  // Use the filter context
  const { 
    searchTerm, 
    category, 
    difficulty, 
    subcategory, 
    part_of_speech, 
    page, 
    pageSize, 
    sortBy, 
    sortDirection,
    setFilter, 
    resetFilters 
  } = useFilter();

  // Compile all filters for the query
  const filters = {
    searchTerm,
    category,
    difficulty,
    subcategory,
    part_of_speech
  };
  
  // Use the data fetching hook
  const { data, isLoading, error } = usePhrases(
    filters,
    { page, pageSize },
    { column: sortBy, direction: sortDirection }
  );
  
  // Use the delete hook
  const deletePhraseHook = useDeletePhrase();
  
  const handleSelectRow = (id: number) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedRows.length === data?.data?.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data?.data?.map(phrase => phrase.id) || []);
    }
  };
  
  const handleEdit = (id: number) => {
    router.push(`/admin/phrases/edit/${id}`);
  };
  
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this phrase?')) {
      deletePhraseHook.mutate(id, {
        onSuccess: () => {
          setSelectedRows(prev => prev.filter(rowId => rowId !== id));
        }
      });
    }
  };
  
  const handlePageChange = (page: number) => {
    setFilter('page', page);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <PhrasesList
          phrases={data?.data || []}
          loading={isLoading}
          selectedRows={selectedRows}
          hiddenColumns={hiddenColumns}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      
      {data?.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}