import React, { useEffect, useState } from 'react';

interface PhraseDisplayProps {
  phrase: string;
  category?: string;
}

const PhraseDisplay: React.FC<PhraseDisplayProps> = ({ phrase, category }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayPhrase, setDisplayPhrase] = useState(phrase);

  // Animate when phrase changes
  useEffect(() => {
    if (phrase !== displayPhrase) {
      setIsAnimating(true);
      
      // Wait for exit animation to complete
      const timer = setTimeout(() => {
        setDisplayPhrase(phrase);
        setIsAnimating(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [phrase, displayPhrase]);

  return (
    <div className="w-full max-w-md mx-auto">
      {category && (
        <div className="text-center mb-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {category}
          </span>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
        <div 
          className={`transition-all duration-300 ${
            isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
          }`}
        >
          <h2 className="text-xl text-gray-500 font-medium mb-2 text-center">Your Phrase</h2>
          <p className="text-3xl sm:text-4xl font-bold text-center py-4 break-words">{displayPhrase}</p>
        </div>
      </div>
    </div>
  );
};

export default PhraseDisplay;
