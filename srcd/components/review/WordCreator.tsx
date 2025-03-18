// components/reviewer/WordCreator.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/services/supabase';
import { generatePhrases, generateTags, generateHint, suggestCategory } from '@/lib/services/claudeService';
import type { Reviewer, Phrase } from '@/types/types';

// Safe storage utility
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
      return false;
    }
  }
};

interface WordCreatorProps {
  reviewer: Reviewer;
  categories: string[];
  onSwitchMode: () => void;
}

interface GeneratedPhrase {
  id: string;
  phrase: string;
  hint?: string;
  category?: string;
  difficulty?: number;
  tags?: string;
  saved?: boolean;
}

enum CreationStep {
  GENERATE,
  SELECT,
  EDIT
}

const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];

const WordCreator: React.FC<WordCreatorProps> = ({ reviewer, categories, onSwitchMode }) => {
  // State
  const [step, setStep] = useState(CreationStep.GENERATE);
  const [inspiration, setInspiration] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPhrases, setGeneratedPhrases] = useState<GeneratedPhrase[]>([]);
  const [selectedPhrase, setSelectedPhrase] = useState<GeneratedPhrase | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);
  
  // Helper function to convert text to title case
  const toTitleCase = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Format tags to ensure comma-separated format
  const formatTags = (tagInput: string): string => {
    // First convert any whitespace to a single space
    const normalized = tagInput.replace(/\s+/g, ' ').trim();
    
    // Split by spaces or commas
    const tagArray = normalized.split(/[\s,]+/).filter(Boolean);
    
    // Join back with commas
    return tagArray.join(',');
  };
  
  // Load previous inspiration from storage if available
  useEffect(() => {
    const savedInspiration = safeStorage.getItem('lastInspiration');
    if (savedInspiration) {
      setInspiration(savedInspiration);
    }
  }, []);

  const handleInspirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInspiration(e.target.value);
    safeStorage.setItem('lastInspiration', e.target.value);
  };

  const handleGeneratePhrases = async () => {
    if (!inspiration || isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generatePhrases(inspiration, 10);
      
      // Transform the result into our format with title case
      const phrases: GeneratedPhrase[] = result.phrases.map((phrase: string, index: number) => ({
        id: `new-${Date.now()}-${index}`,
        phrase: toTitleCase(phrase),
        difficulty: 2, // Default to medium
        saved: false,
      }));
      
      setGeneratedPhrases(phrases);
      setStep(CreationStep.SELECT);
    } catch (error) {
      console.error('Error generating phrases:', error);
      alert('Failed to generate phrases. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPhrase = (phrase: GeneratedPhrase) => {
    setSelectedPhrase(phrase);
    setStep(CreationStep.EDIT);
  };

  const handleStartOver = () => {
    setGeneratedPhrases([]);
    setSelectedPhrase(null);
    setStep(CreationStep.GENERATE);
  };

  const handleUpdateSelectedPhrase = (field: keyof GeneratedPhrase, value: string | number) => {
    if (!selectedPhrase) return;
    
    setSelectedPhrase(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

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
  const handleUpdateHint = (hintText: string) => {
    if (!selectedPhrase) return;
    
    // Only limit the length but don't trim during typing
    // This preserves spaces while typing
    const limitedHint = hintText.length > 20 ? hintText.substring(0, 20) : hintText;
    
    setSelectedPhrase(prev => {
      if (!prev) return null;
      return { ...prev, hint: limitedHint };
    });
  };
    const handleGenerateTags = async () => {
    if (!selectedPhrase) return;
    
    try {
      const result = await generateTags(selectedPhrase.phrase);
      if (result.tags.length > 0) {
        handleUpdateSelectedPhrase('tags', result.tags.join(','));
      }
    } catch (error) {
      console.error('Error generating tags:', error);
    }
  };

  const handleSuggestCategory = async () => {
    if (!selectedPhrase) return;
    
    try {
      // Show loading state
      setIsSuggestingCategory(true);
      
      // Call the suggestCategory function
      const result = await suggestCategory(selectedPhrase.phrase, categories);
      
      if (result.category && !result.error) {
        handleUpdateSelectedPhrase('category', result.category);
      } else if (result.error) {
        console.error('Error suggesting category:', result.error);
        alert('Failed to suggest a category. Please try again or select manually.');
      }
    } catch (error) {
      console.error('Error suggesting category:', error);
      alert('Failed to suggest category. Please try again.');
    } finally {
      setIsSuggestingCategory(false);
    }
  };

  const handleSavePhrase = async () => {
    if (!selectedPhrase || !reviewer) return;
    
    setIsSaving(true);
    
    try {
      // Log what we're trying to save
      console.log("Saving phrase:", selectedPhrase);
      
      // Get category ID
      let categoryId = null;
      
      if (selectedPhrase.category) {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', selectedPhrase.category)
          .single();
        
        if (catError) {
          console.error('Error fetching category:', catError);
          throw new Error(`Category error: ${catError.message}`);
        }
          
        if (catData) {
          categoryId = catData.id;
        }
      }
      
      // Create a phrase object with only the fields that exist in your database schema
      const phraseData = {
        phrase: selectedPhrase.phrase,
        hint: selectedPhrase.hint || null,
        difficulty: selectedPhrase.difficulty || 2,
        category_id: categoryId,
        // No created_by field in your schema
        // No created_at field in your schema
      };

      
      
      console.log("Inserting phrase with data:", phraseData);
      
      // Insert the phrase
      const { data, error: phraseError } = await supabase
        .from('phrases')
        .insert(phraseData)
        .select('id')
        .single();
        
      if (phraseError) {
        console.error('Phrase insert error details:', phraseError);
        throw phraseError;
      }
      
      if (!data || !data.id) {
        throw new Error('No data returned from phrase insert');
      }
      
      // Handle tags if any
      if (selectedPhrase.tags && data) {
        const tagList = selectedPhrase.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        
        for (const tagName of tagList) {
          // Check if tag exists
          let tagId;
          
          try {
            const { data: existingTag, error: tagFetchError } = await supabase
              .from('tags')
              .select('id')
              .eq('tag', tagName)
              .single();
            
            if (tagFetchError) {
              if (tagFetchError.code === 'PGRST116') { // Not found
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
              } else {
                console.error('Error fetching tag:', tagFetchError);
                continue;
              }
            } else if (existingTag) {
              tagId = existingTag.id;
            }
            
            // Link tag to phrase
            const { error: linkError } = await supabase
              .from('phrase_tags')
              .insert({
                phrase_id: data.id,
                tag_id: tagId
              });
            
            if (linkError) {
              console.error('Error linking tag to phrase:', linkError);
            }
          } catch (tagError) {
            console.error('Error processing tag:', tagError);
            // Continue with next tag even if this one fails
          }
        }
      }
      
      // Mark as saved in our local state
      setGeneratedPhrases(prev => 
        prev.map(p => p.id === selectedPhrase.id ? { ...p, saved: true } : p)
      );
      
      // Return to selection screen
      setStep(CreationStep.SELECT);
      setSelectedPhrase(null);
      
      // Show success message
      alert('Word saved successfully!');
      
    } catch (error) {
      console.error('Error saving phrase (full details):', error);
      alert(`Failed to save phrase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Render the phrase generation form
  const renderGenerationForm = () => (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Create New Words</h2>
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-2">Provide Inspiration</label>
        <input
          type="text"
          value={inspiration}
          onChange={handleInspirationChange}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
          placeholder="Enter a topic, theme, or idea..."
        />
      </div>
      <button
        onClick={handleGeneratePhrases}
        disabled={!inspiration || isGenerating}
        className="w-full p-3 rounded bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {isGenerating ? 
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </div>
          : '🤖 Generate Words'
        }
      </button>
    </div>
  );

  // Render the phrase selection grid
  const renderPhraseSelection = () => {
    const savedCount = generatedPhrases.filter(p => p.saved).length;
    
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Select Word to Add</h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-300">
              <span className="text-green-500 font-medium">{savedCount}</span> of {generatedPhrases.length} saved
            </div>
            <button
              onClick={handleStartOver}
              className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
            >
              Start Over
            </button>
          </div>
        </div>
        
        <div 
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
        >
          {generatedPhrases.map((phrase) => (
            <div 
              key={phrase.id}
              onClick={() => handleSelectPhrase(phrase)}
              className={`${phrase.saved ? 'bg-gray-700 text-gray-400' : 'bg-gray-800 text-white'} 
                p-4 rounded-lg cursor-pointer text-center transition-colors duration-200 min-h-40
                flex flex-col justify-center hover:scale-105 transform`}
            >
              <h3 className="text-lg font-bold mb-2">{phrase.phrase}</h3>
              
              {phrase.saved && (
                <div className="flex justify-center items-center mt-2">
                  <span className="text-xs px-2 py-1 bg-green-600 rounded-full text-white">
                    Saved
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the edit form for a selected phrase
  const renderEditForm = () => {
    if (!selectedPhrase) return null;
    
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Word</h2>
          <button
            onClick={() => {
              setStep(CreationStep.SELECT);
              setSelectedPhrase(null);
            }}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
          >
            Back to Selection
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">Word</label>
          <div className="p-3 rounded bg-gray-700 text-white">
            {selectedPhrase.phrase}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">Difficulty</label>
          <select
            value={selectedPhrase.difficulty || 2}
            onChange={(e) => handleUpdateSelectedPhrase('difficulty', parseInt(e.target.value, 10))}
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
          <div className="flex gap-2">
            <select
              value={selectedPhrase.category || ''}
              onChange={(e) => handleUpdateSelectedPhrase('category', e.target.value)}
              className="flex-1 p-3 rounded bg-gray-700 text-white border border-gray-600"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              onClick={handleSuggestCategory}
              className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
              title="Get AI suggestion for best category"
              disabled={isSuggestingCategory}
            >
              {isSuggestingCategory ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                "🤖 AI"
              )}
            </button>
          </div>
        </div>
        
        {/* Subcategory field removed */}
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={selectedPhrase.tags || ''}
              onChange={(e) => handleUpdateSelectedPhrase('tags', formatTags(e.target.value))}
              onBlur={(e) => {
                // Format on blur to ensure comma-separation
                const formattedValue = formatTags(e.target.value);
                if (formattedValue !== e.target.value) {
                  handleUpdateSelectedPhrase('tags', formattedValue);
                }
              }}
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
    <div className="flex-1 relative">
      <input
        type="text"
        value={selectedPhrase.hint || ''}
        onChange={(e) => handleUpdateHint(e.target.value)}
        maxLength={20}
        className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
        placeholder="Enter a hint"
      />
      <div className="absolute bottom-1 right-2 text-xs text-gray-400">
        {selectedPhrase.hint ? selectedPhrase.hint.length : 0}/20
      </div>
    </div>
    <button
      onClick={handleGenerateHint}
      className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700"
    >
      🤖 AI
    </button>
  </div>
  <p className="text-xs text-gray-400 mt-1">Maximum 20 characters</p>
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
            : selectedPhrase.saved ? 'Update Word' : 'Save Word'
          }
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Word Creator</h1>
            <p className="text-gray-400 mt-1">
              Reviewer: {reviewer.name}
            </p>
          </div>
          <button
            onClick={onSwitchMode}
            className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
          >
            Back to Review
          </button>
        </div>

        {step === CreationStep.GENERATE && renderGenerationForm()}
        {step === CreationStep.SELECT && renderPhraseSelection()}
        {step === CreationStep.EDIT && renderEditForm()}
      </div>
    </div>
  );
};

export default WordCreator;
