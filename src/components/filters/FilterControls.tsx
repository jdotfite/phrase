import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import type { FilterControlsProps } from '@/types/types';

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onChange,
  onReset,
  categories = [],
  difficulties = [],
  partsOfSpeech = []
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(e.target.name, e.target.value);
  };

  const handleSearchClear = () => {
    onChange('searchTerm', '');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Search Input */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleChange}
              placeholder="Search phrases or tags..."
              className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 
                       rounded text-white placeholder-gray-400
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {filters.searchTerm && (
              <button
                onClick={handleSearchClear}
                className="absolute right-3 top-2.5 text-gray-400 
                         hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded 
                     text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Select */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Difficulty
          </label>
          <select
            name="difficulty"
            value={filters.difficulty}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded 
                     text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Difficulties</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </div>

        {/* Part of Speech Select */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Part of Speech
          </label>
          <select
            name="part_of_speech"
            value={filters.part_of_speech}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded 
                     text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Parts of Speech</option>
            {partsOfSpeech.map(pos => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Input */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Subcategory
          </label>
          <input
            type="text"
            name="subcategory"
            value={filters.subcategory}
            onChange={handleChange}
            placeholder="Filter by subcategory"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded 
                     text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Reset Filters
        </Button>
        <Button
          variant="default"
          onClick={() => {}} // Filters are applied automatically on change
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Apply Filters
        </Button>
      </div>

      {/* Active Filters Display */}
      {Object.values(filters).some(Boolean) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            return (
              <div
                key={key}
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 
                         rounded-full text-sm"
              >
                <span className="text-gray-400">
                  {key === 'searchTerm' ? 'Search' : key}:
                </span>
                <span>{value}</span>
                <button
                  onClick={() => onChange(key, '')}
                  className="ml-1 text-gray-400 hover:text-gray-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterControls;