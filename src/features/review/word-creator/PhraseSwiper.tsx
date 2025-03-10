// components/reviewer/WordCreator/PhraseSwiper.tsx
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedPhrase, SwiperRef } from './types';
import '../CardSwiper.css';

interface PhraseSwiperProps {
  phrases: GeneratedPhrase[];
  onPhrasesUpdate: (phrases: GeneratedPhrase[]) => void;
  onApprovedPhrasesChange: (phrases: GeneratedPhrase[]) => void;
  totalCount: number;
}

const PhraseSwiper: React.FC<PhraseSwiperProps> = ({ 
  phrases, 
  onPhrasesUpdate,
  onApprovedPhrasesChange,
  totalCount
}) => {
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const approvedPhrases = useRef<GeneratedPhrase[]>([]);
  
  const swiper = useRef<SwiperRef>({
    currentCard: null,
    startX: 0,
    pullDeltaX: 0,
    animating: false,
    processingDecision: false
  });

  // Set up card swiping when phrases change
  useEffect(() => {
    if (phrases.length > 0 && cardContainerRef.current) {
      const handleMouseDown = (e: MouseEvent) => startDrag(e);
      const handleTouchStart = (e: TouchEvent) => startDrag(e);
      
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('touchstart', handleTouchStart);
      
      // Apply initial styles to cards
      updateCardStyles();
      
      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, [phrases]);

  const updateCardStyles = () => {
    const cards = document.querySelectorAll('.demo__card');
    cards.forEach((card, index) => {
      const zIndex = 15 - index;
      const scale = 1 - index * 0.03;
      const translateY = index * 7;
      
      (card as HTMLElement).style.zIndex = zIndex.toString();
      (card as HTMLElement).style.transform = `translateY(${translateY}px) scale(${scale})`;
    });
  };
  
  const startDrag = (e: MouseEvent | TouchEvent) => {
    if (swiper.current.animating || swiper.current.processingDecision) return;
    
    // Find the closest parent with the class "demo__card"
    const target = e.target as HTMLElement;
    const cardElement = target.closest('.demo__card') as HTMLElement;
    
    if (cardElement && !cardElement.classList.contains('inactive')) {
      swiper.current.currentCard = cardElement;
      swiper.current.startX = e.type === 'mousedown' 
        ? (e as MouseEvent).pageX 
        : (e as TouchEvent).touches[0].pageX;
      
      const moveHandler = (moveEvent: MouseEvent | TouchEvent) => {
        const x = moveEvent.type === 'mousemove' 
          ? (moveEvent as MouseEvent).pageX 
          : (moveEvent as TouchEvent).touches[0].pageX;
        
        swiper.current.pullDeltaX = x - swiper.current.startX;
        
        if (Math.abs(swiper.current.pullDeltaX) > 0) {
          pullChange(); 
        }
      };
      
      const endHandler = () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('mouseup', endHandler);
        document.removeEventListener('touchend', endHandler);
        
        if (Math.abs(swiper.current.pullDeltaX) > 0) {
          release(); 
        }
      };
      
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('touchmove', moveHandler);
      document.addEventListener('mouseup', endHandler);
      document.addEventListener('touchend', endHandler);
    }
  };
  
  const pullChange = () => {
    if (!swiper.current.currentCard) return;
    
    swiper.current.animating = true;
    const deg = swiper.current.pullDeltaX / 10;
    swiper.current.currentCard.style.transform = `translateX(${swiper.current.pullDeltaX}px) rotate(${deg}deg)`;
    
    // Visual cue for accept/reject
    const choice = swiper.current.currentCard.querySelector('.demo__card__choice') as HTMLElement;
    if (choice) {
      const opacity = Math.min(Math.abs(swiper.current.pullDeltaX) / 100, 1);
      choice.style.opacity = opacity.toString();
      
      choice.classList.remove('m--like', 'm--reject');
      if (swiper.current.pullDeltaX > 0) {
        choice.classList.add('m--like');
      } else {
        choice.classList.add('m--reject');
      }
    }
  };
  
  const release = () => {
    if (!swiper.current.currentCard || swiper.current.processingDecision) return;
    
    const decisionVal = 80;
    let decided = false;
    
    // Mark that we're processing a decision to prevent duplicate processing
    swiper.current.processingDecision = true;
    
    // Handle card decision based on drag distance
    if (swiper.current.pullDeltaX > decisionVal) {
      // Swiped right - ACCEPT
      swiper.current.currentCard.classList.add('to-right');
      decided = true;
      
      // Use the dataset index to get the current phrase
      const dataIndex = parseInt(swiper.current.currentCard.dataset.index || '0', 10);
      
      if (dataIndex >= 0 && dataIndex < phrases.length) {
        const phrase = phrases[dataIndex];
        
        // Add to approved phrases
        setApprovedCount(prev => prev + 1);
        approvedPhrases.current = [...approvedPhrases.current, phrase];
        
        // Important: update the parent component FIRST
        onApprovedPhrasesChange(approvedPhrases.current);
        
        // THEN remove from current phrases AFTER animation completes
        setTimeout(() => {
          onPhrasesUpdate(phrases.filter(p => p.id !== phrase.id));
        }, 350); // Longer delay to ensure animation completes
      }
    } else if (swiper.current.pullDeltaX < -decisionVal) {
      // Swiped left - REJECT
      swiper.current.currentCard.classList.add('to-left');
      decided = true;
      
      // Use the dataset index to get the current phrase
      const dataIndex = parseInt(swiper.current.currentCard.dataset.index || '0', 10);
      
      if (dataIndex >= 0 && dataIndex < phrases.length) {
        const phrase = phrases[dataIndex];
        
        // Update rejected count
        setRejectedCount(prev => prev + 1);
        
        // Remove from current phrases AFTER animation completes
        setTimeout(() => {
          onPhrasesUpdate(phrases.filter(p => p.id !== phrase.id));
        }, 350); // Longer delay
      }
    }
    
    if (decided) {
      // Mark as inactive immediately to prevent further interaction
      swiper.current.currentCard.classList.add('inactive');
      
      // Don't remove from DOM immediately, let the animation complete
    } else {
      // Reset card position if not decided
      swiper.current.currentCard.classList.add('reset');
      
      // Clean up animation state after reset animation
      setTimeout(() => {
        if (swiper.current.currentCard) {
          swiper.current.currentCard.style.transform = '';
          swiper.current.currentCard.classList.remove('reset');
          
          const choice = swiper.current.currentCard.querySelector('.demo__card__choice') as HTMLElement;
          if (choice) {
            choice.style.opacity = '0';
          }
        }
      }, 300);
    }
    
    // Always end animation state after a delay
    setTimeout(() => {
      swiper.current.animating = false;
      swiper.current.processingDecision = false;
      updateCardStyles();
    }, 350);
  };

  const handleManualSwipe = (accepted: boolean) => {
    if (swiper.current.animating || swiper.current.processingDecision || !cardContainerRef.current) return;
    
    const cards = document.querySelectorAll('.demo__card:not(.inactive)');
    if (cards.length > 0) {
      swiper.current.currentCard = cards[0] as HTMLElement;
      swiper.current.pullDeltaX = accepted ? 100 : -100;
      pullChange();
      release();
    }
  };

  const handleStartOver = () => {
    onPhrasesUpdate([]);
    approvedPhrases.current = [];
    onApprovedPhrasesChange([]);
    setApprovedCount(0);
    setRejectedCount(0);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Review Generated Words</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-300">
            <span className="text-green-500 font-medium">{approvedCount}</span> saved • 
            <span className="text-red-500 font-medium ml-1">{rejectedCount}</span> skipped
          </div>
          <button
            onClick={handleStartOver}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
          >
            Start Over
          </button>
        </div>
      </div>
      
      <div className="demo">
        <div className="demo__content">
          <div ref={cardContainerRef} className="demo__card-cont">
            {phrases.map((phrase, index) => (
              <div 
                key={phrase.id} 
                className="demo__card"
                data-index={index}
                data-id={phrase.id}
                style={{'--n': index + 1} as React.CSSProperties}
              >
                <div className={`demo__card__top ${phrase.approved ? 'lime' : 'purple'}`}>
                  <p className="demo__card__name">{phrase.phrase.toUpperCase()}</p>
                </div>
                <div className="demo__card__btm">
                  <div className="demo__card__swipe-hint">
                    Swipe left to skip, right to save
                  </div>
                </div>
                <div className="demo__card__choice m--reject"></div>
                <div className="demo__card__choice m--like"></div>
                <div className="demo__card__drag"></div>
                <div className="demo__swipe-indicator demo__swipe-indicator--left">←</div>
                <div className="demo__swipe-indicator demo__swipe-indicator--right">→</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => handleManualSwipe(false)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
            disabled={isProcessingCard || phrases.length === 0}
          >
            Skip
          </button>
          <button
            onClick={() => handleManualSwipe(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded"
            disabled={isProcessingCard || phrases.length === 0}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhraseSwiper;