import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RowsPerPageSelectProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  className?: string;
}

const RowsPerPageSelect: React.FC<RowsPerPageSelectProps> = ({
  value,
  onChange,
  options = [10, 25, 50, 100],
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-400">
        Rows per page:
      </span>
      <Select
        value={value.toString()}
        onValueChange={(val) => onChange(Number(val))}
      >
        <SelectTrigger className="w-[100px] bg-gray-700 border-gray-600">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option} 
              value={option.toString()}
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RowsPerPageSelect;