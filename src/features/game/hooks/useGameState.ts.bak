import { useState, useRef, useEffect } from 'react';

// Types
export interface PhraseItem {
  phrase: string;
  category: string;
}

// Game state hook that manages all game logic
export const useGameState = (mockPhrases: PhraseItem[], initialTime: number = 60) => {
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [totalTime, setTotalTime] = useState(initialTime);
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
  
  // Generate a random phrase from the data
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
  
  // Toggle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  // Reset game state and cleanup
  const resetGame = () => {
    cleanupTimers();
    setIsTimerRunning(false);
    setIsGameOver(false);
  };
  
  // Update game time setting
  const setGameTime = (seconds: number) => {
    setTotalTime(seconds);
    setTimeLeft(seconds);
  };
  
  return {
    currentPhrase,
    currentCategory,
    timeLeft,
    totalTime,
    isTimerRunning,
    selectedCategories,
    isGameOver,
    startGame,
    passPhrase,
    toggleCategory,
    resetGame,
    setGameTime
  };
};

export default useGameState;
