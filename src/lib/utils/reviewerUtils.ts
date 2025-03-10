import type { Phrase, NewPhrase, TagValidationResult } from '@/types/types';

/**
 * Validates and formats tags
 */
export const validateTags = (tags: string): TagValidationResult => {
  const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
  
  const errors: string[] = [];
  
  if (tagArray.length === 0) {
    errors.push('At least one tag is required');
  }
  
  if (tagArray.some(tag => tag.length < 2)) {
    errors.push('Tags must be at least 2 characters long');
  }
  
  if (tagArray.some(tag => !/^[a-zA-Z0-9\s]+$/.test(tag))) {
    errors.push('Tags can only contain letters, numbers, and spaces');
  }

  const formattedTags = tagArray.join(',');

  return {
    isValid: errors.length === 0,
    formattedTags,
    errors
  };
};

/**
 * Formats and sanitizes a phrase object
 */
export const sanitizePhrase = (phrase: Partial<Phrase | NewPhrase>): Partial<Phrase | NewPhrase> => {
  return {
    ...phrase,
    phrase: phrase.phrase?.trim(),
    category: phrase.category?.trim(),
    difficulty: phrase.difficulty?.trim(),
    subcategory: phrase.subcategory?.trim(),
    tags: phrase.tags?.split(',').map(t => t.trim()).filter(Boolean).join(','),
    hint: phrase.hint?.trim(),
    part_of_speech: phrase.part_of_speech?.trim()
  };
};

/**
 * Groups phrases by category
 */
export const groupPhrasesByCategory = (phrases: Phrase[]): Record<string, Phrase[]> => {
  return phrases.reduce((acc, phrase) => {
    const category = phrase.category || 'Uncategorized';
    acc[category] = acc[category] || [];
    acc[category].push(phrase);
    return acc;
  }, {} as Record<string, Phrase[]>);
};

/**
 * Filters phrases based on search criteria
 */
export const filterPhrases = (
  phrases: Phrase[],
  filters: {
    searchTerm?: string;
    category?: string;
    difficulty?: string;
    subcategory?: string;
    part_of_speech?: string;
  }
): Phrase[] => {
  return phrases.filter(phrase => {
    const searchTermMatch = !filters.searchTerm || 
      phrase.phrase.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      phrase.tags.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const categoryMatch = !filters.category || 
      phrase.category.toLowerCase() === filters.category.toLowerCase();

    const difficultyMatch = !filters.difficulty || 
      phrase.difficulty.toLowerCase() === filters.difficulty.toLowerCase();

    const subcategoryMatch = !filters.subcategory || 
      phrase.subcategory.toLowerCase() === filters.subcategory.toLowerCase();

    const partOfSpeechMatch = !filters.part_of_speech || 
      phrase.part_of_speech.toLowerCase() === filters.part_of_speech.toLowerCase();

    return searchTermMatch && categoryMatch && difficultyMatch && 
           subcategoryMatch && partOfSpeechMatch;
  });
};

/**
 * Sorts phrases by specified criteria
 */
export const sortPhrases = (
  phrases: Phrase[],
  sortKey: keyof Phrase,
  sortDirection: 'asc' | 'desc'
): Phrase[] => {
  return [...phrases].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (aVal === bVal) return 0;
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    const comparison = aVal < bVal ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });
};

/**
 * Checks if a phrase needs review (hasn't been used in a while)
 */
export const needsReview = (phrase: Phrase, daysThreshold: number = 30): boolean => {
  if (!phrase.last_used) return true;
  
  const lastUsed = new Date(phrase.last_used);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastUsed.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > daysThreshold;
};

/**
 * Gets phrases that haven't been used in a while
 */
export const getPhrasesNeedingReview = (
  phrases: Phrase[],
  daysThreshold: number = 30
): Phrase[] => {
  return phrases.filter(phrase => needsReview(phrase, daysThreshold));
};

/**
 * Gets phrases by difficulty level
 */
export const getPhrasesByDifficulty = (
  phrases: Phrase[],
  difficulty: string
): Phrase[] => {
  return phrases.filter(
    phrase => phrase.difficulty.toLowerCase() === difficulty.toLowerCase()
  );
};

/**
 * Gets related phrases based on tags
 */
export const getRelatedPhrases = (
  phrases: Phrase[],
  currentPhrase: Phrase,
  maxResults: number = 5
): Phrase[] => {
  const currentTags = new Set(currentPhrase.tags.split(',').map(t => t.trim()));
  
  return phrases
    .filter(phrase => phrase.id !== currentPhrase.id)
    .map(phrase => {
      const phraseTags = new Set(phrase.tags.split(',').map(t => t.trim()));
      const commonTags = new Set(
        [...currentTags].filter(tag => phraseTags.has(tag))
      );
      return {
        phrase,
        commonTagCount: commonTags.size
      };
    })
    .filter(({ commonTagCount }) => commonTagCount > 0)
    .sort((a, b) => b.commonTagCount - a.commonTagCount)
    .slice(0, maxResults)
    .map(({ phrase }) => phrase);
};

/**
 * Gets phrase usage statistics
 */
export const getPhraseUsageStats = (phrases: Phrase[]) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  
  return phrases.reduce((stats, phrase) => {
    if (!phrase.last_used) {
      stats.neverUsed++;
    } else {
      const lastUsed = new Date(phrase.last_used);
      if (lastUsed < thirtyDaysAgo) {
        stats.notRecentlyUsed++;
      } else {
        stats.recentlyUsed++;
      }
    }
    return stats;
  }, {
    neverUsed: 0,
    notRecentlyUsed: 0,
    recentlyUsed: 0
  });
};

/**
 * Gets the most used tags across all phrases
 */
export const getMostUsedTags = (
  phrases: Phrase[],
  limit: number = 10
): Array<{ tag: string; count: number }> => {
  const tagCounts = phrases.reduce((acc, phrase) => {
    phrase.tags.split(',').forEach(tag => {
      const trimmedTag = tag.trim();
      acc[trimmedTag] = (acc[trimmedTag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export default {
  validateTags,
  sanitizePhrase,
  groupPhrasesByCategory,
  filterPhrases,
  sortPhrases,
  needsReview,
  getPhrasesNeedingReview,
  getPhrasesByDifficulty,
  getRelatedPhrases,
  getPhraseUsageStats,
  getMostUsedTags
};
