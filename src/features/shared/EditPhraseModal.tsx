import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/services/supabase';
import type { Phrase } from '@/types/types';

interface EditPhraseModalProps {
  phrase: Phrase;
  onChange: (updatedPhrase: Phrase) => void;
  onSave: (phrase: Phrase) => Promise<void>;
  onClose: () => void;
  categories: string[];
  difficulties: string[];
  partsOfSpeech: string[];
}


interface FormErrors {
  [key: string]: string;
}

export const EditPhraseModal: React.FC<EditPhraseModalProps> = ({
  phrase,
  onChange,
  onSave,
  onClose,
  categories,
  difficulties,
  partsOfSpeech
}) => {
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!phrase.category) {
        setSubcategories([]);
        return;
      }

      try {
        // Get category_id first
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', phrase.category)
          .single();

        if (categoryData) {
          // Then get subcategories for this category
          const { data: subcategoryData } = await supabase
            .from('subcategories')
            .select('name')
            .eq('category_id', categoryData.id)
            .order('name');

          if (subcategoryData) {
            setSubcategories(subcategoryData.map(sub => sub.name));
          }
        }
      } catch (err) {
        console.error('Error fetching subcategories:', err);
      }
    };

    fetchSubcategories();
  }, [phrase.category]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!phrase.phrase.trim()) {
      newErrors.phrase = 'Phrase is required';
    }

    if (!phrase.category) {
      newErrors.category = 'Category is required';
    }

    if (!phrase.difficulty) {
      newErrors.difficulty = 'Difficulty is required';
    }

    if (!phrase.part_of_speech) {
      newErrors.part_of_speech = 'Part of speech is required';
    }

    if (phrase.tags && !/^[a-zA-Z0-9\s,]+$/.test(phrase.tags)) {
      newErrors.tags = 'Tags can only contain letters, numbers, spaces, and commas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Clear any existing error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));

    // Reset subcategory when category changes
    if (name === 'category') {
      onChange({
        ...phrase,
        [name]: value,
        subcategory: ''
      });
    } else {
      onChange({
        ...phrase,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(phrase);
      onClose();
    } catch (err) {
      console.error('Error saving phrase:', err);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save changes. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Phrase</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phrase Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Phrase
            </label>
            <input
              type="text"
              name="phrase"
              value={phrase.phrase}
              onChange={handleChange}
              className={`w-full p-2 rounded bg-gray-700 border ${
                errors.phrase ? 'border-red-500' : 'border-gray-600'
              } text-white focus:ring-2 focus:ring-blue-500`}
              disabled={loading}
            />
            {errors.phrase && (
              <p className="mt-1 text-sm text-red-500">{errors.phrase}</p>
            )}
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Category
            </label>
            <select
              name="category"
              value={phrase.category}
              onChange={handleChange}
              className={`w-full p-2 rounded bg-gray-700 border ${
                errors.category ? 'border-red-500' : 'border-gray-600'
              } text-white focus:ring-2 focus:ring-blue-500`}
              disabled={loading}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Subcategory Select */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Subcategory
            </label>
            <select
              name="subcategory"
              value={phrase.subcategory || ''}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                     text-white focus:ring-2 focus:ring-blue-500"
              disabled={!phrase.category || loading}
            >
              <option value="">Select Subcategory</option>
              {subcategories.map(subcategory => (
                <option key={subcategory} value={subcategory}>{subcategory}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Select */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Difficulty
            </label>
            <select
              name="difficulty"
              value={phrase.difficulty}
              onChange={handleChange}
              className={`w-full p-2 rounded bg-gray-700 border ${
                errors.difficulty ? 'border-red-500' : 'border-gray-600'
              } text-white focus:ring-2 focus:ring-blue-500`}
              disabled={loading}
            >
              <option value="">Select Difficulty</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
            {errors.difficulty && (
              <p className="mt-1 text-sm text-red-500">{errors.difficulty}</p>
            )}
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={phrase.tags}
              onChange={handleChange}
              className={`w-full p-2 rounded bg-gray-700 border ${
                errors.tags ? 'border-red-500' : 'border-gray-600'
              } text-white focus:ring-2 focus:ring-blue-500`}
              disabled={loading}
            />
            {errors.tags && (
              <p className="mt-1 text-sm text-red-500">{errors.tags}</p>
            )}
          </div>

          {/* Hint Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Hint
            </label>
            <input
              type="text"
              name="hint"
              value={phrase.hint || ''}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                     text-white focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Part of Speech Select */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Part of Speech
            </label>
            <select
              name="part_of_speech"
              value={phrase.part_of_speech}
              onChange={handleChange}
              className={`w-full p-2 rounded bg-gray-700 border ${
                errors.part_of_speech ? 'border-red-500' : 'border-gray-600'
              } text-white focus:ring-2 focus:ring-blue-500`}
              disabled={loading}
            >
              <option value="">Select Part of Speech</option>
              {partsOfSpeech.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
            {errors.part_of_speech && (
              <p className="mt-1 text-sm text-red-500">{errors.part_of_speech}</p>
            )}
          </div>

          {errors.submit && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPhraseModal;
