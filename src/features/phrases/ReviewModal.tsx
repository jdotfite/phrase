'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { supabase } from '@/lib/services/supabase';
import { usePhrases } from '@/features/data/hooks/usePhrases';
import { generateTags, generateHint } from '@/lib/services/claudeService';


interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewer: Reviewer;
  selectedPhraseId?: number | null;
}

interface EditedPhrase {
  id: number;
  category: string | undefined;
  hint?: string | undefined;
  difficulty?: number | undefined;
  tags?: string[] | undefined;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  reviewer,
  selectedPhraseId 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [isFlagged, setIsFlagged] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [editedPhrase, setEditedPhrase] = useState<EditedPhrase>({
    id: -1,
    category: undefined,
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

  // Fetch categories on load
  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategoriesFromHook();
      if (fetchedCategories) {
        setCategories(fetchedCategories);
      }
    };
    loadCategories();
  }, [fetchCategoriesFromHook]);

  // Reset current index when modal opens or filter changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsFlagged(false);
      setHasChanges(false);
      
      // Get the reviewer's streak from local storage or set it to 0
      const savedStreak = localStorage.getItem(`reviewer-streak-${reviewer.id}`);
      if (savedStreak) {
        setStreak(parseInt(savedStreak));
      } else {
        setStreak(0);
      }
    }
  }, [isOpen, selectedCategory, reviewer.id]);

  useEffect(() => {
    if (isOpen && selectedPhraseId && phrases.length > 0) {
      const index = phrases.findIndex(p => p.id === selectedPhraseId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [isOpen, selectedPhraseId, phrases]);
  // Check if current phrase is flagged
  useEffect(() => {
    const checkFlagged = async () => {
      if (!phrases[currentIndex] || !reviewer) return;
      
      try {
        const { data, error } = await supabase
          .from('votes')
          .select('*')
          .eq('reviewer_id', reviewer.id)
          .eq('phrase_id', phrases[currentIndex].id)
          .eq('category', 'phrase')
          .eq('vote', false)
          .maybeSingle();
          
        setIsFlagged(!!data);
      } catch (err) {
        console.error('Error checking flag status:', err);
      }
    };
    
    checkFlagged();
  }, [phrases, currentIndex, reviewer]);

  // Check if phrase is already approved
  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (!phrases[currentIndex] || !reviewer) return;
      
      try {
        const { data, error } = await supabase
          .from('votes')
          .select('*')
          .eq('reviewer_id', reviewer.id)
          .eq('phrase_id', phrases[currentIndex].id)
          .eq('category', 'phrase')
          .eq('vote', true)
          .maybeSingle();
          
        setIsApproved(!!data);
      } catch (err) {
        console.error('Error checking approval status:', err);
      }
    };
    
    checkApprovalStatus();
  }, [phrases, currentIndex, reviewer]);

  // Load current phrase data
  useEffect(() => {
    const loadPhraseData = async () => {
      if (!phrases[currentIndex]) return;
      
      const currentPhrase = phrases[currentIndex];
      
      if (currentPhrase) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('name')
          .eq('id', currentPhrase.category_id)
          .single();

        // Get tags as array
        let tagsArray: string[] = [];
        if (currentPhrase.tags) {
          tagsArray = currentPhrase.tags.split(',').map(tag => tag.trim());
        }

        setEditedPhrase({
          id: currentPhrase.id,
          category: categoryData?.name || undefined,
          hint: currentPhrase.hint || undefined,
          difficulty: currentPhrase.difficulty || undefined,
          tags: tagsArray
        });
        
        setHasChanges(false);
      }
    };

    loadPhraseData();
  }, [phrases, currentIndex]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // If "all" is selected, pass empty string to filter function
    handleFilterChange('category', category === 'all' ? '' : category);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Increment and manage streak
  const incrementStreak = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem(`reviewer-streak-${reviewer.id}`, newStreak.toString());
    
    // Check if we've hit a milestone (10)
    if (newStreak >= 10) {
      setShowCelebration(true);
      
      // Reset streak after celebration
      setTimeout(() => {
        setStreak(0);
        localStorage.setItem(`reviewer-streak-${reviewer.id}`, '0');
        setShowCelebration(false);
      }, 3000);
    }
    
    // Update reviewer streak in database
    supabase
      .from('reviewers')
      .update({
        current_streak: newStreak % 10, // Keep it within 0-9
        last_review_at: new Date().toISOString()
      })
      .eq('id', reviewer.id)
      .then(() => {})
      .catch(err => console.error('Error updating streak:', err));
  };

  const handleFlag = async () => {
    if (!reviewer || !phrases[currentIndex]) return;
    
    const newFlagState = !isFlagged;
    setIsFlagged(newFlagState);
    
    try {
      if (newFlagState) {
        const { error } = await supabase
          .from('votes')
          .insert({
            reviewer_id: reviewer.id,
            phrase_id: phrases[currentIndex].id,
            category: 'phrase',
            vote: false,
            created_at: new Date().toISOString()
          });
          
        if (error) {
          setIsFlagged(!newFlagState);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('reviewer_id', reviewer.id)
          .eq('phrase_id', phrases[currentIndex].id)
          .eq('category', 'phrase')
          .eq('vote', false);
          
        if (error) {
          setIsFlagged(!newFlagState);
          throw error;
        }
      }
    } catch (err) {
      console.error('Error toggling flag:', err);
    }
  };

  const handleFieldChange = (field: keyof EditedPhrase, value: any) => {
    setEditedPhrase(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...(editedPhrase.tags || ['', '', ''])];
    while (newTags.length < 3) newTags.push('');
    
    newTags[index] = value.trim();
    handleFieldChange('tags', newTags);
  };

  const handleGenerateTags = async () => {
    if (!phrases[currentIndex]?.phrase) return;

    setIsGeneratingTags(true);
    try {
      const result = await generateTags(phrases[currentIndex].phrase);
      if (result.tags.length > 0) {
        const newTags = result.tags.slice(0, 3);
        while (newTags.length < 3) newTags.push('');
        handleFieldChange('tags', newTags);
      }
    } catch (error) {
      console.error('Error generating tags:', error);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleGenerateHint = async () => {
    if (!phrases[currentIndex]?.phrase) return;
  
    setIsGeneratingHint(true);
    try {
      const result = await generateHint(phrases[currentIndex].phrase);
      if (result.hint) {
        handleFieldChange('hint', result.hint);
      }
    } catch (error) {
      console.error('Error generating hint:', error);
    } finally {
      setIsGeneratingHint(false);
    }
  };

  const handleApprove = async () => {
    if (!reviewer || !phrases[currentIndex]) return;
    
    setIsApproving(true);
    
    try {
      // Save any changes first if needed
      if (hasChanges) {
        await handleSave();
      }
      
      // Add or update the approval vote
      const { error } = await supabase
        .from('votes')
        .upsert({
          reviewer_id: reviewer.id,
          phrase_id: phrases[currentIndex].id,
          category: 'phrase',
          vote: true,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Set as approved
      setIsApproved(true);
      
      // Increment streak
      incrementStreak();
      
      // Move to next phrase if not at the end
      if (currentIndex < phrases.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error approving phrase:', err);
    } finally {
      setIsApproving(false);
    }
  };
  
  // Original save function for changes only
  const handleSave = async () => {
    if (!editedPhrase.id || editedPhrase.id === -1) return;

    try {
      // Get category ID
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', editedPhrase.category)
        .single();
        
      if (!categoryData) throw new Error('Category not found');
      const categoryId = categoryData.id;
      
      // Update phrase
      const { error: phraseError } = await supabase
        .from('phrases')
        .update({
          hint: editedPhrase.hint,
          difficulty: editedPhrase.difficulty,
          category_id: categoryId,
          subcategory_id: null
        })
        .eq('id', editedPhrase.id);

      if (phraseError) throw phraseError;

      // Handle tags
      if (editedPhrase.tags) {
        const newTags = editedPhrase.tags.filter(Boolean);
        
        // Get existing tags
        const { data: existingTagsData } = await supabase
          .from('phrase_tags')
          .select('tags(id, tag)')
          .eq('phrase_id', editedPhrase.id);

        const existingTags = existingTagsData?.map((pt: any) => pt.tags.tag) || [];

        // Remove tags that are no longer present
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

        // Add new tags
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
      throw err;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-black border border-neutral-800 max-h-[90vh] overflow-y-auto p-6 pt-10">
        <DialogTitle className="sr-only">Review Phrases</DialogTitle>
        <DialogDescription className="sr-only">Review and approve phrases for your collection</DialogDescription>
        
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">Phrase Review</h2>
            <p className="text-sm text-neutral-400">Reviewer: {reviewer.name} ({reviewer.total_reviews || 0} reviews)</p>
          </div>
          
          <Select value={selectedCategory} onValueChange={handleCategorySelect}>
            <SelectTrigger className="w-[180px] bg-transparent border-neutral-700 text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-black border border-neutral-700 text-white">
              <SelectItem value="all" className="hover:bg-neutral-800">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem 
                  key={category} 
                  value={category}
                  className="hover:bg-neutral-800"
                >{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Review Hot Streak */}
        <div className="mb-5 space-y-1">
          <div className="text-sm text-neutral-400">Review Hot Streak: {streak}</div>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
              style={{ width: `${(streak % 10) * 10}%` }}
            ></div>
          </div>
        </div>
        
        {/* Celebration Overlay */}
        {showCelebration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="text-center p-8 bg-black border-2 border-orange-500 rounded-lg">
              <div className="text-4xl mb-4">🎉 🔥 🎉</div>
              <h3 className="text-2xl font-bold text-white mb-2">Hot Streak Complete!</h3>
              <p className="text-xl text-orange-400">You reviewed 10 phrases!</p>
            </div>
          </div>
        )}
        
        {phrasesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
          </div>
        ) : phrases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-300 mb-4">No phrases available for review.</p>
            <Button 
              onClick={onClose}
              className="bg-neutral-100 text-black hover:bg-white"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Phrase Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-neutral-400">Phrase</label>
                <Button
                  onClick={handleFlag}
                  variant="ghost"
                  size="sm"
                  className={`h-7 text-xs ${isFlagged ? 'text-red-500' : 'text-neutral-400 hover:text-white'}`}
                >
                  <Flag className="h-3.5 w-3.5 mr-1" />
                  Flag for Removal
                </Button>
              </div>
              <Input
                type="text"
                value={phrases[currentIndex]?.phrase || ''}
                readOnly
                className="bg-transparent border-neutral-700 text-white focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md"
              />
            </div>
            
            {/* Difficulty */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Difficulty</label>
              <Select
                value={editedPhrase.difficulty?.toString() || '1'}
                onValueChange={(value) => handleFieldChange('difficulty', parseInt(value))}
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
              <label className="block text-sm text-neutral-400 mb-2">Category</label>
              <Select
                value={editedPhrase.category || ''}
                onValueChange={(value) => handleFieldChange('category', value)}
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
                  disabled={isGeneratingTags}
                >
                  {isGeneratingTags ? "..." : "🤖 Ask AI"}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Input
                    key={`tag-${index}`}
                    type="text"
                    value={editedPhrase.tags?.[index] || ''}
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
                  disabled={isGeneratingHint}
                >
                  {isGeneratingHint ? "..." : "🤖 Ask AI"}
                </Button>
              </div>
              <Input
                type="text"
                value={editedPhrase.hint || ''}
                onChange={(e) => handleFieldChange('hint', e.target.value)}
                className="bg-transparent border-neutral-700 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-neutral-800">
                <div className="flex items-center gap-1 border border-neutral-700 rounded-md">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    variant="ghost"
                    className="h-10 px-2 text-neutral-300 hover:bg-neutral-800 hover:text-white disabled:opacity-50 border-r border-neutral-700 rounded-r-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3 text-neutral-400 text-sm">
                    {currentIndex + 1} / {phrases.length}
                  </span>
                  <Button
                    onClick={handleNext}
                    disabled={currentIndex === phrases.length - 1}
                    variant="ghost"
                    className="h-10 px-2 text-neutral-300 hover:bg-neutral-800 hover:text-white disabled:opacity-50 border-l border-neutral-700 rounded-l-none"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button
                  onClick={handleApprove}
                  className={isApproved 
                    ? "bg-neutral-700 text-white hover:bg-neutral-600" 
                    : "bg-white text-black hover:bg-neutral-200"}
                  disabled={isApproving}
                >
                  {isApproving ? 'Approving...' : isApproved ? 'Approved' : 'Approve'}
                </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;