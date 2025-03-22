// features/phrases/utils/formatting.ts
/**
 * Returns the appropriate CSS classes for a difficulty bar
 */
export const getDifficultyBar = (difficulty: number) => {
  const colorClass = 
    difficulty === 1 ? 'bg-gray-200' : 
    difficulty === 2 ? 'bg-gray-200' : 
    difficulty === 3 ? 'bg-gray-200' : 'bg-gray-200';
  
  const width = 
    difficulty === 1 ? 'w-1/3' : 
    difficulty === 2 ? 'w-2/3' : 
    difficulty === 3 ? 'w-full' : 'w-0';
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
      <div className={`${colorClass} ${width} h-2.5 rounded-full`}></div>
    </div>
  );
};

/**
 * Converts a numeric difficulty to a human-readable string
 */
export const formatDifficulty = (value: number): string => {
  switch (value) {
    case 1: return 'Easy';
    case 2: return 'Medium';
    case 3: return 'Hard';
    default: return 'Unknown';
  }
};

/**
 * Formats tags string into an array of tag strings
 */
export const formatTags = (tags: string): string[] => {
  return tags.split(',').map(tag => tag.trim()).filter(Boolean);
};