import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelect
}) => {
  return (
    <div className="w-1/2">
      <Select 
        value={selectedCategory || "all"} 
        onValueChange={(value) => onSelect(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full bg-gray-800 border-gray-700">
          <SelectValue placeholder="Choose a Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Choose a Category</SelectItem>
          {categories.map(category => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategoryFilter;