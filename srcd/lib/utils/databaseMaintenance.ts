import { supabase } from '@/lib/services/supabase';
import type { Phrase } from '@/types/types';

interface MaintenanceResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

interface PhraseTag {
  id: number;
  tags: string;
}

interface PhraseCategory {
  category: string;
}

/**
 * Updates existing tags format
 */
export const updateExistingTags = async (): Promise<MaintenanceResult> => {
  try {
    const { data, error } = await supabase
      .from('phrases')
      .select('id, tags');

    if (error) throw error;
    if (!data) throw new Error('No data returned');

    const updates = data.map((phrase: PhraseTag) => ({
      id: phrase.id,
      tags: phrase.tags
        .split(/[,\s]+/) // Split by comma or whitespace
        .map((tag: string) => tag.trim())
        .filter(Boolean)
        .join(',')
    }));

    const { error: updateError } = await supabase
      .from('phrases')
      .upsert(updates);

    if (updateError) throw updateError;

    return {
      success: true,
      message: `Successfully updated tags for ${updates.length} phrases.`,
      details: { updatedCount: updates.length }
    };
  } catch (err) {
    console.error('Error updating tags:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An error occurred while updating tags'
    };
  }
};

/**
 * Cleans up unused categories
 */
export const cleanupCategories = async (): Promise<MaintenanceResult> => {
  try {
    const { data, error } = await supabase
      .from('phrases')
      .select('category');

    if (error) throw error;
    if (!data) throw new Error('No data returned');

    const categories = new Set(data.map((p: PhraseCategory) => p.category).filter(Boolean));
    const unusedCategories = Array.from(categories).filter(category => 
      !data.some((p: PhraseCategory) => p.category === category)
    );

    if (unusedCategories.length === 0) {
      return {
        success: true,
        message: 'No unused categories found.',
        details: { unusedCount: 0 }
      };
    }

    const { error: deleteError } = await supabase
      .from('phrases')
      .update({ category: 'Uncategorized' })
      .in('category', unusedCategories);

    if (deleteError) throw deleteError;

    return {
      success: true,
      message: `Cleaned up ${unusedCategories.length} unused categories.`,
      details: {
        unusedCount: unusedCategories.length,
        categories: unusedCategories
      }
    };
  } catch (err) {
    console.error('Error cleaning categories:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An error occurred while cleaning categories'
    };
  }
};

/**
 * Validates all phrases in the database
 */
export const validateDatabase = async (): Promise<MaintenanceResult> => {
  try {
    const { data, error } = await supabase
      .from('phrases')
      .select('*');

    if (error) throw error;
    if (!data) throw new Error('No data returned');

    const issues: Array<{ id: number; issues: string[] }> = [];

    data.forEach((phrase: Phrase) => {
      const phraseIssues: string[] = [];

      if (!phrase.phrase?.trim()) {
        phraseIssues.push('Missing phrase text');
      }
      if (!phrase.category?.trim()) {
        phraseIssues.push('Missing category');
      }
      if (!['Easy', 'Medium', 'Hard'].includes(phrase.difficulty)) {
        phraseIssues.push('Invalid difficulty level');
      }
      if (!phrase.tags?.trim()) {
        phraseIssues.push('Missing tags');
      }

      if (phraseIssues.length > 0) {
        issues.push({ id: phrase.id, issues: phraseIssues });
      }
    });

    return {
      success: true,
      message: `Validation complete. Found ${issues.length} phrases with issues.`,
      details: { issues }
    };
  } catch (err) {
    console.error('Error validating database:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An error occurred while validating the database'
    };
  }
};

/**
 * Performs database backup
 */
export const backupDatabase = async (): Promise<MaintenanceResult> => {
  try {
    const { data, error } = await supabase
      .from('phrases')
      .select('*');

    if (error) throw error;
    if (!data) throw new Error('No data returned');

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map((row: Record<string, any>) =>
        headers
          .map(header => {
            const cell = row[header]?.toString() ?? '';
            return `"${cell.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
    ].join('\n');

    // Create backup timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `phrases-backup-${timestamp}.csv`;

    return {
      success: true,
      message: 'Backup created successfully.',
      details: {
        filename,
        content: csv,
        timestamp,
        recordCount: data.length
      }
    };
  } catch (err) {
    console.error('Error creating backup:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An error occurred while creating backup'
    };
  }
};
