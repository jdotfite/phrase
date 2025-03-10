// src/components/tables/data-table/header.tsx
import React from 'react';

interface DataTableHeaderProps {
  children: React.ReactNode;
}

export function DataTableHeader({ children }: DataTableHeaderProps) {
  return (
    <div className="data-table-header">
      {children}
    </div>
  );
}