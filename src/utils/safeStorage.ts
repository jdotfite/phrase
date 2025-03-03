// Add this utility function somewhere in your utils folder
// utils/safeStorage.ts

export const safeStorage = {
    getItem: (key: string): string | null => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return localStorage.getItem(key);
        }
        return null;
      } catch (error) {
        console.warn('Unable to access localStorage:', error);
        return null;
      }
    },
    
    setItem: (key: string, value: string): boolean => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(key, value);
          return true;
        }
        return false;
      } catch (error) {
        console.warn('Unable to access localStorage:', error);
        return false;
      }
    }
  };