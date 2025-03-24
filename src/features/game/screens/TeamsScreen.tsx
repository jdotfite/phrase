import React from 'react';
import CircleBackground from '../components/CircleBackground';

interface TeamsScreenProps {
  onReturnToMenu: () => void;
}

const TeamsScreen: React.FC<TeamsScreenProps> = ({ onReturnToMenu }) => {
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
        <h2 className="text-xl font-bold">Teams</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="text-center bg-white rounded-xl shadow-md p-6 max-w-md w-full">
          <p className="text-xl font-medium mb-4">Team setup will go here</p>
          <p className="text-gray-500 mb-6">Coming soon!</p>
          
          {/* Placeholder UI for future implementation */}
          <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Team 1</span>
              <button className="text-blue-500 text-sm">Edit</button>
            </div>
            <div className="h-8 bg-gray-100 rounded-md w-full mb-2"></div>
          </div>
          
          <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Team 2</span>
              <button className="text-blue-500 text-sm">Edit</button>
            </div>
            <div className="h-8 bg-gray-100 rounded-md w-full mb-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsScreen;
