// components/reviewer/PinPad.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PinPadProps {
  onSubmit: (pin: string) => void;
  onCancel: () => void;
}

const PinPad = ({ onSubmit, onCancel }: PinPadProps) => {
  const [pin, setPin] = useState<string>('');
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  const handleClick = (value: string) => {
    if (value === '⌫') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4) {
      setPin(prev => prev + value);
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      onSubmit(pin);
      setPin('');
    }
  }, [pin, onSubmit]);

  return (
  <div className="flex items-center justify-center min-h-screen">
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm items-center justify-center">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Enter PIN</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5 text-white" />
        </Button>
      </div>
      
      <div className="flex justify-center mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 mx-2 rounded-full ${
              pin.length > i ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {numbers.map((num, index) => (
          <Button
            key={index}
            onClick={() => num && handleClick(num)}
            className={`h-16 text-2xl rounded-full text-white ${
              !num ? 'invisible' : ''
            }`}
            variant="outline"
          >
            {num}
          </Button>
        ))}
      </div>
    </div>
	</div>
  );
};

export default PinPad;