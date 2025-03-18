import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SelectProps } from '@/types/types';

const CategorySelect: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select Category",
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
              All Categories
            </SelectItem>
          )}
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelect;