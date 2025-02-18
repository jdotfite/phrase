import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NewPhrase, AddPhraseFormProps } from '@/types/types';
import { validateTags } from '@/utils/phraseUtils';
import { supabase } from '@/lib/supabase';

interface FormState extends NewPhrase {
  phrase: string;
  category: string;
  difficulty: string;
  subcategory: string;
  tags: string;
  hint: string;
  part_of_speech: string;
}

interface FormError {
  [key: string]: string;
}

const AddPhraseForm: React.FC<AddPhraseFormProps> = ({
  onAddPhrase,
  categories,
  difficulties,
  partsOfSpeech,
  loading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [formState, setFormState] = useState<FormState>({
    phrase: '',
    category: '',
    difficulty: '',
    subcategory: '',
    tags: '',
    hint: '',
    part_of_speech: ''
  });

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!formState.category) {
        setSubcategories([]);
        return;
      }

      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', formState.category)
        .single();

      if (categoryData) {
        const { data: subcategoryData } = await supabase
          .from('subcategories')
          .select('name')
          .eq('category_id', categoryData.id)
          .order('name');

        if (subcategoryData) {
          setSubcategories(subcategoryData.map(sub => sub.name));
        }
      }
    };

    fetchSubcategories();
  }, [formState.category]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState(prev => {
      if (name === 'category') {
        return { ...prev, [name]: value, subcategory: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const resetForm = () => {
    setFormState({
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
      const tagValidation = validateTags(formState.tags);
      if (!tagValidation.isValid) {
        setError(tagValidation.errors?.[0] || 'Invalid tags');
        return;
      }

      await onAddPhrase(formState);
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
            {/* Phrase Input */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Phrase
              </label>
              <input
                type="text"
                name="phrase"
                value={formState.phrase}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                         text-white focus:ring-2 focus:ring-blue-500"
                required
                minLength={2}
                disabled={loading}
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Category
              </label>
              <select
                name="category"
                value={formState.category}
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

            {/* Subcategory Select */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Subcategory
              </label>
              <select
                name="subcategory"
                value={formState.subcategory}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                         text-white focus:ring-2 focus:ring-blue-500"
                disabled={!formState.category || loading}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
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
                value={formState.difficulty}
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

            {/* Tags Input */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formState.tags}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                         text-white focus:ring-2 focus:ring-blue-500"
                required
                pattern="^[a-zA-Z0-9\s,]+$"
                title="Enter comma-separated tags using letters, numbers and spaces"
                disabled={loading}
              />
            </div>

            {/* Hint Input */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Hint
              </label>
              <input
                type="text"
                name="hint"
                value={formState.hint}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                         text-white focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* Part of Speech Select */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Part of Speech
              </label>
              <select
                name="part_of_speech"
                value={formState.part_of_speech}
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