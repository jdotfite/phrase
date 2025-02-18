import React from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TagDisplay from '@/components/shared/TagDisplay';
import type { PhrasesTableProps, Phrase } from '@/types/types';

const PhrasesTable: React.FC<PhrasesTableProps> = ({
  phrases = [],
  loading,
  sortConfig = { key: '', direction: 'asc' },
  pagination,
  onSort,
  onEdit,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
  onShowCardView,
  newIds = []
}) => {
  const columnHeaders = [
    { key: 'id', label: 'ID' },
    { key: 'phrase', label: 'Phrase' },
    { key: 'category', label: 'Category' },
    { key: 'subcategory', label: 'Subcategory' },
    { key: 'difficulty', label: 'Difficulty' },
    { key: 'tags', label: 'Tags' },
    { key: 'hint', label: 'Hint' },
    { key: 'part_of_speech', label: 'Part of Speech' }
  ] as const;

  // Define difficulty labels
  const difficultyLabels = {
    1: 'Easy',
    2: 'Medium',
    3: 'Hard',
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this phrase?')) {
      await onDelete(id);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 rounded-xl shadow-xl p-8">
        <div className="text-center text-gray-400">Loading phrases...</div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: number | null | undefined) => {
    // If difficulty is null or undefined, return the default color
    if (difficulty === null || difficulty === undefined) {
      return 'bg-gray-900 text-gray-200';
    }

    // Handle numeric difficulty values
    switch (difficulty) {
      case 1: // Easy
        return 'bg-green-900 text-green-200';
      case 2: // Medium
        return 'bg-yellow-900 text-yellow-200';
      case 3: // Hard
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-900 text-gray-200'; // Fallback for unexpected values
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-xl shadow-xl overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Rows per page selector */}
          <select
            value={pagination.rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
          >
            {[10, 25, 50, 100].map(value => (
              <option key={value} value={value}>{value} per page</option>
            ))}
          </select>
          
          <span className="text-sm text-gray-400">
            {pagination.totalPages > 0
              ? `Page ${pagination.currentPage} of ${pagination.totalPages}`
              : 'No results'}
          </span>
        </div>

        <div className="flex gap-4">
          {/* Pagination Controls */}
          <div className="flex gap-2">
            <Button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>

          {/* Card View Button */}
          <Button
            onClick={onShowCardView}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Card View
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              {columnHeaders.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => onSort(key)}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 
                           uppercase tracking-wider bg-gray-800/80 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {label}
                    {sortConfig.key === key && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 
                         uppercase tracking-wider bg-gray-800/80">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {phrases.length === 0 ? (
              <tr>
                <td 
                  colSpan={columnHeaders.length + 1} 
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No phrases found
                </td>
              </tr>
            ) : (
              phrases.map((phrase, index) => (
                <tr 
                  key={phrase.id}
                  className={`
                    border-b border-gray-700/50 
                    ${index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/50'}
                    hover:bg-gray-700/50 transition-colors duration-150
                    ${newIds.includes(phrase.id) ? 'animate-flash' : ''}
                  `}
                >
                  <td className="px-4 py-3 whitespace-nowrap">{phrase.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{phrase.phrase}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{phrase.category}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{phrase.subcategory || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`
                      px-2 py-1 rounded-full text-xs
                      ${getDifficultyColor(phrase.difficulty)}
                    `}>
                      {difficultyLabels[phrase.difficulty] || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <TagDisplay tags={phrase.tags} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{phrase.hint || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {phrase.part_of_speech || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-4">
                      <button
                        onClick={() => onEdit(phrase)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(phrase.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Pagination */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
        <span className="text-sm text-gray-400">
          {`Showing ${phrases.length} of ${pagination.totalPages * pagination.rowsPerPage} phrases`}
        </span>
        <div className="flex gap-2">
          <Button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <Button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhrasesTable;