import React from 'react';
import PhraseDisplay from '../components/PhraseDisplay';

interface GameScreenProps {
  timeLeft: number;
  totalTime: number;
  isTimerRunning: boolean;
  currentPhrase: string;
  currentCategory: string;
  isGameOver: boolean;
  onReturnToMenu: () => void;
  onNewGame: () => void;
  onPassPhrase: () => void;
  onGotIt: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  timeLeft,
  totalTime,
  isTimerRunning,
  currentPhrase,
  currentCategory,
  isGameOver,
  onReturnToMenu,
  onNewGame,
  onPassPhrase,
  onGotIt
}) => {
  return (
    <div 
      className="flex flex-col h-full bg-[#7b86eb] relative" 
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <div className="flex justify-between items-center p-4 relative z-10">
        <button 
  onClick={onReturnToMenu}
  className="w-12 h-12 rounded-full bg-[#5bfdf8] flex items-center justify-center shadow-lg"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#4B5563">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
</button>
        <div className="w-10"></div> {/* Empty div for flex balance */}
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        {isGameOver ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Time's Up!</h2>
            <button
              onClick={onNewGame}
              className="bg-white hover:bg-gray-100 text-black font-bold py-3 px-6 rounded-3xl text-xl shadow-lg"
            >
              New Game
            </button>
          </div>
        ) : (
          <PhraseDisplay phrase={currentPhrase} category={currentCategory} />
        )}
      </div>
      
      {!isGameOver && (
        <div className="p-4 relative z-10">
          <div className="max-w-md mx-auto flex flex-col gap-3">
            <button 
              onClick={onGotIt}
              className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-4 px-6 rounded-3xl text-xl shadow-lg"
            >
              GOT IT!
            </button>
            <button 
              onClick={onPassPhrase}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-6 rounded-3xl text-xl shadow-lg"
            >
              SKIP WORD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;


