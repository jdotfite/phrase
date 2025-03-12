import { useState, useEffect, useRef } from 'react';

interface DebouncedState<T> {
  debouncedValue: T;
  isDebouncing: boolean;
  flush: () => void;
  cancel: () => void;
}

/**
 * Custom hook for debouncing values
 */
export function useDebounce<T>(
  value: T,
  delay: number = 500,
  options: {
    leading?: boolean;
    maxWait?: number;
  } = {}
): DebouncedState<T> {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const maxWaitTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const valueRef = useRef<T>(value);
  const maxWaitStartTimeRef = useRef<number | undefined>(undefined);

  // Update the latest value
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Cleanup function
  const cleanup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current);
    }
  };

  // Handle the debounced update
  const update = () => {
    setDebouncedValue(valueRef.current);
    setIsDebouncing(false);
    maxWaitStartTimeRef.current = undefined;
    cleanup();
  };

  // Reset effects on delay change
  useEffect(() => {
    cleanup();
    setIsDebouncing(false);
  }, [delay]);

  // Main debounce effect
  useEffect(() => {
    if (delay <= 0) {
      setDebouncedValue(value);
      return;
    }

    setIsDebouncing(true);

    // Handle leading edge
    if (options.leading && !timeoutRef.current) {
      setDebouncedValue(value);
      setIsDebouncing(false);
      return;
    }

    // Set up max wait timeout if specified
    if (options.maxWait && !maxWaitStartTimeRef.current) {
      maxWaitStartTimeRef.current = Date.now();
      maxWaitTimeoutRef.current = setTimeout(() => {
        if (maxWaitStartTimeRef.current) {
          update();
        }
      }, options.maxWait);
    }

    // Set up main timeout
    timeoutRef.current = setTimeout(update, delay);

    return cleanup;
  }, [value, delay, options.leading, options.maxWait]);

  // Flush function to immediately update value
  const flush = () => {
    if (timeoutRef.current) {
      update();
    }
  };

  // Cancel function to stop debouncing
  const cancel = () => {
    if (timeoutRef.current) {
      cleanup();
      setIsDebouncing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => cleanup, []);

  return {
    debouncedValue,
    isDebouncing,
    flush,
    cancel
  };
}

/**
 * Simplified version that only returns the debounced value
 */
export function useSimpleDebounce<T>(value: T, delay: number = 500): T {
  const { debouncedValue } = useDebounce(value, delay);
  return debouncedValue;
}

/**
 * Version specifically for debouncing callbacks
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500,
  deps: any[] = []
): [(...args: Parameters<T>) => void, boolean, () => void] {
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount or deps change
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);

  const debouncedCallback = (...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsDebouncing(true);

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
      setIsDebouncing(false);
    }, delay);
  };

  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setIsDebouncing(false);
    }
  };

  return [debouncedCallback, isDebouncing, cancel];
}

export default useDebounce;