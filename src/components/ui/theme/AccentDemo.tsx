// components/ui/theme/AccentDemo.tsx
'use client';

import React from 'react';
import { useTheme } from '@/providers/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function AccentDemo() {
  const { accent } = useTheme();
  
  const accentLabels = {
    'default': 'Grayscale',
    'blue': 'Blue',
    'green': 'Green',
    'purple': 'Purple',
    'orange': 'Orange'
  };
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Accent Color Demo - {accentLabels[accent]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            className="h-16 rounded flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            Accent Color
          </div>
          <div 
            className="h-16 rounded flex items-center justify-center text-accent-foreground font-medium"
            style={{ backgroundColor: 'var(--accent-muted)' }}
          >
            Accent Muted
          </div>
          <div 
            className="h-16 rounded bg-background flex items-center justify-center border"
            style={{ color: 'var(--accent-color)' }}
          >
            Text in Accent
          </div>
          <div 
            className="h-16 rounded flex items-center justify-center text-white font-medium"
            style={{ 
              background: 'linear-gradient(to right, var(--accent-muted), var(--accent-color))' 
            }}
          >
            Accent Gradient
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Chart Colors:</h3>
          <div className="grid grid-cols-5 gap-2 h-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i}
                className="rounded"
                style={{ backgroundColor: `hsl(var(--chart-${i}))` }}
              />
            ))}
          </div>
        </div>
        
        <button 
          className="px-4 py-2 rounded text-white"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          Accent Button
        </button>
        
        <div className="grid grid-cols-5 gap-4 mt-4">
          <Card className={cn("p-4 text-center border-2", accent === 'default' ? 'border-gray-500' : '')}>
            <div className="font-medium">Default</div>
          </Card>
          <Card className={cn("p-4 text-center border-2", accent === 'blue' ? 'border-blue-500' : '')}>
            <div className="font-medium">Blue</div>
          </Card>
          <Card className={cn("p-4 text-center border-2", accent === 'green' ? 'border-green-500' : '')}>
            <div className="font-medium">Green</div>
          </Card>
          <Card className={cn("p-4 text-center border-2", accent === 'purple' ? 'border-purple-500' : '')}>
            <div className="font-medium">Purple</div>
          </Card>
          <Card className={cn("p-4 text-center border-2", accent === 'orange' ? 'border-orange-500' : '')}>
            <div className="font-medium">Orange</div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

export default AccentDemo;