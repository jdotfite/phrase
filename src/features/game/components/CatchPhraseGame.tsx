import React, { useState, useEffect } from 'react';
import useGameState from '../hooks/useGameState';
import useResponsive from '../hooks/useResponsive';
import MenuScreen from '../screens/MenuScreen';
import GameScreen from '../screens/GameScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import TeamsScreen from '../screens/TeamsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HowToPlayScreen from '../screens/HowToPlayScreen';

// Mock data for phrases
const mockPhrases = [
  { phrase: "Couch potato", category: "Expressions" },
  { phrase: "Break a leg", category: "Expressions" },
  { phrase: "Bite the bullet", category: "Expressions" },
  { phrase: "Cut to the chase", category: "Movies" },
  { phrase: "Down to earth", category: "Expressions" },
  { phrase: "Hit the road", category: "Travel" },
  { phrase: "On cloud nine", category: "Emotions" },
  { phrase: "Piece of cake", category: "Food" },
  { phrase: "Under the weather", category: "Health" },
  { phrase: "Wild goose chase", category: "Animals" },
  { phrase: "Knock on wood", category: "Superstitions" },
  { phrase: "Call it a day", category: "Time" },
  { phrase: "Back to square one", category: "Games" },
  { phrase: "Draw the line", category: "Art" },
  { phrase: "Give the cold shoulder", category: "Body Parts" },
  { phrase: "Keep your chin up", category: "Body Parts" },
  { phrase: "Lose your touch", category: "Skills" },
  { phrase: "Make a long story short", category: "Storytelling" },
  { phrase: "Put your foot down", category: "Body Parts" },
  { phrase: "Ring a bell", category: "Sounds" }
];

// Categories for the game
const categories = [
  "Movies", "Food", "Sports", "Music", "Animals", "Geography", "History", 
  "Science", "TV Shows", "Books", "Expressions", "Travel", "Emotions", 
  "Health", "Superstitions", "Time", "Games", "Art", "Body Parts", 
  "Skills", "Storytelling", "Sounds"
];

// Type for game screens
type GameScreen = 'menu' | 'game' | 'categories' | 'teams' | 'settings' | 'howtoplay';

const CatchPhraseGame = () => {
  // Current screen state
  const [screen, setScreen] = useState<GameScreen>('menu');
  
  // Get responsive data
  const responsive = useResponsive();
  
  // Get game state from custom hook
  const gameState = useGameState(mockPhrases, 60);
  
  // Set viewport height CSS variable for mobile browsers
  useEffect(() => {
    const setVHVariable = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVHVariable();
    window.addEventListener('resize', setVHVariable);
    
    return () => window.removeEventListener('resize', setVHVariable);
  }, []);
  
  // Start new game
  const handleStartGame = () => {
    gameState.startGame();
    setScreen('game');
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
      {renderScreen()}
    </div>
  );
};

export default CatchPhraseGame;
