// components/ui/theme/ThemeSwitcher.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';

interface ThemeSwitcherProps {
  showAccentColors?: boolean;
}

export function ThemeSwitcher({ showAccentColors = false }: ThemeSwitcherProps) {
  const { theme, setTheme, accent, setAccent } = useTheme();
  
  console.log('Current theme state:', { theme, accent });
  
  const handleThemeChange = (newTheme: string) => {
    console.log('Setting theme to:', newTheme);
    setTheme(newTheme);
  };
  
  // Fix the type to match the ColorAccent type
  const handleAccentChange = (newAccent: 'default' | 'blue' | 'green' | 'purple' | 'orange') => {
    console.log('Setting accent to:', newAccent);
    setAccent(newAccent);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-md">
          {theme === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : theme === 'light' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
        
        {showAccentColors && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <Palette className="mr-2 h-4 w-4" />
              <span>Accent Colors</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleAccentChange('default')}
              className="pl-8"
            >
              <div className="mr-2 h-4 w-4 rounded-full bg-gray-500" />
              <span>Grayscale (Default)</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleAccentChange('blue')}
              className="pl-8"
            >
              <div className="mr-2 h-4 w-4 rounded-full bg-blue-500" />
              <span>Blue</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleAccentChange('green')}
              className="pl-8"
            >
              <div className="mr-2 h-4 w-4 rounded-full bg-green-500" />
              <span>Green</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleAccentChange('purple')}
              className="pl-8"
            >
              <div className="mr-2 h-4 w-4 rounded-full bg-purple-500" />
              <span>Purple</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleAccentChange('orange')}
              className="pl-8"
            >
              <div className="mr-2 h-4 w-4 rounded-full bg-orange-500" />
              <span>Orange</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeSwitcher;