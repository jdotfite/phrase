import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NewPhrase, AddPhraseFormProps } from '@/types/types';
import { validateTags } from '@/utils/phraseUtils';

const AddPhraseForm: React.FC<AddPhraseFormProps> = ({
  onAddPhrase,
  categories,
  difficulties,
  partsOfSpeech,
  loading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPhrase, setNewPhrase] = useState<NewPhrase>({
    phrase: '',
    category: '',
    difficulty: '',
    subcategory: '',
    tags: '',
    hint: '',
    part_of_speech: ''
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewPhrase(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setNewPhrase({
      phrase: '',
      category: '',
      difficulty: '',
      subcategory: '',
      tags: '',
      hint: '',
      part_of_speech: ''
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate tags
      const tagValidation = validateTags(newPhrase.tags);
      if (!tagValidation.isValid) {
        setError(tagValidation.errors?.[0] || 'Invalid tags');
        return;
      }

      await onAddPhrase(newPhrase);
      resetForm();
      setIsExpanded(false);
    } catch (err) {
      console.error('Error adding phrase:', err);
      setError(err instanceof Error ? err.message : 'Failed to add phrase');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow">
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronRight 
          className={`transform transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
        <h2 className="text-xl font-bold">Add New Phrase</h2>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Phrase
              </label>
              <input
                type="text"
                name="phrase"
                value={newPhrase.phrase}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                         text-white focus:ring-2 focus:ring-blue-500"
                required
                minLength={2}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Category
              </label>
              <select
                name="category"
                value={newPhrase.category}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                         text-white focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={newPhrase.difficulty}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                         text-white focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select Difficulty</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Subcategory
              </label>
              <input
                type="text"
                name="subcategory"
                value={newPhrase.subcategory}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                         text-white focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={newPhrase.tags}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                         text-white focus:ring-2 focus:ring-blue-500"
                required
                pattern="^[a-zA-Z0-9\s,]+$"
                title="Enter comma-separated tags using letters, numbers and spaces"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Hint
              </label>
              <input
                type="text"
                name="hint"
                value={newPhrase.hint}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                         text-white focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Part of Speech
              </label>
              <select
                name="part_of_speech"
                value={newPhrase.part_of_speech}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                         text-white focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select Part of Speech</option>
                {partsOfSpeech.map(pos => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 
                         px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setIsExpanded(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Phrase'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddPhraseForm;