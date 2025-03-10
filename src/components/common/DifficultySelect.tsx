import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SelectProps } from '@/types/types';

const difficultyColors = {
  Easy: 'text-green-400',
  Medium: 'text-yellow-400',
  Hard: 'text-red-400'
};

const DifficultySelect: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select Difficulty",
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`w-full space-y-2 ${className}`}>
      <Select
        value={value}
        onValueChange={onChange}
        required={required}
        disabled={disabled}
      >
        <SelectTrigger className="w-full bg-gray-700 border-gray-600">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {!required && (
            <SelectItem value="">
              All Difficulties
            </SelectItem>
          )}
          {options.map((difficulty) => (
            <SelectItem 
              key={difficulty} 
              value={difficulty}
              className={difficultyColors[difficulty as keyof typeof difficultyColors]}
            >
              {difficulty}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DifficultySelect;