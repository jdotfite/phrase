import { supabase } from '@/lib/supabase';
import { validateBulkImport, sanitizePhrase } from './Validators';
import type { NewPhrase, Phrase } from '@/types/types';

interface BulkImportResult {
  success: boolean;
  message: string;
  newIds?: number[];
}

interface ImportedPhrase extends NewPhrase {
  id: number;
}

/**
 * Handles bulk import of phrases
 */
export const handleBulkImport = async (text: string): Promise<BulkImportResult> => {
  try {
    // Validate the input format
    const validation = validateBulkImport(text);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.errors.join('\n')
      };
    }

    // Parse and process the data
    const rows = text.trim().split('\n').map((row, index) => {
      const [phrase, category, difficulty, subcategory, tags, hint, part_of_speech] = 
        row.split(',').map(field => field.trim());

      const newPhrase: NewPhrase = {
        phrase,
        category,
        difficulty,
        subcategory,
        tags,
        hint,
        part_of_speech
      };

      return sanitizePhrase(newPhrase) as NewPhrase;
    });

    // Insert the data
    const { data, error } = await supabase
      .from('phrases')
      .insert(rows)
      .select('id');

    if (error) {
      throw new Error(error.message);
    }

    const newIds = (data as ImportedPhrase[]).map(phrase => phrase.id);

    return {
      success: true,
      message: `Successfully imported ${rows.length} phrases.`,
      newIds
    };
  } catch (err) {
    console.error('Bulk import error:', err);
    return {
      success: false,
      message: err instanceof Error 
        ? err.message 
        : 'An error occurred during import'
    };
  }
};

/**
 * Validates a CSV file before import
 */
export const validateCSVFile = (file: File): Promise<{ isValid: boolean; message: string }> => {
  return new Promise((resolve, reject) => {
    // Check file type
    if (!file.name.endsWith('.csv')) {
      resolve({ 
        isValid: false, 
        message: 'File must be a CSV document' 
      });
      return;
    }

    // Check file size (e.g., 5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      resolve({ 
        isValid: false, 
        message: 'File size must be less than 5MB' 
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const validation = validateBulkImport(text);
        
        resolve({
          isValid: validation.isValid,
          message: validation.isValid 
            ? 'File is valid' 
            : validation.errors.join('\n')
        });
      } catch (err) {
        resolve({
          isValid: false,
          message: 'Error reading file content'
        });
      }
    };

    reader.onerror = () => {
      resolve({
        isValid: false,
        message: 'Error reading file'
      });
    };

    reader.readAsText(file);
  });
};

/**
 * Processes a CSV file and returns structured data
 */
export const processCSVFile = async (file: File): Promise<NewPhrase[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const phrases = text
          .trim()
          .split('\n')
          .map((row) => {
            const [phrase, category, difficulty, subcategory, tags, hint, part_of_speech] = 
              row.split(',').map(field => field.trim());

            return sanitizePhrase({
              phrase,
              category,
              difficulty,
              subcategory,
              tags,
              hint,
              part_of_speech
            }) as NewPhrase;
          });

        resolve(phrases);
      } catch (err) {
        reject(new Error('Error processing CSV file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading CSV file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Downloads current phrases as CSV
 */
export const exportToCSV = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('phrases')
      .select('*')
      .order('id');

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Create CSV header
    const headers = ['phrase', 'category', 'difficulty', 'subcategory', 'tags', 'hint', 'part_of_speech'];
    
    // Convert data to CSV rows
    const rows = data.map((phrase: Phrase) =>
      headers
        .map(header => phrase[header as keyof Phrase] || '')
        .map(field => `"${String(field).replace(/"/g, '""')}"`) // Escape quotes
        .join(',')
    );

    // Combine header and rows
    const csv = [headers.join(','), ...rows].join('\n');
    
    return csv;
  } catch (err) {
    console.error('Export error:', err);
    throw err;
  }
};