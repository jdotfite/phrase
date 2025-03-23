'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/services/supabase';
import { generateTags, generateHint, generatePhrases, suggestCategory } from '@/lib/services/claudeService';
import type { Reviewer } from '@/types/types';

interface WordCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewer: Reviewer;
  onWordAdded?: (id?: number) => void;
}

interface NewWord {
  phrase: string;
  category: string;
  difficulty: number;
  hint?: string;
  tags: string[];
}

const WordCreatorModal: React.FC<WordCreatorModalProps> = ({
  isOpen,
  onClose,
  reviewer,
  onWordAdded
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [inspiration, setInspiration] = useState('');
  const [newWord, setNewWord] = useState<NewWord>({
    phrase: '',
    category: '',
    difficulty: 1,
    hint: '',
    tags: ['', '', '']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);
  const [isGeneratingCategory, setIsGeneratingCategory] = useState(false);
  const [generatedWords, setGeneratedWords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [wordGenerated, setWordGenerated] = useState(false);

  // Fetch categories on load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .order('name');
        
        if (error) throw error;
        if (data) setCategories(data.map(c => c.name));
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setInspiration('');
      setNewWord({
        phrase: '',
        category: '',
        difficulty: 1,
        hint: '',
        tags: ['', '', '']
      });
      setError(null);
      setSuccess(null);
      setWordGenerated(false);
      setGeneratedWords([]);
    }
  }, [isOpen]);

  const handleChange = (field: keyof NewWord, value: string | number | string[]) => {
    setNewWord(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...newWord.tags];
    newTags[index] = value.trim().replace(/\s+/g, '');
    handleChange('tags', newTags);
  };

  const handleGenerateTags = async () => {
    if (!newWord.phrase) {
      setError('Please generate a phrase first');
      return;
    }

    setIsGeneratingTags(true);
    try {
      const result = await generateTags(newWord.phrase);
      if (result.tags.length > 0) {
        const aiTags = result.tags.slice(0, 3);
        const newTags = [...aiTags, ...Array(3 - aiTags.length).fill('')];
        handleChange('tags', newTags);
      }
    } catch (error) {
      console.error('Error generating tags:', error);
      setError('Failed to generate tags');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleGenerateHint = async () => {
    if (!newWord.phrase) {
      setError('Please generate a phrase first');
      return;
    }

    setIsGeneratingHint(true);
    try {
      const result = await generateHint(newWord.phrase);
      if (result.hint) {
        handleChange('hint', result.hint);
      }
    } catch (error) {
      console.error('Error generating hint:', error);
      setError('Failed to generate hint');
    } finally {
      setIsGeneratingHint(false);
    }
  };

  const handleGenerateWords = async () => {
    if (!inspiration) {
      setError('Please enter some inspiration first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Use the real Claude API to generate phrases
      const result = await generatePhrases(inspiration, 5);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.phrases.length > 0) {
        setGeneratedWords(result.phrases);
        
        // Select the first generated word
        const firstPhrase = result.phrases[0];
        
        // Generate tags and hint for the selected phrase
        setIsGeneratingTags(true);
        setIsGeneratingHint(true);
        
        try {
          const [tagsResult, hintResult] = await Promise.all([
            generateTags(firstPhrase),
            generateHint(firstPhrase)
          ]);
          
          setNewWord(prev => ({
            ...prev,
            phrase: firstPhrase,
            hint: hintResult.hint || '',
            tags: tagsResult.tags.slice(0, 3)
          }));
        } catch (error) {
          console.error('Error generating tags/hint:', error);
          // Fallback values if API calls fail
          setNewWord(prev => ({
            ...prev,
            phrase: firstPhrase,
            hint: `Information about ${inspiration}`,
            tags: [`${inspiration}`, 'new', 'word']
          }));
        } finally {
          setIsGeneratingTags(false);
          setIsGeneratingHint(false);
        }
        
        setWordGenerated(true);
      } else {
        setError('No phrases were generated. Please try again with different inspiration.');
      }
    } catch (error) {
      console.error('Error generating phrases:', error);
      setError('Failed to generate phrases. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectWord = async (phrase: string) => {
    // Update the word with the selected phrase
    setNewWord(prev => ({
      ...prev,
      phrase
    }));
    
    // Set loading states
    setIsGeneratingTags(true);
    setIsGeneratingHint(true);
    setIsGeneratingCategory(true);
    
    try {
      // Generate tags, hint and category for the selected phrase using Claude
      const [tagsResult, hintResult, categoryResult] = await Promise.all([
        generateTags(phrase),
        generateHint(phrase),
        suggestCategory(phrase, categories)
      ]);
      
      setNewWord(prev => ({
        ...prev,
        hint: hintResult.hint || '',
        tags: tagsResult.tags.slice(0, 3),
        category: categoryResult.category || prev.category
      }));
    } catch (error) {
      console.error('Error generating phrase metadata:', error);
      // Fallback values if API calls fail
      const words = phrase.split(/\s+/);
      setNewWord(prev => ({
        ...prev,
        hint: `About ${words[0]?.toLowerCase() || phrase}`,
        tags: [
          words[0]?.toLowerCase() || 'general',
          phrase.length > 6 ? 'complex' : 'simple',
          words.length > 1 ? 'multi' : 'single'
        ]
      }));
    } finally {
      // Reset loading states
      setIsGeneratingTags(false);
      setIsGeneratingHint(false);
      setIsGeneratingCategory(false);
      
      // Set word as generated
      setWordGenerated(true);
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!newWord.phrase) {
      setError('Please enter or generate a phrase');
      return;
    }
    if (!newWord.category) {
      setError('Please select a category');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get category ID
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', newWord.category)
        .single();
      
      if (!categoryData) {
        throw new Error('Category not found');
      }
      
      // Insert phrase
      const { data: phraseData, error: phraseError } = await supabase
        .from('phrases')
        .insert({
          phrase: newWord.phrase,
          category_id: categoryData.id,
          subcategory_id: null, // No subcategory
          difficulty: newWord.difficulty,
          hint: newWord.hint || null,
          created_by: reviewer.id,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (phraseError) throw phraseError;
      
      // Process tags
      const validTags = newWord.tags.filter(Boolean);
      for (const tag of validTags) {
        // Check if tag exists
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('tag', tag)
          .single();
          
        let tagId;
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          // Create new tag
          const { data: newTag } = await supabase
            .from('tags')
            .insert({ tag })
            .select('id')
            .single();
            
          if (newTag) tagId = newTag.id;
        }
        
        // Link tag to phrase
        if (tagId && phraseData) {
          await supabase
            .from('phrase_tags')
            .insert({
              phrase_id: phraseData.id,
              tag_id: tagId
            });
        }
      }
      
      // Update reviewer stats
      await supabase
        .from('reviewers')
        .update({
          total_reviews: reviewer.total_reviews + 1,
          last_review_at: new Date().toISOString()
        })
        .eq('id', reviewer.id);
      
      setSuccess('Word added successfully');
      
      // Reset form but keep inspiration
      setTimeout(() => {
        setNewWord({
          phrase: '',
          category: '',
          difficulty: 1,
          hint: '',
          tags: ['', '', '']
        });
        setSuccess(null);
        setWordGenerated(false);
        
        if (onWordAdded) {
          // Pass the ID if available
          if (phraseData && phraseData.id) {
            onWordAdded(phraseData.id);
          } else {
            // Or call without an ID if not available
            onWordAdded();
          }
        }
      }, 1500);
      
    } catch (err) {
      console.error('Error adding word:', err);
      setError('Failed to add word');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-black border border-neutral-800 max-h-[90vh] overflow-y-auto p-6 pt-10">
        <DialogTitle className="sr-only">Word Creator</DialogTitle>
        <DialogDescription className="sr-only">Create new phrases for your collection</DialogDescription>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Word Creator</h2>
          <p className="text-sm text-neutral-400">Reviewer: {reviewer.name}</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 rounded bg-red-900/30 border border-red-700 text-red-300 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 rounded bg-green-900/30 border border-green-700 text-green-300 text-sm">
            {success}
          </div>
        )}
        
        <div className="space-y-4">
          {/* Inspiration Field */}
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Provide Inspiration</label>
            <div className="flex gap-2">
              <Input
                value={inspiration}
                onChange={(e) => setInspiration(e.target.value)}
                placeholder="Enter a theme, topic, or concept"
                className="bg-transparent border-neutral-700 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                onClick={handleGenerateWords}
                disabled={isGenerating || !inspiration}
                className="bg-white text-black hover:bg-neutral-200 whitespace-nowrap"
              >
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <>🤖 Generate Phrase</>
                )}
              </Button>
            </div>
          </div>
          
          {/* Generated Words List (shown after generation) */}
          {generatedWords.length > 0 && (
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Select a Phrase</label>
              <div className="grid grid-cols-1 gap-2 mb-4">
                {generatedWords.map((phrase, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`justify-start text-left p-3 border-neutral-700 ${newWord.phrase === phrase ? 'bg-neutral-800 border-blue-500' : 'bg-transparent hover:bg-neutral-800'}`}
                    onClick={() => handleSelectWord(phrase)}
                  >
                    {phrase}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Phrase Field */}
          {wordGenerated && (
            <>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Phrase</label>
                <Input
                  value={newWord.phrase}
                  onChange={(e) => handleChange('phrase', e.target.value)}
                  className="bg-transparent border-neutral-700 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              {/* Difficulty */}
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Difficulty</label>
                <Select
                  value={newWord.difficulty.toString()}
                  onValueChange={(value) => handleChange('difficulty', parseInt(value))}
                >
                  <SelectTrigger className="bg-transparent border-neutral-700 text-white">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border border-neutral-700 text-white">
                    <SelectItem value="1" className="hover:bg-neutral-800">Easy</SelectItem>
                    <SelectItem value="2" className="hover:bg-neutral-800">Medium</SelectItem>
                    <SelectItem value="3" className="hover:bg-neutral-800">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Category */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-neutral-400">Category</label>
                  {isGeneratingCategory && (
                    <span className="text-xs text-neutral-400">
                      <Loader2 className="inline h-3 w-3 animate-spin mr-1" /> 
                      AI selecting...
                    </span>
                  )}
                </div>
                <Select
                  value={newWord.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger className="bg-transparent border-neutral-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border border-neutral-700 text-white">
                    {categories.map(category => (
                      <SelectItem 
                        key={category} 
                        value={category}
                        className="hover:bg-neutral-800"
                      >{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newWord.category && (
                  <p className="text-xs text-neutral-400 mt-1">
                    Category selected by AI based on the phrase content
                  </p>
                )}
              </div>
              
              {/* Tags */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-neutral-400">Tags</label>
                  <Button 
                    onClick={handleGenerateTags}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-neutral-400 hover:text-white"
                    disabled={isGeneratingTags || !newWord.phrase}
                  >
                    {isGeneratingTags ? "..." : "🤖 Ask AI"}
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Input
                      key={`tag-${index}`}
                      type="text"
                      value={newWord.tags[index] || ''}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      className="bg-transparent border-neutral-700 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder={`Tag ${index + 1}`}
                      maxLength={16}
                    />
                  ))}
                </div>
              </div>
              
              {/* Hint */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-neutral-400">Hint</label>
                  <Button 
                    onClick={handleGenerateHint}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-neutral-400 hover:text-white"
                    disabled={isGeneratingHint || !newWord.phrase}
                  >
                    {isGeneratingHint ? "..." : "🤖 Ask AI"}
                  </Button>
                </div>
                <Input
                  type="text"
                  value={newWord.hint || ''}
                  onChange={(e) => handleChange('hint', e.target.value)}
                  className="bg-transparent border-neutral-700 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end pt-4 mt-4 border-t border-neutral-800">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !newWord.phrase || !newWord.category}
                  className="bg-white text-black hover:bg-neutral-200"
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                  ) : (
                    'Add Word'
                  )}
                </Button>
              </div>
            </>
          )}
          
          {!wordGenerated && !isGenerating && generatedWords.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
              <p className="mb-2">Enter some inspiration and click Generate</p>
              <p className="text-sm">Example: "medical terms", "sports activities", "cooking verbs"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WordCreatorModal;