import React from 'react';
import { cn } from '@/lib/utils';

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
  if (!tags) return null;
  
  const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
  
  if (tagArray.length === 0) return null;
  
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {tagArray.map((tag, idx) => (
        <button
          key={`${tag}-${idx}`}
          onClick={() => onClick?.(tag)}
          className={cn(
            "px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
            onClick ? "hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer" : "cursor-default",
            "transition-colors duration-150"
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagDisplay;