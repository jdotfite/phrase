import React from 'react';
import { DataTableFilters } from '@/components/tables/data-table/filters';
import { TableState } from '@/components/tables/types';

interface PhraseSearchProps {
  tableState: TableState;
  onTableStateChange: (state: Partial<TableState>) => void;
}

export const PhraseSearch: React.FC<PhraseSearchProps> = ({ 
  tableState, onTableStateChange 
}) => {
  return (
    <div className="px-2">
      <DataTableFilters
        tableState={tableState}
        onTableStateChange={onTableStateChange}
      />
    </div>
  );
};
