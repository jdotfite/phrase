import { UsePaginationProps } from '@/types/types';

interface PaginationResult {
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageRange: number[];
  currentPageItems: number;
}

/**
 * Custom hook for handling pagination logic
 */
export const usePagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  siblingCount = 1,
  boundaryCount = 1
}: UsePaginationProps & {
  siblingCount?: number;
  boundaryCount?: number;
}): PaginationResult => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const currentPageSafe = Math.min(Math.max(1, currentPage), totalPages);
  
  const startIndex = (currentPageSafe - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);
  
  // Calculate the range of page numbers to show
  const range = (start: number, end: number): number[] => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(
    Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
    totalPages
  );

  const siblingsStart = Math.max(
    Math.min(
      currentPageSafe - siblingCount,
      totalPages - boundaryCount - siblingCount * 2 - 1
    ),
    boundaryCount + 2
  );

  const siblingsEnd = Math.min(
    Math.max(currentPageSafe + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : totalPages - 1
  );

  // Combine the ranges with ellipses
  const pageRange = [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? ['ellipsis']
      : boundaryCount + 1 < totalPages - boundaryCount
      ? [boundaryCount + 1]
      : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < totalPages - boundaryCount - 1
      ? ['ellipsis']
      : totalPages - boundaryCount > boundaryCount
      ? [totalPages - boundaryCount]
      : []),
    ...endPages
  ].filter((page): page is number => typeof page === 'number');

  return {
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: currentPageSafe < totalPages,
    hasPreviousPage: currentPageSafe > 1,
    pageRange,
    currentPageItems: endIndex - startIndex + 1
  };
};

export default usePagination;