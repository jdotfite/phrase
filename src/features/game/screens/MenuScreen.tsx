import React from 'react';
import Image from 'next/image';
import Logo from '../components/Logo';
import CircleBackground from '../components/CircleBackground';
import useResponsive from '../hooks/useResponsive';

interface MenuScreenProps {
  onPlay: () => void;
  onSelectCategories: () => void;
  onSelectTeams: () => void;
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
  onSelectCategories, 
  onSelectTeams, 
  onSelectSettings, 
  onSelectHowToPlay 
}) => {
  const responsive = useResponsive();
  
  return (
    <div 
      className="flex flex-col items-center justify-between h-full bg-[#7b86eb]" 
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <CircleBackground />
      
      {/* Center section with logo - positioned absolutely in the center */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
       {/* Logo image - made 200% larger */}
       <div className="relative w-72 h-72 md:w-80 md:h-80">
  <Image 
    src="/images/game-logo.png?v=4" 
    alt="Phrase Game Logo"
    fill
    sizes="(max-width: 768px) 288px, 320px"
    style={{ 
      objectFit: "contain",
      filter: "drop-shadow(0px 8px 8px rgba(0, 0, 0, 0.3))"
    }}
    priority
  />
</div>
        
        {/* Text logo directly below the image */}
        <div className="mt-6">
          <Logo 
            size="large"
            className="font-extrabold" 
          />
        </div>
      </div>
      
      {/* Button container - fixed at bottom with proper spacing */}
      <div className="w-full max-w-xs sm:max-w-md px-4 sm:px-6 mb-8 sm:mb-10 mt-auto z-10">
        <div className="flex flex-col gap-3 sm:gap-4">
          <MenuButton label="Play" onClick={onPlay} />
          <MenuButton label="Categories" onClick={onSelectCategories} />
          <MenuButton label="Teams" onClick={onSelectTeams} />
          <MenuButton label="Settings" onClick={onSelectSettings} />
          <MenuButton label="How to Play" onClick={onSelectHowToPlay} />
        </div>
      </div>
    </div>
  );
};

export default MenuScreen;