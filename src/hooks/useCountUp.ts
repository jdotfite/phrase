import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
  easing?: (t: number) => number;
  enabled?: boolean;
}

// Default easing function (easeOutExpo)
const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export const useCountUp = (
  endValue: number,
  {
    duration = 2000,
    delay = 0,
    easing = easeOutExpo,
    enabled = true
  }: UseCountUpOptions = {}
): number => {
  const [count, setCount] = useState<number>(0);
  const frameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | null>(null);
  const endValueRef = useRef<number>(endValue);

  useEffect(() => {
    endValueRef.current = endValue;
  }, [endValue]);

  useEffect(() => {
    if (!enabled) {
      setCount(endValue);
      return;
    }

    // Clear any existing animation
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    const timeout = setTimeout(() => {
      const animate = (currentTime: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = currentTime;
        }

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        
        setCount(Math.round(easedProgress * endValueRef.current));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    // Cleanup function
    return () => {
      clearTimeout(timeout);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [duration, delay, easing, enabled]);

  // If animation is disabled, return end value directly
  if (!enabled) {
    return endValue;
  }

  return count;
};

export default useCountUp;