// features/dashboard/components/ImportSection.tsx
import React from 'react';
import BulkImportForm from '@/features/import/BulkImportForm';

interface ImportSectionProps {
  onSuccess?: () => void;
}

export const ImportSection: React.FC<ImportSectionProps> = ({ onSuccess }) => {
  const handleError = (error: string) => {
    console.error('Import error:', error);
  };

  return (
    <BulkImportForm 
      onSuccess={onSuccess} 
      onError={handleError} 
    />
  );
};