// providers/ThemeContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorAccent = 'default' | 'blue' | 'green' | 'purple' | 'orange';

interface ThemeContextType {
  accent: ColorAccent;
  setAccent: (accent: ColorAccent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, ...props }) {
  // Get the initial accent value from localStorage if available
  const [accent, setAccentState] = useState<ColorAccent>('default');
  const [mounted, setMounted] = useState(false);
  
  // Set up accent color with localStorage persistence
  const setAccent = (newAccent: ColorAccent) => {
    setAccentState(newAccent);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-accent', newAccent);
    }
  };
  
  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAccent = localStorage.getItem('theme-accent');
      if (savedAccent && ['default', 'blue', 'green', 'purple', 'orange'].includes(savedAccent)) {
        setAccentState(savedAccent as ColorAccent);
      }
      
      // Apply the accent to the HTML element
      document.documentElement.setAttribute('data-accent', accent);
    }
    setMounted(true);
  }, [accent]);
  
  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }
  
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem {...props}>
      <ThemeContext.Provider 
        value={{
          accent,
          setAccent,
        }}
      >
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return {
    ...context,
    theme: theme as ThemeMode,
    setTheme,
    resolvedTheme: resolvedTheme as ThemeMode,
    systemTheme: systemTheme as ThemeMode,
    toggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
    isLight: resolvedTheme === 'light',
    isDark: resolvedTheme === 'dark',
  };
}