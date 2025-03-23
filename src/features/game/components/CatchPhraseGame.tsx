import React, { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
import Timer from './Timer';
import PhraseDisplay from './PhraseDisplay';
import CircleBackground from './CircleBackground';
import Image from 'next/image';

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
  "Movies",
  "Food",
  "Sports",
  "Music",
  "Animals",
  "Geography",
  "History",
  "Science",
  "TV Shows",
  "Books",
  "Expressions",
  "Travel",
  "Emotions",
  "Health",
  "Superstitions",
  "Time",
  "Games",
  "Art",
  "Body Parts",
  "Skills",
  "Storytelling",
  "Sounds"
];

const CatchPhraseGame = () => {
  const [screen, setScreen] = useState('menu'); // menu, game, categories, teams, settings, howtoplay
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds default
  const [totalTime, setTotalTime] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // Refs for interval timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const beepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const beepTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio refs
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on component mount
  useEffect(() => {
    // In a real app, you would have actual audio files
    if (typeof window !== 'undefined') {
      beepAudioRef.current = new Audio('/beep.mp3');
      endAudioRef.current = new Audio('/end.mp3');
    }
    
    return () => {
      // Clean up
      cleanupTimers();
    };
  }, []);

  // Cleanup function for all timers
  const cleanupTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
    if (beepTimeoutRef.current) clearTimeout(beepTimeoutRef.current);
    
    timerRef.current = null;
    beepIntervalRef.current = null;
    beepTimeoutRef.current = null;
  };

  // Generate a random phrase from the mock data
  const getRandomPhrase = () => {
    let filteredPhrases = mockPhrases;
    
    // Filter by selected categories if any
    if (selectedCategories.length > 0) {
      filteredPhrases = mockPhrases.filter(p => 
        selectedCategories.includes(p.category)
      );
    }
    
    // If no phrases match the categories, use all phrases
    if (filteredPhrases.length === 0) {
      filteredPhrases = mockPhrases;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredPhrases.length);
    return filteredPhrases[randomIndex];
  };

  // Start the game
  const startGame = () => {
    const randomPhrase = getRandomPhrase();
    setCurrentPhrase(randomPhrase.phrase);
    setCurrentCategory(randomPhrase.category);
    setTimeLeft(totalTime);
    setIsTimerRunning(true);
    setIsGameOver(false);
    setScreen('game');
    startTimer();
    scheduleBeeps();
  };

  // Pass current phrase and get a new one
  const passPhrase = () => {
    const randomPhrase = getRandomPhrase();
    setCurrentPhrase(randomPhrase.phrase);
    setCurrentCategory(randomPhrase.category);
  };

  // Start the timer
  const startTimer = () => {
    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Set new timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          handleTimerEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Handle timer end
  const handleTimerEnd = () => {
    cleanupTimers();
    setIsTimerRunning(false);
    setIsGameOver(true);
    
    // Play end sound
    if (endAudioRef.current) {
      endAudioRef.current.play().catch(err => 
        console.error("Could not play end sound:", err)
      );
    }
  };

  // Schedule beeping sounds based on time remaining
  const scheduleBeeps = () => {
    // Clear any existing beep schedules
    if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
    if (beepTimeoutRef.current) clearTimeout(beepTimeoutRef.current);
    
    // Function to play beep sound
    const playBeep = () => {
      if (beepAudioRef.current) {
        beepAudioRef.current.currentTime = 0;
        beepAudioRef.current.play().catch(err => 
          console.error("Could not play beep:", err)
        );
      }
    };

    // Set up beep intervals based on time remaining
    if (timeLeft > 30) {
      // Phase 1: Slow beeps every 5 seconds
      beepIntervalRef.current = setInterval(playBeep, 5000);
      
      // Schedule transition to Phase 2
      beepTimeoutRef.current = setTimeout(() => {
        if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
        beepIntervalRef.current = setInterval(playBeep, 2000);
        
        // Schedule transition to Phase 3
        beepTimeoutRef.current = setTimeout(() => {
          if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
          beepIntervalRef.current = setInterval(playBeep, 500);
        }, 15000); // After 15 more seconds (when ~15 seconds remain)
        
      }, (timeLeft - 30) * 1000); // When 30 seconds remain
    }
    else if (timeLeft > 15) {
      // Phase 2: Medium beeps every 2 seconds
      beepIntervalRef.current = setInterval(playBeep, 2000);
      
      // Schedule transition to Phase 3
      beepTimeoutRef.current = setTimeout(() => {
        if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
        beepIntervalRef.current = setInterval(playBeep, 500);
      }, (timeLeft - 15) * 1000); // When 15 seconds remain
    }
    else {
      // Phase 3: Fast beeps every 0.5 seconds
      beepIntervalRef.current = setInterval(playBeep, 500);
    }
  };

  // Return to the main menu
  const returnToMenu = () => {
    cleanupTimers();
    setIsTimerRunning(false);
    setIsGameOver(false);
    setScreen('menu');
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Render main menu
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-end h-full bg-[#7b86eb] pb-12 relative">
      <CircleBackground />
      
      <div className="absolute top-[35vh] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
  {/* Logo image goes here - centered on circles */}
  <div className="w-48 h-48 relative"> {/* Made slightly larger */}
    <Image 
      src="/images/game-logo.png?v=4" 
      alt="Phrase Game Logo"
      layout="fill"
      objectFit="contain"
      priority
    />
  </div>
  <div className="mt-[40px]">
    <Logo size="large" className="font-extrabold text-4xl" />
  </div>
</div>
      
      <div className="relative z-10 w-full max-w-md flex flex-col gap-4 px-6 mb-4">
        <button 
          onClick={() => startGame()}
          className="bg-white hover:bg-gray-100 text-black font-bold py-4 px-6 rounded-3xl text-xl shadow-lg"
        >
          Play
        </button>
        
        <button 
          onClick={() => setScreen('categories')}
          className="bg-white hover:bg-gray-100 text-black font-bold py-4 px-6 rounded-3xl text-xl shadow-lg"
        >
          Categories
        </button>
        
        <button 
          onClick={() => setScreen('teams')}
          className="bg-white hover:bg-gray-100 text-black font-bold py-4 px-6 rounded-3xl text-xl shadow-lg"
        >
          Teams
        </button>
        
        <button 
          onClick={() => setScreen('settings')}
          className="bg-white hover:bg-gray-100 text-black font-bold py-4 px-6 rounded-3xl text-xl shadow-lg"
        >
          Settings
        </button>
        
        <button 
          onClick={() => setScreen('howtoplay')}
          className="bg-white hover:bg-gray-100 text-black font-bold py-4 px-6 rounded-3xl text-xl shadow-lg"
        >
          How to Play
        </button>
      </div>
    </div>
  );

  // Render the game screen
  const renderGame = () => (
    <div className="flex flex-col h-full bg-[#7b86eb] relative">
      <CircleBackground />
      <div className="flex justify-between items-center p-4 border-b relative z-10">
        <button 
          onClick={returnToMenu}
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
              onClick={startGame}
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
            onClick={passPhrase}
            className="w-full bg-white hover:bg-gray-100 text-black font-bold py-4 px-6 rounded-3xl text-xl shadow-lg"
          >
            PASS
          </button>
        </div>
      )}
    </div>
  );

  // Render categories screen
  const renderCategories = () => (
    <div className="flex flex-col h-full bg-[#7b86eb]">
      <div className="flex justify-between items-center p-4 border-b relative z-10">
        <button 
          onClick={returnToMenu}
          className="text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <h2 className="text-xl font-bold">Categories</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => toggleCategory(category)}
              className={`p-4 rounded-lg text-left ${
                selectedCategories.includes(category)
                  ? 'bg-white text-black border-2 border-black'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <span className="font-medium">{category}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t relative z-10">
        <button 
          onClick={returnToMenu}
          className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 rounded-3xl shadow-lg"
        >
          Save Categories
        </button>
      </div>
    </div>
  );

  // Render Teams screen (placeholder for now)
  const renderTeams = () => (
    <div className="flex flex-col h-full bg-[#7b86eb]">
      <div className="flex justify-between items-center p-4 border-b relative z-10">
        <button 
          onClick={returnToMenu}
          className="text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <h2 className="text-xl font-bold">Teams</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="text-center">
          <p className="text-xl">Team setup will go here</p>
          <p className="text-gray-500 mt-2">Coming soon!</p>
        </div>
      </div>
    </div>
  );

  // Render Settings screen (placeholder for now)
  const renderSettings = () => (
    <div className="flex flex-col h-full bg-[#7b86eb]">
      <div className="flex justify-between items-center p-4 border-b relative z-10">
        <button 
          onClick={returnToMenu}
          className="text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <h2 className="text-xl font-bold">Settings</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="text-center">
          <p className="text-xl">Settings will go here</p>
          <p className="text-gray-500 mt-2">Game time, sound options, etc.</p>
        </div>
      </div>
    </div>
  );

  // Render How to Play screen
  const renderHowToPlay = () => (
    <div className="flex flex-col h-full bg-[#7b86eb]">
      <div className="flex justify-between items-center p-4 border-b relative z-10">
        <button 
          onClick={returnToMenu}
          className="text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <h2 className="text-xl font-bold">How to Play</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
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
        
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-lg font-bold mb-2">What Not To Do</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Don't say any part of the word or phrase</li>
            <li>Don't use "rhymes with" clues</li>
            <li>Don't use "sounds like" clues</li>
            <li>Don't use "first letter is..." clues</li>
            <li>Don't use gestures or charades</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Render the appropriate screen based on state
  const renderScreen = () => {
    switch(screen) {
      case 'game':
        return renderGame();
      case 'categories':
        return renderCategories();
      case 'teams':
        return renderTeams();
      case 'settings':
        return renderSettings();
      case 'howtoplay':
        return renderHowToPlay();
      default:
        return renderMenu();
    }
  };

  return (
    <div className="bg-[#7b86eb] h-screen w-full overflow-hidden flex flex-col">
      {renderScreen()}
    </div>
  );
};

export default CatchPhraseGame;





