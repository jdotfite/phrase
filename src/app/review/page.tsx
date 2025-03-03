'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ReviewerSelection from '@/components/reviewer/ReviewerSelection';
import ReviewProgress from '@/components/reviewer/ReviewProgress';
import { CategoryFilter } from '@/components/reviewer/CategoryFilter';
import { usePhrases } from '@/hooks/usePhrases';
import { generateTags, generateHint } from '@/lib/claudeService';
import WordCreator from '@/components/reviewer/WordCreator';
import type {
  Phrase,
  Reviewer,
  Vote,
  VoteCategory,
  PhraseTag,
  PhraseTagWithTag,
  Tag,
  SubcategoryName
} from '@/types/types';

// Mode type definition
type ReviewMode = 'review' | 'create';

interface FieldProps {
  label: string;
  value: string | number | undefined;
  isEditing?: boolean;
  onChange?: (value: string) => void;
  options?: string[];
  type?: 'text' | 'select' | 'number';
  currentPhrase?: Phrase;
}

interface PhraseFieldProps {
  phrase: string;
  onVote: (isLike: boolean) => void;
  rating?: boolean;
}

interface EditedPhrase {
  id: number;
  category: string | undefined;
  subcategory?: string | undefined;
  hint?: string | undefined;
  difficulty?: number | undefined;
  tags?: string | undefined;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  isEditing = false,
  onChange,
  options = [],
  type = 'text',
  currentPhrase
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tagInputs, setTagInputs] = useState<string[]>(() => {
    if (value && label === 'Tags') {
      const tags = value.toString().split(',').map(tag => tag.trim());
      return [...tags.slice(0, 3), ...Array(3 - tags.length).fill('')].slice(0, 3);
    }
    return ['', '', ''];
  });

  useEffect(() => {
    if (value && label === 'Tags') {
      const tags = value.toString().split(',').map(tag => tag.trim());
      setTagInputs([...tags.slice(0, 3), ...Array(3 - tags.length).fill('')].slice(0, 3));
    }
  }, [value, label]);

  const handleGenerateTags = async () => {
    if (!isEditing || !onChange || !currentPhrase?.phrase) return;

    setIsLoading(true);
    try {
      const result = await generateTags(currentPhrase.phrase);
      if (result.tags.length > 0) {
        const newTags = result.tags.slice(0, 3);
        setTagInputs([...newTags, ...Array(3 - newTags.length).fill('')]);
        onChange(newTags.join(','));
      }
    } catch (error) {
      console.error('Error generating tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateHint = async () => {
    if (!isEditing || !onChange || !currentPhrase?.phrase) return;
  
    setIsLoading(true);
    try {
      const result = await generateHint(currentPhrase.phrase);
      if (result.hint) {
        onChange(result.hint);
      }
    } catch (error) {
      console.error('Error generating hint:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagChange = (index: number, newValue: string) => {
    if (!onChange) return;

    const newTags = [...tagInputs];
    newTags[index] = newValue.trim().replace(/\s+/g, '');
    setTagInputs(newTags);
    const validTags = newTags.filter(Boolean);
    onChange(validTags.join(','));
  };

  if (isEditing && label === 'Tags') {
    return (
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-1">{label}</label>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {tagInputs.map((tag, index) => (
              <input
                key={`tag-${index}`}
                type="text"
                value={tag}
                onChange={(e) => handleTagChange(index, e.target.value)}
                className="p-2 rounded bg-gray-700 text-white border border-gray-600"
                placeholder={`Tag ${index + 1}`}
                maxLength={16}
              />
            ))}
          </div>
          <button
            onClick={handleGenerateTags}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed w-full"
          >
            {isLoading ? 'Generating...' : '🤖 Ask AI'}
          </button>
        </div>
      </div>
    );
  }

  if (isEditing && label === 'Hint') {
    return (
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value?.toString() || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
          <button
            onClick={handleGenerateHint}
            disabled={isLoading}
            className="shrink-0 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>🤖</span>
            <span>Ask AI</span>
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    if (type === 'select') {
      return (
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">{label}</label>
          <select
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          >
            <option value="">Select {label}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
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
          value={value?.toString() || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
      </div>
    );
  }

  return (
    <div className="mb-4">
      <span className="block text-gray-400 text-sm">{label}</span>
      <span className="block text-white">{value || '-'}</span>
    </div>
  );
};

const PhraseField: React.FC<PhraseFieldProps> = ({
  phrase,
  onVote,
  rating = false
}) => {
  const buttonKey = `flag-button-${rating}`;
  
  return (
    <div className="mb-4">
      <label className="block text-gray-400 text-sm mb-1">Phrase</label>
      <div className="flex gap-2">
        <div className="flex-1 p-2 rounded bg-gray-700">
          <span className="text-white">{phrase}</span>
        </div>
        <button
          key={buttonKey}
          onClick={() => onVote(!rating)}
          type="button"
          className={`px-4 py-2 rounded flex items-center justify-center gap-2 ${
            rating 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-700 hover:bg-blue-600'
          }`}
        >
          <span>🚩</span>
          <span>Flag for Removal</span>
        </button>
      </div>
    </div>
  );
};

const ReviewPage: React.FC = () => {
  const [mode, setMode] = useState<ReviewMode>('review');
  const [currentReviewer, setCurrentReviewer] = useState<Reviewer | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [phraseRating, setPhraseRating] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [isEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedPhrase, setEditedPhrase] = useState<EditedPhrase>({
    id: -1,
    category: undefined,
    subcategory: undefined,
    hint: undefined,
    difficulty: undefined,
    tags: undefined
  });
  const [hasChanges, setHasChanges] = useState(false);

  const {
    phrases,
    loading: phrasesLoading,
    handleFilterChange,
    fetchCategories: fetchCategoriesFromHook,
    fetchPhrases
  } = usePhrases();

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategoriesFromHook();
      if (fetchedCategories) {
        setCategories(fetchedCategories);
      }
    };
    loadCategories();
  }, [fetchCategoriesFromHook]);

  useEffect(() => {
    const loadSubcategories = async () => {
      if (editedPhrase.category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', editedPhrase.category)
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
      } else {
        setSubcategories([]);
      }
    };

    loadSubcategories();
  }, [editedPhrase.category]);

  useEffect(() => {
    const loadPhraseData = async () => {
      const currentPhrase = phrases[currentIndex];
      if (currentPhrase) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('name')
          .eq('id', currentPhrase.category_id)
          .single();

        const { data: subcategoryData } = await supabase
          .from('subcategories')
          .select('name')
          .eq('id', currentPhrase.subcategory_id)
          .single();

        setEditedPhrase({
          id: currentPhrase.id,
          category: categoryData?.name || undefined,
          subcategory: subcategoryData?.name || undefined,
          hint: currentPhrase.hint || undefined,
          difficulty: currentPhrase.difficulty || undefined,
          tags: currentPhrase.tags || undefined
        });
        setHasChanges(false);
      }
    };

    if (mode === 'review') {
      loadPhraseData();
    }
  }, [phrases, currentIndex, mode]);

  const handleReviewerSelect = (reviewer: Reviewer) => {
    setCurrentReviewer(reviewer);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    handleFilterChange('category', category ?? '');
    setCurrentIndex(0);
    setPhraseRating(undefined);
  };

  const handleVote = async (newFlagState: boolean) => {
    if (!currentReviewer || !phrases[currentIndex]) return;
  
    setPhraseRating(newFlagState);
  
    try {
      if (newFlagState) {
        const { error } = await supabase
          .from('votes')
          .insert({
            reviewer_id: currentReviewer.id,
            phrase_id: phrases[currentIndex].id,
            category: 'phrase',
            vote: false,
            created_at: new Date().toISOString()
          });
  
        if (error) {
          setPhraseRating(!newFlagState);
          throw error;
        }
      } else {
        const { error: deleteError } = await supabase
          .from('votes')
          .delete()
          .eq('reviewer_id', currentReviewer.id)
          .eq('phrase_id', phrases[currentIndex].id)
          .eq('category', 'phrase');
  
        if (deleteError) {
          setPhraseRating(!newFlagState);
          throw deleteError;
        }
      }
    } catch (err) {
      console.error('Error recording vote:', err);
    }
  };

  const handleFieldChange = (field: keyof EditedPhrase, value: string) => {
    setEditedPhrase(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!editedPhrase.id || editedPhrase.id === -1) return;

    setIsSaving(true);
    try {
      const categoryId = await getCategoryId(editedPhrase.category);
      const subcategoryId = await getSubcategoryId(editedPhrase.category, editedPhrase.subcategory);

      const { error: phraseError } = await supabase
        .from('phrases')
        .update({
          hint: editedPhrase.hint,
          difficulty: editedPhrase.difficulty,
          category_id: categoryId,
          subcategory_id: subcategoryId
        })
        .eq('id', editedPhrase.id);

      if (phraseError) throw phraseError;

      if (editedPhrase.tags) {
        const newTags = editedPhrase.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        const { data: existingTagsData } = await supabase
          .from('phrase_tags')
          .select('tags(id, tag)')
          .eq('phrase_id', editedPhrase.id);

        const existingTags = existingTagsData?.map((pt: PhraseTagWithTag) => pt.tags.tag) || [];

        const tagsToRemove = existingTags.filter((tag: string) => !newTags.includes(tag));
                for (const tagToRemove of tagsToRemove) {
          const { data: tagData } = await supabase
            .from('tags')
            .select('id')
            .eq('tag', tagToRemove)
            .single();

          if (tagData) {
            await supabase
              .from('phrase_tags')
              .delete()
              .eq('phrase_id', editedPhrase.id)
              .eq('tag_id', tagData.id);
          }
        }

        for (const newTag of newTags) {
          if (!existingTags.includes(newTag)) {
            let tagId: number | undefined;
            const { data: existingTag } = await supabase
              .from('tags')
              .select('id')
              .eq('tag', newTag)
              .single();

            if (existingTag) {
              tagId = existingTag.id;
            } else {
              const { data: newTagData } = await supabase
                .from('tags')
                .insert({ tag: newTag })
                .select('id')
                .single();

              if (newTagData) tagId = newTagData.id;
            }

            if (tagId) {
              await supabase
                .from('phrase_tags')
                .insert({
                  phrase_id: editedPhrase.id,
                  tag_id: tagId
                });
            }
          }
        }
      }

      await fetchPhrases();
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving changes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryId = async (categoryName: string | undefined) => {
    if (!categoryName) return null;
    const { data } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();
    return data?.id;
  };

  const getSubcategoryId = async (categoryName: string | undefined, subcategoryName: string | undefined) => {
    if (!categoryName || !subcategoryName) return null;
    const categoryId = await getCategoryId(categoryName);
    if (!categoryId) return null;

    const { data } = await supabase
      .from('subcategories')
      .select('id')
      .eq('name', subcategoryName)
      .eq('category_id', categoryId)
      .single();
    return data?.id;
  };

  const handleNext = () => {
    setPreviousIndex(currentIndex);
    setCurrentIndex(prev => prev + 1);
    setPhraseRating(false); // Reset rating for next phrase
  };

  const handleBack = () => {
    if (previousIndex !== null) {
      setCurrentIndex(previousIndex);
      setPreviousIndex(null);
      setPhraseRating(undefined);
    }
  };

  const handleModeChange = (newMode: ReviewMode) => {
    setMode(newMode);
  };

  if (phrasesLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!currentReviewer) {
    return (
      <ReviewerSelection
        onSelectReviewer={handleReviewerSelect}
        onClose={() => {}}
      />
    );
  }

  // Show word creator if in create mode
  if (mode === 'create') {
    return (
      <WordCreator 
        reviewer={currentReviewer} 
        categories={categories}
        onSwitchMode={() => setMode('review')}
      />
    );
  }

  const currentPhrase = phrases[currentIndex];

  if (!currentPhrase) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">All caught up! 🎉</h2>
          <p>You've reviewed all available phrases.</p>
          <div className="flex gap-4 justify-center mt-6">
            <button
              onClick={() => setCurrentReviewer(null)}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Switch Reviewer
            </button>
            <button
              onClick={() => setMode('create')}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              Create New Words
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Phrase Review</h1>
              <p className="text-gray-400 mt-2">
                Reviewer: {currentReviewer.name} ({currentReviewer.total_reviews} reviews)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('create')}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
              >
                Create New Words
              </button>
              <button
                onClick={() => setCurrentReviewer(null)}
                className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
              >
                Switch Reviewer
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
          />
          <div className="flex-1">
            <ReviewProgress streak={currentReviewer.current_streak} />
          </div>
        </div>

        <div className="bg-gray-800 rounded p-6">
          <PhraseField
            phrase={currentPhrase.phrase}
            onVote={handleVote}
            rating={phraseRating}
          />
          <Field
            label="Difficulty"
            value={
              editedPhrase.difficulty === 1 ? 'Easy' :
              editedPhrase.difficulty === 2 ? 'Medium' :
              editedPhrase.difficulty === 3 ? 'Hard' :
              '-'
            }
            isEditing={isEditing}
            onChange={(value) => {
              const difficultyMap = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
              handleFieldChange('difficulty', difficultyMap[value as keyof typeof difficultyMap].toString());
            }}
            type="select"
            options={['Easy', 'Medium', 'Hard']}
          />
          <Field
            label="Category"
            value={editedPhrase.category || ''}
            isEditing={isEditing}
            onChange={(value) => handleFieldChange('category', value)}
            type="select"
            options={categories}
          />
          <Field
            label="Subcategory"
            value={editedPhrase.subcategory || ''}
            isEditing={isEditing}
            onChange={(value) => handleFieldChange('subcategory', value)}
            type="select"
            options={subcategories}
          />
          <Field
            label="Tags"
            value={editedPhrase.tags}
            isEditing={isEditing}
            onChange={(value) => handleFieldChange('tags', value)}
            currentPhrase={currentPhrase}
          />
          <Field
            label="Hint"
            value={editedPhrase.hint}
            isEditing={isEditing}
            onChange={(value) => handleFieldChange('hint', value)}
            currentPhrase={currentPhrase}
          />
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`px-4 py-2 md:text-base rounded ${
                hasChanges ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {previousIndex !== null && (
                  <button
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600"
                    onClick={handleBack}
                  >
                    ←
                  </button>
                )}
                <button
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700"
                  onClick={handleNext}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;