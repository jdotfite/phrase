// components/reviewer/WordCreator/PhraseSelection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { GeneratedPhrase } from './types';

interface PhraseSelectionProps {
  phrases: GeneratedPhrase[];
  onPhraseSelect: (phrase: GeneratedPhrase) => void;
  onStartOver: () => void;
}

const PhraseSelection: React.FC<PhraseSelectionProps> = ({ 
  phrases, 
  onPhraseSelect,
  onStartOver 
}) => {
  // Count phrases that have been saved
  const savedCount = phrases.filter(phrase => phrase.saved).length;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Select Word to Add</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-300">
            <span className="text-green-500 font-medium">{savedCount}</span> of {phrases.length} saved
          </div>
          <button
            onClick={onStartOver}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
          >
            Start Over
          </button>
        </div>
      </div>
      
      <div 
        className="grid gap-4 justify-items-center"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
      >
        {phrases.map((phrase) => (
          <WordCard 
            key={phrase.id}
            phrase={phrase}
            onClick={() => onPhraseSelect(phrase)}
          />
        ))}
      </div>
    </div>
  );
};

// Individual word card component
interface WordCardProps {
  phrase: GeneratedPhrase;
  onClick: () => void;
}

const WordCard: React.FC<WordCardProps> = ({ phrase, onClick }) => {
  // Determine card styling based on saved status
  const cardStyle = phrase.saved
    ? "bg-gray-700 text-gray-400" // Grayed out for saved phrases
    : "bg-gray-800 text-white"; // Normal for unsaved phrases
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${cardStyle} p-4 rounded-lg cursor-pointer text-center w-full min-h-40 flex flex-col justify-center transition-colors duration-200`}
      onClick={onClick}
    >
      <h3 className="text-lg font-bold mb-2">{phrase.phrase}</h3>
      
      {phrase.saved && (
        <div className="flex justify-center items-center mt-2">
          <span className="text-xs px-2 py-1 bg-green-600 rounded-full text-white">
            Saved
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default PhraseSelection;