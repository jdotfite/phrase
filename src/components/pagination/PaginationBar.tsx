import React from 'react';

interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  className?: string;
}

const PaginationInfo: React.FC<PaginationInfoProps> = ({
  currentPage,
  pageSize,
  totalItems,
  className = ''
}) => {
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(startIndex + pageSize - 1, totalItems);

  return (
    <div className={`text-sm text-gray-400 ${className}`}>
      {totalItems === 0 ? (
        'No items'
      ) : (
        <>
          Showing{' '}
          <span className="font-medium text-white">
            {startIndex}
          </span>{' '}
          to{' '}
          <span className="font-medium text-white">
            {endIndex}
          </span>{' '}
          of{' '}
          <span className="font-medium text-white">
            {totalItems}
          </span>{' '}
          items
        </>
      )}
    </div>
  );
};

export default PaginationInfo;