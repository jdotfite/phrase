import React from 'react';
import Timer from '../components/Timer';
import PhraseDisplay from '../components/PhraseDisplay';
import CircleBackground from '../components/CircleBackground';

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
  onPassPhrase
}) => {
  return (
    <div 
      className="flex flex-col h-full bg-[#7b86eb] relative" 
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <CircleBackground />
      <div className="flex justify-between items-center p-4 border-b relative z-10">
        <button 
          onClick={onReturnToMenu}
          className="text-gray-600 hover:text-gray-800"
        >
          Menu
        </button>
        <Timer timeLeft={timeLeft} totalTime={totalTime} isRunning={isTimerRunning} />
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
        <div className="p-4 border-t relative z-10">
          <button 
            onClick={onPassPhrase}
            className="w-full bg-white hover:bg-gray-100 text-black font-bold py-4 px-6 rounded-3xl text-xl shadow-lg"
          >
            PASS
          </button>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
