import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SelectProps } from '@/types/types';

const PartOfSpeechSelect: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select Part of Speech",
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
              All Parts of Speech
            </SelectItem>
          )}
          {options.map((partOfSpeech) => (
            <SelectItem key={partOfSpeech} value={partOfSpeech}>
              {partOfSpeech}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PartOfSpeechSelect;