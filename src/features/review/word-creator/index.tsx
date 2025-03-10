// components/reviewer/WordCreator/index.tsx
'use client';

import React, { useState } from 'react';
import { WordCreatorProps, GeneratedPhrase, WordCreationStep } from './types';
import PhraseGenerator from './PhraseGenerator';
import PhraseSelection from './PhraseSelection';
import PhraseEditor from './PhraseEditor';

const WordCreator: React.FC<WordCreatorProps> = ({ reviewer, categories, onSwitchMode }) => {
  const [currentStep, setCurrentStep] = useState<WordCreationStep>(WordCreationStep.GENERATE);
  const [generatedPhrases, setGeneratedPhrases] = useState<GeneratedPhrase[]>([]);
  const [selectedPhrase, setSelectedPhrase] = useState<GeneratedPhrase | null>(null);

  // Handle when phrases are generated from the initial screen
  const handlePhrasesGenerated = (phrases: GeneratedPhrase[]) => {
    setGeneratedPhrases(phrases);
    setCurrentStep(WordCreationStep.SELECT);
  };

  // Handle when a phrase is selected from the grid
  const handlePhraseSelect = (phrase: GeneratedPhrase) => {
    setSelectedPhrase(phrase);
    setCurrentStep(WordCreationStep.EDIT);
  };

  // Handle when a phrase is saved in the editor
  const handlePhraseSave = (savedPhrase: GeneratedPhrase) => {
    // Update the phrase in our generated phrases array
    setGeneratedPhrases(prev => 
      prev.map(p => p.id === savedPhrase.id ? savedPhrase : p)
    );
    
    // Return to the selection screen
    setSelectedPhrase(null);
    setCurrentStep(WordCreationStep.SELECT);
  };

  // Handle cancellation of editing
  const handleEditCancel = () => {
    setSelectedPhrase(null);
    setCurrentStep(WordCreationStep.SELECT);
  };

  // Handle start over (reset everything)
  const handleStartOver = () => {
    setGeneratedPhrases([]);
    setSelectedPhrase(null);
    setCurrentStep(WordCreationStep.GENERATE);
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

        {currentStep === WordCreationStep.GENERATE && (
          <PhraseGenerator onPhrasesGenerated={handlePhrasesGenerated} />
        )}

        {currentStep === WordCreationStep.SELECT && (
          <PhraseSelection 
            phrases={generatedPhrases}
            onPhraseSelect={handlePhraseSelect}
            onStartOver={handleStartOver}
          />
        )}

        {currentStep === WordCreationStep.EDIT && selectedPhrase && (
          <PhraseEditor 
            phrase={selectedPhrase}
            categories={categories}
            reviewerId={reviewer.id}
            onSave={handlePhraseSave}
            onCancel={handleEditCancel}
          />
        )}
      </div>
    </div>
  );
};

export default WordCreator;