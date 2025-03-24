import React from 'react';
import CircleBackground from '../components/CircleBackground';

interface SettingsScreenProps {
  totalTime: number;
  onSetGameTime: (seconds: number) => void;
  onReturnToMenu: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  totalTime, 
  onSetGameTime, 
  onReturnToMenu 
}) => {
  // Available time options in seconds
  const timeOptions = [30, 45, 60, 90, 120];
  
  return (
    <div 
      className="flex flex-col h-full bg-[#7b86eb]" 
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <CircleBackground />
      <div className="flex justify-between items-center p-4 relative z-10">
        <button 
          onClick={onReturnToMenu}
          className="w-12 h-12 rounded-full bg-[#5bfdf8] flex items-center justify-center shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#4B5563">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold">Settings</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full">
          <h3 className="text-gray-800 text-lg font-bold mb-4">Game Settings</h3>
          
          <div className="mb-6">
            <h4 className="text-gray-800 font-medium mb-2">Timer Duration</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeOptions.map((seconds) => (
                <button
                  key={seconds}
                  onClick={() => onSetGameTime(seconds)}
                  className={`py-2 px-3 rounded-lg ${
                    totalTime === seconds
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {seconds} seconds
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-gray-800 font-medium mb-2">Sound Effects</h4>
            <div className="flex items-center">
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  name="soundEffects" 
                  id="soundEffects" 
                  defaultChecked={true}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="soundEffects" 
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                ></label>
              </div>
              <label htmlFor="soundEffects" className="ml-2 text-gray-800">Enable sound effects</label>
            </div>
          </div>
          
          <div>
            <h4 className="text-gray-800 font-medium mb-2">Vibration</h4>
            <div className="flex items-center">
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  name="vibration" 
                  id="vibration" 
                  defaultChecked={true}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="vibration" 
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                ></label>
              </div>
              <label htmlFor="vibration" className="ml-2 text-gray-800">Enable vibration</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;

