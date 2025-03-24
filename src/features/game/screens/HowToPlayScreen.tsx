import React from 'react';
import CircleBackground from '../components/CircleBackground';

interface HowToPlayScreenProps {
  onReturnToMenu: () => void;
}

const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ onReturnToMenu }) => {
  return (
    <div 
      className="flex flex-col h-full bg-[#7b86eb]" 
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <CircleBackground />
      <div className="flex justify-between items-center p-4 border-b relative z-10">
        <button 
          onClick={onReturnToMenu}
          className="text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <h2 className="text-xl font-bold">How to Play</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 relative z-10">
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <h3 className="text-lg font-bold mb-2">Game Rules</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Form two teams and sit in a circle alternating team members.</li>
            <li>The first player starts with the device and sees a word or phrase.</li>
            <li>They must describe the word WITHOUT saying any part of it.</li>
            <li>When their team guesses correctly, they pass to the next player (on the opposing team).</li>
            <li>If the timer runs out while a player is holding the device, the opposing team gets a point.</li>
            <li>First team to reach 7 points wins!</li>
          </ol>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <h3 className="text-lg font-bold mb-2">What Not To Do</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Don't say any part of the word or phrase</li>
            <li>Don't use "rhymes with" clues</li>
            <li>Don't use "sounds like" clues</li>
            <li>Don't use "first letter is..." clues</li>
            <li>Don't use gestures or charades</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-lg font-bold mb-2">Tips for Success</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Use synonyms and related concepts</li>
            <li>Describe the meaning or purpose</li>
            <li>For expressions, explain what situation you might use it in</li>
            <li>Break down compound phrases by describing each component separately</li>
            <li>If your team is struggling, move on and try a new phrase!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayScreen;
