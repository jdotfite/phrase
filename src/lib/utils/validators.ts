import type { TagValidationResult, Phrase, NewPhrase } from '@/types/types';

/**
 * Validates tags input
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

  return {
    isValid: errors.length === 0,
    formattedTags: tagArray.join(','),
    errors
  };
};

/**
 * Validates a complete phrase object
 */
export const validatePhrase = (phrase: Partial<Phrase | NewPhrase>): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  // Required fields
  if (!phrase.phrase?.trim()) {
    errors.phrase = 'Phrase is required';
  }

  if (!phrase.category?.trim()) {
    errors.category = 'Category is required';
  }

  if (!phrase.difficulty?.trim()) {
    errors.difficulty = 'Difficulty is required';
  }

  if (!phrase.part_of_speech?.trim()) {
    errors.part_of_speech = 'Part of speech is required';
  }

  // Length validations
  if (phrase.phrase && phrase.phrase.length < 2) {
    errors.phrase = 'Phrase must be at least 2 characters long';
  }

  if (phrase.subcategory && phrase.subcategory.length < 2) {
    errors.subcategory = 'Subcategory must be at least 2 characters long';
  }

  // Validate difficulty values
  if (
    phrase.difficulty &&
    !['Easy', 'Medium', 'Hard'].includes(phrase.difficulty)
  ) {
    errors.difficulty = 'Invalid difficulty value';
  }

  // Validate tags
  if (phrase.tags) {
    const tagValidation = validateTags(phrase.tags);
    if (!tagValidation.isValid) {
      errors.tags = tagValidation.errors?.[0] || 'Invalid tags';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates bulk import data format
 */
export const validateBulkImport = (
  data: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const lines = data.trim().split('\n');

  if (lines.length === 0) {
    errors.push('No data provided');
    return { isValid: false, errors };
  }

  lines.forEach((line, index) => {
    const fields = line.split(',').map(field => field.trim());

    if (fields.length !== 7) {
      errors.push(
        `Line ${index + 1}: Expected 7 fields but got ${fields.length}`
      );
      return;
    }

    const [phrase, category, difficulty, subcategory, tags, hint, part_of_speech] = fields;

    if (!phrase) {
      errors.push(`Line ${index + 1}: Phrase is required`);
    }

    if (!category) {
      errors.push(`Line ${index + 1}: Category is required`);
    }

    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      errors.push(`Line ${index + 1}: Invalid difficulty value`);
    }

    const tagValidation = validateTags(tags);
    if (!tagValidation.isValid) {
      errors.push(`Line ${index + 1}: ${tagValidation.errors?.[0]}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formats and sanitizes phrase data
 */
export const sanitizePhrase = (phrase: Partial<Phrase | NewPhrase>): Partial<Phrase | NewPhrase> => {
  return {
    ...phrase,
    phrase: phrase.phrase?.trim(),
    category: phrase.category?.trim(),
    subcategory: phrase.subcategory?.trim(),
    tags: phrase.tags?.split(',').map(t => t.trim()).filter(Boolean).join(','),
    hint: phrase.hint?.trim(),
    part_of_speech: phrase.part_of_speech?.trim()
  };
};