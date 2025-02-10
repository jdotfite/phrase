import React from 'react';
import type { TagDisplayProps } from '@/types/types';

const TagDisplay: React.FC<TagDisplayProps> = ({ tags, onClick }) => {
  const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
  
  return (
    <div className="flex flex-wrap gap-2">
      {tagArray.map((tag, idx) => (
        <button
          key={`${tag}-${idx}`}
          onClick={() => onClick?.(tag)}
          className={`
            px-2 py-1 text-xs rounded-full bg-gray-700
            ${onClick 
              ? 'hover:bg-gray-600 cursor-pointer' 
              : 'cursor-default'
            }
            transition-colors duration-150
          `}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagDisplay;