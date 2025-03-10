// components/reviewer/WordCreator/PhraseGenerator.tsx
import React, { useState, useEffect } from 'react';
import { generatePhrases } from '@/lib/services/claudeService';
import { GeneratedPhrase } from './types';
import { safeStorage } from './utils';

interface PhraseGeneratorProps {
  onPhrasesGenerated: (phrases: GeneratedPhrase[]) => void;
}

const PhraseGenerator: React.FC<PhraseGeneratorProps> = ({ onPhrasesGenerated }) => {
  const [inspiration, setInspiration] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load previous inspiration if available
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
      // Default to 10 words since we removed the word count selector
      const result = await generatePhrases(inspiration, 10);
      
      // Transform the result into our format
      const phrases: GeneratedPhrase[] = result.phrases.map((phrase: string, index: number) => ({
        id: `new-${Date.now()}-${index}`,
        phrase,
        difficulty: 2, // Default to medium
        edited: false,
        saved: false,
      }));
      
      onPhrasesGenerated(phrases);
    } catch (error) {
      console.error('Error generating phrases:', error);
      alert('Failed to generate phrases. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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
};

export default PhraseGenerator;
