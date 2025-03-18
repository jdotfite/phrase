'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';

interface PinPadProps {
  onSubmit: (pin: string) => void;
  onCancel: () => void;
}

export default function PinPad({ onSubmit, onCancel }: PinPadProps) {
  const [pin, setPin] = React.useState('');
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'X', '0', '←'];

  function handleClick(num: string) {
    if (num === '←') {
      setPin((prev) => prev.slice(0, -1));
    } else if (num === 'X') {
      onCancel();
    } else if (pin.length < 4 && /\d/.test(num)) {
      setPin((prev) => prev + num);
    }
  }

  React.useEffect(() => {
    if (pin.length === 4) {
      onSubmit(pin);
      setPin('');
    }
  }, [pin, onSubmit]);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-[320px] py-4">
      <div className="flex gap-3 justify-center">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full ${
              pin.length > i ? 'bg-white' : 'bg-neutral-700'
            }`}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-3 gap-4 w-full">
        {numbers.map((num, idx) => {
          // Special styling for cancel (X) and backspace buttons
          if (num === 'X' || num === '←') {
            return (
              <Button
                key={idx}
                variant="ghost"
                className={`h-14 text-xl ${
                  num === 'X' 
                    ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' 
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
                onClick={() => handleClick(num)}
              >
                {num}
              </Button>
            );
          }
          
          // Number buttons
          return (
            <Button
              key={idx}
              variant="ghost"
              className="h-14 text-xl font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white"
              onClick={() => handleClick(num)}
            >
              {num}
            </Button>
          );
        })}
      </div>
      
      <Button 
        variant="outline" 
        className="mt-4 border-neutral-600 text-neutral-400 hover:bg-neutral-800 hover:text-white"
        onClick={onCancel}
      >
        Back
      </Button>
    </div>
  );
}