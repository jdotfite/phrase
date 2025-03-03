// components/reviewer/WordCreator.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { generatePhrases, generateTags, generateHint } from '@/lib/claudeService';
import type { Reviewer, Phrase } from '@/types/types';
import './CardSwiper.css';

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
  subcategory?: string;
  difficulty?: number;
  tags?: string;
  saved?: boolean;
}

const difficultyOptions = ['Easy', 'Medium', 'Hard'];
const wordCountOptions = [5, 10, 15];

const WordCreator: React.FC<WordCreatorProps> = ({ reviewer, categories, onSwitchMode }) => {
  const [inspiration, setInspiration] = useState('');
  const [wordCount, setWordCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedCard, setSelectedCard] = useState<GeneratedPhrase | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [generatedPhrases, setGeneratedPhrases] = useState<GeneratedPhrase[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const swiper = useRef<{
    currentCard: HTMLElement | null;
    startX: number;
    pullDeltaX: number;
    animating: boolean;
    updateStyles: () => void;
  }>({
    currentCard: null,
    startX: 0,
    pullDeltaX: 0,
    animating: false,
    updateStyles: () => {}
  });

  // Initialize previous inspiration from storage if available
  useEffect(() => {
    const savedInspiration = safeStorage.getItem('lastInspiration');
    if (savedInspiration) {
      setInspiration(savedInspiration);
    }
  }, []);

  // Initialize swiper
  useEffect(() => {
    if (generatedPhrases.length > 0 && cardContainerRef.current) {
      initializeSwiper();
    }
  }, [generatedPhrases]);

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCard?.category) {
      loadSubcategories(selectedCard.category);
    }
  }, [selectedCard?.category]);

  const loadSubcategories = async (categoryName: string) => {
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .single();

      if (categoryError || !categoryData) {
        console.error('Error fetching category:', categoryError);
        setSubcategories([]);
        return;
      }

      const { data: subcategoryData, error: subcategoryError } = await supabase
        .from('subcategories')
        .select('name')
        .eq('category_id', categoryData.id)
        .order('name');

      if (subcategoryError || !subcategoryData) {
        console.error('Error fetching subcategories:', subcategoryError);
        setSubcategories([]);
        return;
      }

      setSubcategories(subcategoryData.map(sub => sub.name));
    } catch (error) {
      console.error('Exception in loadSubcategories:', error);
      setSubcategories([]);
    }
  };

  const handleInspirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInspiration(e.target.value);
    safeStorage.setItem('lastInspiration', e.target.value);
  };

  const handleWordCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWordCount(Number(e.target.value));
  };

  const handleGeneratePhrases = async () => {
    if (!inspiration || isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generatePhrases(inspiration, wordCount);
      
      // Transform the result into our format
      const phrases: GeneratedPhrase[] = result.phrases.map((phrase: string, index: number) => ({
        id: `new-${Date.now()}-${index}`,
        phrase,
        difficulty: 2, // Default to medium
        saved: false,
      }));
      
      setGeneratedPhrases(phrases);
    } catch (error) {
      console.error('Error generating phrases:', error);
      alert('Failed to generate phrases. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const initializeSwiper = () => {
    const cards = document.querySelectorAll('.demo__card');
    if (!cards.length) return;
    
    // Reset swiper state
    swiper.current = {
      currentCard: null,
      startX: 0,
      pullDeltaX: 0,
      animating: false,
      updateStyles: updateCardStyles
    };
    
    // Update initial card styles
    updateCardStyles();
    
    // Remove existing event listeners
    document.removeEventListener('mousedown', startDrag);
    document.removeEventListener('touchstart', startDrag);
    
    // Add event listeners
    document.addEventListener('mousedown', startDrag);
    document.addEventListener('touchstart', startDrag);
  };
  
  const updateCardStyles = () => {
    const cards = document.querySelectorAll('.demo__card');
    cards.forEach((card, index) => {
      const zIndex = 15 - index;
      const scale = 1 - index * 0.03;
      const translateY = index * 7;
      
      if (!card.classList.contains('below')) {
        (card as HTMLElement).style.zIndex = zIndex.toString();
        (card as HTMLElement).style.transform = `translateY(${translateY}px) scale(${scale})`;
      } else {
        (card as HTMLElement).style.zIndex = '1';
      }
    });
  };
  
  const startDrag = (e: MouseEvent | TouchEvent) => {
    if (swiper.current.animating) return;
    
    // Find the closest parent with the class "demo__card"
    const target = e.target as HTMLElement;
    const cardElement = target.closest('.demo__card') as HTMLElement;
    
    if (cardElement && !cardElement.classList.contains('inactive')) {
      swiper.current.currentCard = cardElement;
      swiper.current.startX = e.type === 'mousedown' 
        ? (e as MouseEvent).pageX 
        : (e as TouchEvent).touches[0].pageX;
      
      const moveHandler = (moveEvent: MouseEvent | TouchEvent) => {
        const x = moveEvent.type === 'mousemove' 
          ? (moveEvent as MouseEvent).pageX 
          : (moveEvent as TouchEvent).touches[0].pageX;
        
        swiper.current.pullDeltaX = x - swiper.current.startX;
        
        if (Math.abs(swiper.current.pullDeltaX) > 0) {
          pullChange(); 
        }
      };
      
      const endHandler = () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('mouseup', endHandler);
        document.removeEventListener('touchend', endHandler);
        
        if (Math.abs(swiper.current.pullDeltaX) > 0) {
          release(); 
        }
      };
      
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('touchmove', moveHandler);
      document.addEventListener('mouseup', endHandler);
      document.addEventListener('touchend', endHandler);
    }
  };
  
  const pullChange = () => {
    if (!swiper.current.currentCard) return;
    
    swiper.current.animating = true;
    const deg = swiper.current.pullDeltaX / 10;
    swiper.current.currentCard.style.transform = `translateX(${swiper.current.pullDeltaX}px) rotate(${deg}deg)`;
    
    // Visual cue for accept/reject - THIS PART IS IMPORTANT
    const choice = swiper.current.currentCard.querySelector('.demo__card__choice') as HTMLElement;
    if (choice) {
      // Calculate opacity based on pull distance (stronger effect)
      const opacity = Math.min(Math.abs(swiper.current.pullDeltaX) / 100, 1);
      choice.style.opacity = opacity.toString();
      
      // Clear both classes first, then add the appropriate one
      choice.classList.remove('m--like', 'm--reject');
      if (swiper.current.pullDeltaX > 0) {
        choice.classList.add('m--like');
      } else {
        choice.classList.add('m--reject');
      }
    }
  };
  
  const release = () => {
    if (!swiper.current.currentCard) return;
    
    const decisionVal = 80;
    let decided = false;
    
    // Handle card decision based on drag distance
    if (swiper.current.pullDeltaX > decisionVal) {
      // Swiped right - ACCEPT
      swiper.current.currentCard.classList.add('to-right');
      decided = true;
      setTimeout(() => handleCardAction(true), 300);
    } else if (swiper.current.pullDeltaX < -decisionVal) {
      // Swiped left - REJECT
      swiper.current.currentCard.classList.add('to-left');
      decided = true;
      setTimeout(() => handleCardAction(false), 300);
    }
    
    if (decided) {
      // Mark as inactive immediately to prevent further interaction
      swiper.current.currentCard.classList.add('inactive');
      
      // Completely remove the current card reference to prevent bounce-back issues
      const currentCard = swiper.current.currentCard;
      swiper.current.currentCard = null;
      
      // Remove card from DOM after animation
      setTimeout(() => {
        if (currentCard && currentCard.parentElement) {
          currentCard.remove(); // Always remove the card from DOM
          updateCardStyles(); // Update remaining cards
        }
      }, 300);
    } else {
      // Reset card position if not decided - add the reset class
      swiper.current.currentCard.classList.add('reset');
      
      // Clean up animation state after reset animation
      setTimeout(() => {
        if (swiper.current.currentCard) {
          swiper.current.currentCard.style.transform = '';
          swiper.current.currentCard.classList.remove('reset');
          
          const choice = swiper.current.currentCard.querySelector('.demo__card__choice') as HTMLElement;
          if (choice) {
            choice.style.opacity = '0';
          }
        }
        
        swiper.current.pullDeltaX = 0;
        swiper.current.animating = false;
      }, 300);
    }
    
    // Always end animation state after a delay
    setTimeout(() => {
      swiper.current.animating = false;
      updateCardStyles();
    }, 350);
  };

  // Track counts of approved and rejected phrases
  const [stats, setStats] = useState({
    approved: 0,
    rejected: 0
  });

  const handleCardAction = async (accepted: boolean) => {
    setIsProcessingCard(true);
    
    try {
      // Get the first visible card's data
      const cards = document.querySelectorAll('.demo__card:not(.inactive)');
      if (cards.length > 0) {
        const dataIndex = parseInt((cards[0] as HTMLElement).dataset.index || '0', 10);
        const phrase = generatedPhrases[dataIndex];
        
        if (accepted) {
          // Update approved count
          setStats(prev => ({ ...prev, approved: prev.approved + 1 }));
          
          // Add to approved phrases but don't immediately open editor
          setGeneratedPhrases(prev => 
            prev.map(p => p.id === phrase.id ? { ...p, approved: true } : p)
          );
        } else {
          // Update rejected count
          setStats(prev => ({ ...prev, rejected: prev.rejected + 1 }));
          
          // Handle rejected phrase - just remove from the array
          setGeneratedPhrases(prev => prev.filter(p => p.id !== phrase.id));
        }
      }
    } catch (error) {
      console.error('Error processing card action:', error);
    } finally {
      setIsProcessingCard(false);
    }
  };

  const handleManualSwipe = (accepted: boolean) => {
    if (swiper.current.animating || !cardContainerRef.current) return;
    
    const cards = document.querySelectorAll('.demo__card:not(.inactive)');
    if (cards.length > 0) {
      swiper.current.currentCard = cards[0] as HTMLElement;
      swiper.current.pullDeltaX = accepted ? 100 : -100;
      pullChange();
      release();
    }
  };

  const handleUpdateSelectedCard = (field: keyof GeneratedPhrase, value: string | number) => {
    if (!selectedCard) return;
    
    setSelectedCard(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleGenerateHint = async () => {
    if (!selectedCard) return;
    
    try {
      const result = await generateHint(selectedCard.phrase);
      if (result.hint) {
        handleUpdateSelectedCard('hint', result.hint);
      }
    } catch (error) {
      console.error('Error generating hint:', error);
    }
  };

  const handleGenerateTags = async () => {
    if (!selectedCard) return;
    
    try {
      const result = await generateTags(selectedCard.phrase);
      if (result.tags.length > 0) {
        handleUpdateSelectedCard('tags', result.tags.join(','));
      }
    } catch (error) {
      console.error('Error generating tags:', error);
    }
  };

  const handleSavePhrase = async () => {
    if (!selectedCard || !reviewer) return;
    
    setIsSaving(true);
    
    try {
      // Get category and subcategory IDs
      let categoryId = null;
      let subcategoryId = null;
      
      if (selectedCard.category) {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', selectedCard.category)
          .single();
        
        if (catError) {
          console.error('Error fetching category:', catError);
          throw new Error(`Category error: ${catError.message}`);
        }
          
        if (catData) {
          categoryId = catData.id;
          
          if (selectedCard.subcategory) {
            const { data: subData, error: subError } = await supabase
              .from('subcategories')
              .select('id')
              .eq('name', selectedCard.subcategory)
              .eq('category_id', categoryId)
              .single();
            
            if (subError && subError.code !== 'PGRST116') { // Not found is OK
              console.error('Error fetching subcategory:', subError);
              throw new Error(`Subcategory error: ${subError.message}`);
            }
              
            if (subData) {
              subcategoryId = subData.id;
            }
          }
        }
      }
      
      // Log what we're about to insert for debugging
      console.log('Inserting phrase with data:', {
        phrase: selectedCard.phrase,
        hint: selectedCard.hint || null,
        difficulty: selectedCard.difficulty || 2,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        created_by: reviewer.id,
      });
      
      // Insert the phrase
      const { data: phraseData, error: phraseError } = await supabase
        .from('phrases')
        .insert({
          phrase: selectedCard.phrase,
          hint: selectedCard.hint || null,
          difficulty: selectedCard.difficulty || 2,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          created_by: reviewer.id,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (phraseError) {
        console.error('Phrase insert error:', phraseError);
        throw phraseError;
      }
      
      // Handle tags if any
      if (selectedCard.tags && phraseData) {
        const tagList = selectedCard.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        
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
      
      // Mark as saved in our local state
      setGeneratedPhrases(prev => 
        prev.map(p => p.id === selectedCard.id ? { ...p, saved: true } : p)
      );
      
      // Close edit mode and return to swiping
      setEditMode(false);
      setSelectedCard(null);
      
      // Show success message (can replace with toast if you have one)
      alert('Phrase saved successfully!');
      
    } catch (error) {
      console.error('Error saving phrase:', error);
      alert('Failed to save phrase. See console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Render the form to generate new phrases
  const renderGenerationForm = () => (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Create New Words</h2>
      <div className="mb-4">
        <label className="block text-gray-400 text-sm mb-2">Provide Inspiration</label>
        <input
          type="text"
          value={inspiration}
          onChange={handleInspirationChange}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
          placeholder="Enter a topic, theme, or idea..."
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-2">Number of Words</label>
        <select
          value={wordCount}
          onChange={handleWordCountChange}
          className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
        >
          {wordCountOptions.map(count => (
            <option key={count} value={count}>{count}</option>
          ))}
        </select>
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

  // Render the card swiper component for generated phrases
  const renderCardSwiper = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Review Generated Words</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-300">
            <span className="text-green-500 font-medium">{stats.approved}</span> saved • 
            <span className="text-red-500 font-medium ml-1">{stats.rejected}</span> skipped
          </div>
          <button
            onClick={() => {
              setGeneratedPhrases([]);
              setStats({ approved: 0, rejected: 0 });
            }}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
          >
            Start Over
          </button>
        </div>
      </div>
      
      <div className="demo">
        <div className="demo__content">
          <div ref={cardContainerRef} className="demo__card-cont">
            {generatedPhrases.map((phrase, index) => (
              <div 
                key={phrase.id} 
                className="demo__card"
                data-index={index}
                data-id={phrase.id}
                style={{'--n': index + 1} as React.CSSProperties}
              >
                <div className={`demo__card__top ${phrase.approved ? 'lime' : 'purple'}`}>
                  <p className="demo__card__name">{phrase.phrase.toUpperCase()}</p>
                </div>
                <div className="demo__card__btm">
                  <div className="demo__card__swipe-hint">
                    Swipe left to skip - Right to save
                  </div>
                </div>
                <div className="demo__card__choice m--reject"></div>
                <div className="demo__card__choice m--like"></div>
                <div className="demo__card__drag"></div>
                <div className="demo__swipe-indicator demo__swipe-indicator--left">←</div>
                <div className="demo__swipe-indicator demo__swipe-indicator--right">→</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => handleManualSwipe(false)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
            disabled={isProcessingCard || generatedPhrases.length === 0}
          >
            Skip
          </button>
          <button
            onClick={() => handleManualSwipe(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded"
            disabled={isProcessingCard || generatedPhrases.length === 0}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  // Render the edit form for a selected phrase
  const renderEditForm = () => {
    if (!selectedCard) return null;
    
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Phrase</h2>
          <button
            onClick={() => {
              setEditMode(false);
              setSelectedCard(null);
            }}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
          >
            Cancel
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">Phrase</label>
          <div className="p-3 rounded bg-gray-700 text-white">
            {selectedCard.phrase}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">Difficulty</label>
          <select
            value={selectedCard.difficulty || 2}
            onChange={(e) => handleUpdateSelectedCard('difficulty', parseInt(e.target.value, 10))}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
          >
            {[1, 2, 3].map((value, index) => (
              <option key={value} value={value}>
                {difficultyOptions[index]}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">Category</label>
          <select
            value={selectedCard.category || ''}
            onChange={(e) => handleUpdateSelectedCard('category', e.target.value)}
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
            value={selectedCard.subcategory || ''}
            onChange={(e) => handleUpdateSelectedCard('subcategory', e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
            disabled={!selectedCard.category}
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
              value={selectedCard.tags || ''}
              onChange={(e) => handleUpdateSelectedCard('tags', e.target.value)}
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
              value={selectedCard.hint || ''}
              onChange={(e) => handleUpdateSelectedCard('hint', e.target.value)}
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
            : 'Save Phrase'
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

        {editMode && selectedCard ? (
          renderEditForm()
        ) : generatedPhrases.length > 0 ? (
          renderCardSwiper()
        ) : (
          renderGenerationForm()
        )}
      </div>
    </div>
  );
};

export default WordCreator;