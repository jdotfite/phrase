import React from 'react';
import { X } from 'lucide-react';
import type { Phrase } from '@/types/types'; 

interface EditPhraseModalProps {
  phrase: Phrase;
  onChange: (updatedPhrase: Phrase) => void;
  onSave: (phrase: Phrase) => void;
  onClose: () => void;
  categories: string[];
  difficulties: string[];
  partsOfSpeech: string[];
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...phrase, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(phrase);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Phrase</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Phrase</label>
              <input
                type="text"
                name="phrase"
                value={phrase.phrase}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Category</label>
              <select
                name="category"
                value={phrase.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            {/* Add similar fields for difficulty, subcategory, tags, hints, and part_of_speech */}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default EditPhraseModal;
