import React from 'react';
import UnifiedGameBackground from '../components/UnifiedGameBackground';
import useResponsive from '../hooks/useResponsive';

interface MenuScreenProps {
  onPlay: () => void;
  onSelectSettings: () => void;
  onSelectHowToPlay: () => void;
}

const MenuButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full bg-white hover:bg-gray-100 text-black font-bold py-4 
    px-6 rounded-3xl text-xl shadow-lg transform transition-transform 
    duration-150 hover:scale-[1.02] active:scale-[0.98]"
  >
    {label}
  </button>
);

const MenuScreen: React.FC<MenuScreenProps> = ({ 
  onPlay, 
  onSelectSettings, 
  onSelectHowToPlay
}) => {
  const responsive = useResponsive();
  
  return (
    <div 
      className="flex flex-col items-center justify-between h-full bg-[#7b86eb]" 
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      {/* Using the unified background component with vertical position adjustment */}
      <UnifiedGameBackground 
        showLogo={true} 
        logoVerticalOffset={25}   // move logo 10px down
        logoScale={1.1}           // scale logo 30% larger
      />
      {/* Button container - fixed at bottom with proper spacing */}
      <div className="w-full max-w-xs sm:max-w-md px-4 sm:px-6 mb-8 sm:mb-10 mt-auto z-10">
        <div className="flex flex-col gap-3 sm:gap-4">
          <MenuButton label="Play" onClick={onPlay} />
          <MenuButton label="Settings" onClick={onSelectSettings} />
          <MenuButton label="How to Play" onClick={onSelectHowToPlay} />
        </div>
      </div>
    </div>
  );
};

export default MenuScreen;