import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Pencil, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TagDisplay from '@/components/shared/TagDisplay';
import { supabase } from '@/lib/supabase';
import type { CardViewModalProps, Phrase, VoteCategory } from '@/types/types';

interface FieldProps extends React.ComponentProps<'div'> {
  label: string;
  value: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  options?: string[];
  isEditing: boolean;
  onTagClick?: (tag: string) => void;
  onVote?: (isLike: boolean) => void;
  rating?: boolean;
  showVoting?: boolean;
}

const Field: React.FC<FieldProps> = ({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  options = [], 
  isEditing,
  onTagClick,
  onVote,
  rating,
  showVoting = false
}) => {
  const baseFieldClass = `mb-4 rounded-lg p-3 ${
    rating === true ? 'bg-green-900' :
    rating === false ? 'bg-red-900' :
    'bg-gray-700'
  }`;

  if (isEditing) {
    if (type === "select") {
      return (
        <div className={baseFieldClass}>
          <label className="block text-gray-400 text-sm mb-1">{label}</label>
          <select
            value={value || ""}
            onChange={onChange}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 
                     focus:ring-2 focus:ring-blue-500"
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
      <div className={baseFieldClass}>
        <label className="block text-gray-400 text-sm mb-1">{label}</label>
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 
                   focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }

  return (
    <div className={baseFieldClass}>
      <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-center">
        <div className="text-gray-300 px-3 py-1 text-sm">
          {label}
        </div>
        <div className="px-3 py-2">
          {type === "tags" ? (
            <TagDisplay tags={value || ''} onClick={onTagClick} />
          ) : (
            <span className="text-lg text-white">{value || '-'}</span>
          )}
        </div>
        {showVoting && onVote && (
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => onVote(true)}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                rating === true ? 'bg-green-600' : 'hover:bg-gray-500'
              }`}
            >
              👍
            </button>
            <button
              onClick={() => onVote(false)}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                rating === false ? 'bg-red-600' : 'hover:bg-gray-500'
              }`}
            >
              👎
            </button>
          </div>
        )}
      </div>
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
  reviewer,
  onTagClick
}) => {
  const [ratings, setRatings] = useState<Record<VoteCategory, boolean>>({});
  const [reviewCount, setReviewCount] = useState(0);

  if (!isOpen) return null;

  const displayPhrase = isEditing ? editedPhrase : phrases[currentIndex];
  if (!displayPhrase) return null;

  const handleVote = async (field: VoteCategory, isLike: boolean) => {
    if (!reviewer || !displayPhrase) return;

    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          reviewer_id: reviewer.id,
          phrase_id: displayPhrase.id,
          category: field,
          vote: isLike,
          created_at: new Date().toISOString()
        });

      if (!error) {
        setRatings(prev => ({ ...prev, [field]: isLike }));
        
        // Update reviewer stats
        const { error: reviewerError } = await supabase
          .from('reviewers')
          .update({
            total_reviews: reviewer.total_reviews + 1,
            last_review_at: new Date().toISOString(),
            current_streak: reviewer.current_streak + 1
          })
          .eq('id', reviewer.id);

        if (reviewerError) {
          console.error('Error updating reviewer stats:', reviewerError);
        }
      }
    } catch (err) {
      console.error('Error recording vote:', err);
    }
  };

  const handleEditChange = (field: keyof Phrase) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onEditChange(field, e.target.value);
  };

  const fieldsToRate: VoteCategory[] = ['phrase', 'hint', 'tags', 'difficulty'];
  const isFullyRated = fieldsToRate.every(field => ratings[field] !== undefined);

  const handleNext = () => {
    if (isFullyRated) {
      onNavigate(currentIndex + 1);
      setRatings({});
      setReviewCount(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Phrase Card Review</h2>
            <span className="text-sm text-gray-400">Reviewed: {reviewCount}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-400">
            Phrase {currentIndex + 1} of {phrases.length}
          </span>
          <div className="flex gap-4">
            <Button
              onClick={() => onNavigate(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              variant="ghost"
              size="icon"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => onNavigate(Math.min(phrases.length - 1, currentIndex + 1))}
              disabled={currentIndex === phrases.length - 1}
              variant="ghost"
              size="icon"
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
            onVote={!isEditing ? (isLike) => handleVote('phrase', isLike) : undefined}
            rating={ratings['phrase']}
            showVoting={!isEditing}
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
            label="Difficulty"
            value={displayPhrase.difficulty}
            onChange={handleEditChange('difficulty')}
            type="select"
            options={difficulties}
            isEditing={isEditing}
            onVote={!isEditing ? (isLike) => handleVote('difficulty', isLike) : undefined}
            rating={ratings['difficulty']}
            showVoting={!isEditing}
          />

          <Field
            label="Tags"
            value={displayPhrase.tags}
            onChange={handleEditChange('tags')}
            type="tags"
            isEditing={isEditing}
            onTagClick={onTagClick}
            onVote={!isEditing ? (isLike) => handleVote('tags', isLike) : undefined}
            rating={ratings['tags']}
            showVoting={!isEditing}
          />

          <Field
            label="Hint"
            value={displayPhrase.hint}
            onChange={handleEditChange('hint')}
            isEditing={isEditing}
            onVote={!isEditing ? (isLike) => handleVote('hint', isLike) : undefined}
            rating={ratings['hint']}
            showVoting={!isEditing}
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
        {isEditing ? (
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave}>
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-center mt-6">
            <Button variant="outline" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {reviewer && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {isFullyRated ? 'All fields rated!' : 'Please rate all fields to continue'}
                </span>
                <Button
                  onClick={handleNext}
                  disabled={!isFullyRated}
                  className={!isFullyRated ? 'bg-gray-600 cursor-not-allowed' : ''}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardViewModal;