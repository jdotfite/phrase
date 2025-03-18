// components/common/FilterModal.tsx
import React from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    searchTerm: string;
    category: string;
    difficulty: string;
    subcategory: string;
    part_of_speech: string;
  };
  onChange: (name: string, value: string) => void;
  onReset: () => void;
  categories: string[];
  difficulties: string[];
  partsOfSpeech: string[];
  subcategories: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
  categories,
  difficulties,
  partsOfSpeech,
  subcategories = []
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Phrases</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={filters.searchTerm}
                onChange={(e) => onChange('searchTerm', e.target.value)}
                placeholder="Search phrases or tags..."
                className="pl-9"
              />
            </div>
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={filters.category}
              onValueChange={(value) => onChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Subcategory */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Subcategory</label>
            <Select
              value={filters.subcategory}
              onValueChange={(value) => onChange('subcategory', value)}
              disabled={!filters.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Subcategories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subcategories</SelectItem>
                {subcategories.map(subcategory => (
                  <SelectItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select
              value={filters.difficulty}
              onValueChange={(value) => onChange('difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Difficulties</SelectItem>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Part of Speech */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Part of Speech</label>
            <Select
              value={filters.part_of_speech}
              onValueChange={(value) => onChange('part_of_speech', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Parts of Speech" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Parts of Speech</SelectItem>
                {partsOfSpeech.map(pos => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onReset}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Reset Filters
          </Button>
          <Button type="submit" onClick={onClose}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;