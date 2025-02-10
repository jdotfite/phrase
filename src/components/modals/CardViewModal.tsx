import React from 'react';
import { ChevronLeft, ChevronRight, X, Pencil, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TagDisplay from '@/components/shared/TagDisplay';
import type { CardViewModalProps, Phrase } from '@/types/types';

interface FieldProps {
  label: string;
  value: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  options?: string[];
  isEditing: boolean;
  onTagClick?: (tag: string) => void;
}

const Field: React.FC<FieldProps> = ({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  options = [], 
  isEditing,
  onTagClick 
}) => {
  if (isEditing) {
    if (type === "select") {
      return (
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">{label}</label>
          <select
            value={value || ""}
            onChange={onChange}
            className="w-full p-2 rounded bg-gray-700 text-white border 
                     border-gray-600 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select {label}</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }
    return (
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-1">{label}</label>
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          className="w-full p-2 rounded bg-gray-700 text-white border 
                   border-gray-600 focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }

  const displayValue = type === "tags" 
    ? <TagDisplay tags={value} onClick={onTagClick} />
    : value || '-';

  return (
    <div className="mb-4">
      <span className="block text-gray-400 text-sm mb-1">{label}</span>
      <div className="text-white">{displayValue}</div>
    </div>
  );
};

const CardViewModal: React.FC<CardViewModalProps> = ({
  isOpen,
  onClose,
  phrases,
  currentIndex,
  onNavigate,
  isEditing,
  editedPhrase,
  onEdit,
  onSave,
  onCancel,
  onEditChange,
  categories,
  difficulties,
  partsOfSpeech,
  onTagClick
}) => {
  if (!isOpen) return null;

  const displayPhrase = isEditing ? editedPhrase : phrases[currentIndex];
  if (!displayPhrase) return null;

  const handleEditChange = (field: keyof Phrase) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onEditChange(field, e.target.value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center 
                    justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] 
                    overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Phrase Card View</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-400">
            Phrase {currentIndex + 1} of {phrases.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate(currentIndex + 1)}
              disabled={currentIndex === phrases.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <Field
            label="Phrase"
            value={displayPhrase.phrase}
            onChange={handleEditChange('phrase')}
            isEditing={isEditing}
          />
          <Field
            label="Category"
            value={displayPhrase.category}
            onChange={handleEditChange('category')}
            type="select"
            options={categories}
            isEditing={isEditing}
          />
          <Field
            label="Subcategory"
            value={displayPhrase.subcategory}
            onChange={handleEditChange('subcategory')}
            isEditing={isEditing}
          />
          <Field
            label="Difficulty"
            value={displayPhrase.difficulty}
            onChange={handleEditChange('difficulty')}
            type="select"
            options={difficulties}
            isEditing={isEditing}
          />
          <Field
            label="Tags"
            value={displayPhrase.tags}
            onChange={handleEditChange('tags')}
            type="tags"
            isEditing={isEditing}
            onTagClick={onTagClick}
          />
          <Field
            label="Hint"
            value={displayPhrase.hint}
            onChange={handleEditChange('hint')}
            isEditing={isEditing}
          />
          <Field
            label="Part of Speech"
            value={displayPhrase.part_of_speech}
            onChange={handleEditChange('part_of_speech')}
            type="select"
            options={partsOfSpeech}
            isEditing={isEditing}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={onSave}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </>
          ) : (
            <Button
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardViewModal;