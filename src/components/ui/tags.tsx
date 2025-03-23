import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/ThemeContext';

interface TagDisplayProps {
  tags: string;
  onClick?: (tag: string) => void;
  className?: string;
}

const TagDisplay: React.FC<TagDisplayProps> = ({ 
  tags, 
  onClick,
  className
}) => {
  const { accent } = useTheme();
  
  // Skip rendering if no tags
  if (!tags) return null;
  
  const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
  
  if (tagArray.length === 0) return null;
  
  // Get accent-specific tag colors
  const getTagColors = () => {
    switch (accent) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800';
      case 'green':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800';
      case 'orange':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800';
      default: // grayscale
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
    }
  };
  
  const tagColors = getTagColors();
  
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {tagArray.map((tag, idx) => (
        <button
          key={`${tag}-${idx}`}
          onClick={() => onClick?.(tag)}
          className={cn(
            "px-2 py-0.5 text-xs rounded-full",
            tagColors,
            onClick ? "cursor-pointer" : "cursor-default",
            "transition-colors duration-150",
            className
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagDisplay;