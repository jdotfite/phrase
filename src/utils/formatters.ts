/**
 * Formats a number with commas for thousands
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Formats a number as a percentage
 */
export const formatPercent = (num: number, decimals: number = 0): string => {
  return `${num.toFixed(decimals)}%`;
};

/**
 * Formats a date in a localized format
 */
export const formatDate = (date: Date | string | null): string => {
  if (!date) return 'Never';
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formats a date relative to now (e.g., "2 days ago")
 */
export const formatRelativeDate = (date: Date | string | null): string => {
  if (!date) return 'Never';

  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
};

/**
 * Formats difficulty level with color class
 */
export const formatDifficulty = (difficulty: string): { text: string; colorClass: string } => {
  const normalized = difficulty.toLowerCase();
  switch (normalized) {
    case 'easy':
      return { text: 'Easy', colorClass: 'text-green-400' };
    case 'medium':
      return { text: 'Medium', colorClass: 'text-yellow-400' };
    case 'hard':
      return { text: 'Hard', colorClass: 'text-red-400' };
    default:
      return { text: difficulty, colorClass: 'text-gray-400' };
  }
};

/**
 * Formats tags as an array with optional truncation
 */
export const formatTags = (tags: string, maxTags?: number): string[] => {
  const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
  if (maxTags && tagArray.length > maxTags) {
    return [...tagArray.slice(0, maxTags), `+${tagArray.length - maxTags} more`];
  }
  return tagArray;
};

/**
 * Formats file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formats a string to title case
 */
export const formatTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formats text with ellipsis if it exceeds max length
 */
export const formatTruncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Formats category for display
 */
export const formatCategory = (category: string): { text: string; icon: string } => {
  const normalized = category.toLowerCase();
  switch (normalized) {
    case 'movies':
      return { text: 'Movies', icon: '🎬' };
    case 'tv':
      return { text: 'TV Shows', icon: '📺' };
    case 'books':
      return { text: 'Books', icon: '📚' };
    case 'music':
      return { text: 'Music', icon: '🎵' };
    case 'games':
      return { text: 'Games', icon: '🎮' };
    default:
      return { text: formatTitleCase(category), icon: '📝' };
  }
};

/**
 * Formats CSV data into a downloadable string
 */
export const formatCSV = (data: Record<string, any>[]): string => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers
      .map(header => {
        const cell = row[header]?.toString() ?? '';
        return `"${cell.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
};