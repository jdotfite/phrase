// components/reviewer/WordCreator/PhraseEditor.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/services/supabase';
import { generateTags, generateHint } from '@/lib/services/claudeService';
import { GeneratedPhrase, DIFFICULTY_OPTIONS } from './types';
import { loadSubcategories, getCategoryId, getSubcategoryId } from './utils';

interface PhraseEditorProps {
  phrase: GeneratedPhrase;
  categories: string[];
  reviewerId: number;
  onSave: (phrase: GeneratedPhrase) => void;
  onCancel: () => void;
}

const PhraseEditor: React.FC<PhraseEditorProps> = ({ 
  phrase, 
  categories, 
  reviewerId,
  onSave, 
  onCancel 
}) => {
  const [editedPhrase, setEditedPhrase] = useState<GeneratedPhrase>(phrase);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load subcategories when selected category changes
  useEffect(() => {
    const loadSubcategoriesForPhrase = async () => {
      if (editedPhrase?.category) {
        const subcats = await loadSubcategories(editedPhrase.category);
        setSubcategories(subcats);
      } else {
        setSubcategories([]);
      }
    };

    loadSubcategoriesForPhrase();
  }, [editedPhrase?.category]);

  // Handle field updates
  const handleUpdateField = (field: keyof GeneratedPhrase, value: string | number) => {
    setEditedPhrase(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate tags using Claude
  const handleGenerateTags = async () => {
    try {
      const result = await generateTags(editedPhrase.phrase);
      if (result.tags.length > 0) {
        handleUpdateField('tags', result.tags.join(','));
      }
    } catch (error) {
      console.error('Error generating tags:', error);
    }
  };

  const handleUpdateHint = (hintText: string) => {
    if (!selectedPhrase) return;
    
    // Enforce 20 character limit
    const trimmedHint = hintText.trim();
    const limitedHint = trimmedHint.length > 20 ? trimmedHint.substring(0, 20) : trimmedHint;
    
    setSelectedPhrase(prev => {
      if (!prev) return null;
      return { ...prev, hint: limitedHint };
    });
  };
  
  // Update the handleGenerateHint function to use handleUpdateHint
  const handleGenerateHint = async () => {
    if (!selectedPhrase) return;
    
    try {
      const result = await generateHint(selectedPhrase.phrase);
      if (result.hint) {
        // Apply title case and enforce character limit
        const titleCasedHint = toTitleCase(result.hint);
        handleUpdateHint(titleCasedHint);
      }
    } catch (error) {
      console.error('Error generating hint:', error);
    }
  };

  // Save the current phrase and return to selection
  const handleSavePhrase = async () => {
    setIsSaving(true);
    
    try {
      // Get category and subcategory IDs
      const categoryId = await getCategoryId(editedPhrase.category);
      const subcategoryId = await getSubcategoryId(editedPhrase.category, editedPhrase.subcategory);
      
      // Insert the phrase
      const { data: phraseData, error: phraseError } = await supabase
        .from('phrases')
        .insert({
          phrase: editedPhrase.phrase,
          hint: editedPhrase.hint || null,
          difficulty: editedPhrase.difficulty || 2,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          created_by: reviewerId,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (phraseError) {
        console.error('Phrase insert error:', phraseError);
        throw phraseError;
      }
      
      // Handle tags if any
      if (editedPhrase.tags && phraseData) {
        const tagList = editedPhrase.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        
        for (const tagName of tagList) {
          // Check if tag exists
          let tagId;
          const { data: existingTag, error: tagFetchError } = await supabase
            .from('tags')
            .select('id')
            .eq('tag', tagName)
            .single();
          
          if (tagFetchError && tagFetchError.code !== 'PGRST116') { // Not found is OK
            console.error('Error fetching tag:', tagFetchError);
          }
            
          if (existingTag) {
            tagId = existingTag.id;
          } else {
            // Create new tag
            const { data: newTag, error: tagInsertError } = await supabase
              .from('tags')
              .insert({ tag: tagName })
              .select('id')
              .single();
            
            if (tagInsertError) {
              console.error('Error creating tag:', tagInsertError);
              continue;
            }
              
            if (!newTag) continue;
            tagId = newTag.id;
          }
          
          // Link tag to phrase
          const { error: linkError } = await supabase
            .from('phrase_tags')
            .insert({
              phrase_id: phraseData.id,
              tag_id: tagId
            });
          
          if (linkError) {
            console.error('Error linking tag to phrase:', linkError);
          }
        }
      }
      
      // Update phrase with saved flag and return to selection screen
      const updatedPhrase = {
        ...editedPhrase,
        saved: true,
        edited: true,
        dbId: phraseData.id // Keep reference to the database ID
      };
      
      onSave(updatedPhrase);
      
    } catch (error) {
      console.error('Error saving phrase:', error);
      alert('Failed to save phrase. See console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Edit Word</h2>
        <button
          onClick={onCancel}
          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
        >
          Back to Selection
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-1">Word</label>
        <div className="p-3 rounded bg-gray-700 text-white">
          {editedPhrase.phrase}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-1">Difficulty</label>
        <select
          value={editedPhrase.difficulty || 2}
          onChange={(e) => handleUpdateField('difficulty', parseInt(e.target.value, 10))}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
        >
          {[1, 2, 3].map((value, index) => (
            <option key={value} value={value}>
              {DIFFICULTY_OPTIONS[index]}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-1">Category</label>
        <select
          value={editedPhrase.category || ''}
          onChange={(e) => handleUpdateField('category', e.target.value)}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-1">Subcategory</label>
        <select
          value={editedPhrase.subcategory || ''}
          onChange={(e) => handleUpdateField('subcategory', e.target.value)}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
          disabled={!editedPhrase.category}
        >
          <option value="">Select Subcategory</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory} value={subcategory}>
              {subcategory}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-1">Tags</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={editedPhrase.tags || ''}
            onChange={(e) => handleUpdateField('tags', e.target.value)}
            className="flex-1 p-3 rounded bg-gray-700 text-white border border-gray-600"
            placeholder="Comma-separated tags"
          />
          <button
            onClick={handleGenerateTags}
            className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700"
          >
            🤖 AI
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Enter up to 3 tags separated by commas</p>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-1">Hint</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={editedPhrase.hint || ''}
            onChange={(e) => handleUpdateField('hint', e.target.value)}
            className="flex-1 p-3 rounded bg-gray-700 text-white border border-gray-600"
            placeholder="Optional hint"
          />
          <button
            onClick={handleGenerateHint}
            className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700"
          >
            🤖 AI
          </button>
        </div>
      </div>
      
      <button
        onClick={handleSavePhrase}
        disabled={isSaving}
        className="w-full p-3 rounded bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {isSaving ? 
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </div>
          : phrase.saved ? 'Update Word' : 'Save Word'
        }
      </button>
    </div>
  );
};

export default PhraseEditor;
