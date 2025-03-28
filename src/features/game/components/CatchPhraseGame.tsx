import React, { useState, useEffect } from 'react';
import useGameState from '../hooks/useGameState';
import useResponsive from '../hooks/useResponsive';
import MenuScreen from '../screens/MenuScreen';
import GameScreen from '../screens/GameScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import TeamsScreen from '../screens/TeamsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HowToPlayScreen from '../screens/HowToPlayScreen';

// Use supabase for categories
import { supabase } from '@/lib/services/supabase';

// Type for game screens
type GameScreen = 'menu' | 'game' | 'categories' | 'teams' | 'settings' | 'howtoplay';

const CatchPhraseGame = () => {
  // Current screen state
  const [screen, setScreen] = useState<GameScreen>('menu');
  
  // Categories for the game
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Get responsive data
  const responsive = useResponsive();
  
  // Get game state from custom hook
  const gameState = useGameState(60);
  
  // Set viewport height CSS variable for mobile browsers
  useEffect(() => {
    const setVHVariable = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVHVariable();
    window.addEventListener('resize', setVHVariable);
    
    // Fetch categories
    fetchCategories();
    
    return () => window.removeEventListener('resize', setVHVariable);
  }, []);
  
  // Fetch categories from Supabase
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        const categoryNames = data.map(c => c.name);
        setCategories(categoryNames);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback to some default categories
      setCategories(['General', 'Movies', 'Sports', 'Music', 'Food']);
    } finally {
      setLoadingCategories(false);
    }
  };
  
  // Start new game
  const handleStartGame = () => {
    gameState.startGame();
    setScreen('game');
  };
  
  // Handle Got It button press
  const handleGotIt = () => {
    gameState.passPhrase();
  };
  
  // Return to menu
  const handleReturnToMenu = () => {
    gameState.resetGame();
    setScreen('menu');
  };
  
  // Render the appropriate screen
  const renderScreen = () => {
    switch(screen) {
      case 'game':
        return (
          <GameScreen 
            timeLeft={gameState.timeLeft}
            totalTime={gameState.totalTime}
            isTimerRunning={gameState.isTimerRunning}
            currentPhrase={gameState.currentPhrase}
            currentCategory={gameState.currentCategory}
            isGameOver={gameState.isGameOver}
            onReturnToMenu={handleReturnToMenu}
            onNewGame={handleStartGame}
            onPassPhrase={gameState.passPhrase}
            onGotIt={handleGotIt}
          />
        );
      case 'categories':
        return (
          <CategoriesScreen 
            categories={categories}
            selectedCategories={gameState.selectedCategories}
            onToggleCategory={gameState.toggleCategory}
            onReturnToMenu={handleReturnToMenu}
          />
        );
      case 'teams':
        return (
          <TeamsScreen 
            onReturnToMenu={handleReturnToMenu}
          />
        );
      case 'settings':
        return (
          <SettingsScreen 
            totalTime={gameState.totalTime}
            onSetGameTime={gameState.setGameTime}
            onReturnToMenu={handleReturnToMenu}
          />
        );
      case 'howtoplay':
        return (
          <HowToPlayScreen 
            onReturnToMenu={handleReturnToMenu}
          />
        );
      default:
        return (
          <MenuScreen 
            onPlay={handleStartGame}
            onSelectCategories={() => setScreen('categories')}
            onSelectTeams={() => setScreen('teams')}
            onSelectSettings={() => setScreen('settings')}
            onSelectHowToPlay={() => setScreen('howtoplay')}
          />
        );
    }
  };

  return (
    <div 
      className="h-screen w-full overflow-hidden flex flex-col bg-[#7b86eb]" 
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      {gameState.isLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="text-white text-lg">Loading game data...</div>
        </div>
      ) : (
        renderScreen()
      )}
    </div>
  );
};

export default CatchPhraseGame;
