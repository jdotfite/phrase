// features/dashboard/hooks/useExport.ts
import { useState } from 'react';
import { supabase } from '@/lib/services/supabase';
import { saveAs } from 'file-saver';

export interface ExportOptions {
  exportJson: boolean;
  exportHeader: boolean;
  optimizeForESP32: boolean;
}

export interface ExportResult {
  jsonData: any;
  headerContent: string;
}

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Export phrases data according to options
   */
  const exportPhrases = async (options: ExportOptions): Promise<ExportResult | null> => {
    setIsExporting(true);
    setError(null);
    
    try {
      // Fetch phrases with all related data
      const { data: phrases, error: phrasesError } = await supabase
        .from('phrases')
        .select(`
          id,
          phrase,
          part_of_speech,
          hint,
          category_id,
          subcategory_id,
          difficulty,
          categories:category_id(name),
          subcategories:subcategory_id(name)
        `);
      
      if (phrasesError) throw phrasesError;
      
      // Fetch phrase tags
      const { data: phraseTags, error: tagsError } = await supabase
        .from('phrase_tags')
        .select(`
          phrase_id,
          tags:tag_id(tag)
        `);
        
      if (tagsError) throw tagsError;
      
      // Process data
      const tagsByPhraseId: Record<string, string[]> = {};
      phraseTags.forEach((item: any) => {
        if (!tagsByPhraseId[item.phrase_id]) {
          tagsByPhraseId[item.phrase_id] = [];
        }
        tagsByPhraseId[item.phrase_id].push(item.tags.tag);
      });
      
      const categorizedPhrases: Record<string, any[]> = {};
      phrases.forEach((phrase: any) => {
        const categoryName = phrase.categories ? phrase.categories.name : 'Uncategorized';
        if (!categorizedPhrases[categoryName]) {
          categorizedPhrases[categoryName] = [];
        }
        
        categorizedPhrases[categoryName].push({
          text: phrase.phrase,
          pos: phrase.part_of_speech,
          hint: phrase.hint || '',
          difficulty: phrase.difficulty || 1,
          subcategory: phrase.subcategories ? phrase.subcategories.name : null,
          tags: tagsByPhraseId[phrase.id] || [],
        });
      });
      
      // Format data according to export options
      const esp32Data: Record<string, any[]> = {};
      Object.keys(categorizedPhrases).forEach(cat => {
        if (options.optimizeForESP32) {
          esp32Data[cat] = categorizedPhrases[cat].map(p => ({
            t: p.text,
            h: p.hint || '',
            d: p.difficulty || 1
          }));
        } else {
          esp32Data[cat] = categorizedPhrases[cat];
        }
      });
      
      // Generate Arduino header if requested
      const headerContent = options.exportHeader ? generateArduinoHeader(esp32Data) : '';
      
      return { jsonData: esp32Data, headerContent };
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Download export files based on options
   */
  const downloadExport = (data: ExportResult, options: ExportOptions) => {
    try {
      // Download files based on options
      if (options.exportJson) {
        const jsonBlob = new Blob(
          [JSON.stringify(data.jsonData, null, 2)], 
          { type: 'application/json' }
        );
        saveAs(jsonBlob, 'phrases_esp32.json');
      }
      
      if (options.exportHeader) {
        const headerBlob = new Blob(
          [data.headerContent], 
          { type: 'text/plain' }
        );
        saveAs(headerBlob, 'phrases.h');
      }
      
      return true;
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Failed to download files');
      return false;
    }
  };

  /**
   * Generate Arduino header file
   */
  const generateArduinoHeader = (data: Record<string, any[]>): string => {
    let headerContent = `// Auto-generated phrases header file
#ifndef PHRASES_H
#define PHRASES_H

#include <Arduino.h>

struct Phrase {
  const char* text;
  const char* hint;
  uint8_t difficulty;
};
`;
    Object.keys(data).forEach(category => {
      const categoryVar = category.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const phrases = data[category];
      headerContent += `// ${category} phrases
constexpr Phrase ${categoryVar}_phrases[] PROGMEM = {
`;
      phrases.forEach(phrase => {
        const text = phrase.t || phrase.text;
        const hint = phrase.h || phrase.hint || '';
        const difficulty = phrase.d || phrase.difficulty || 1;
        headerContent += `  {"${escapeString(text)}", "${escapeString(hint)}", ${difficulty}},
`;
      });
      headerContent += `};

constexpr size_t ${categoryVar}_count = ${phrases.length};

`;
    });
    headerContent += `// Category index
struct PhraseCategory {
  const char* name;
  const Phrase* phrases;
  size_t count;
};

constexpr PhraseCategory phrase_categories[] PROGMEM = {
`;
    Object.keys(data).forEach(category => {
      const categoryVar = category.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      headerContent += `  {"${escapeString(category)}", ${categoryVar}_phrases, ${categoryVar}_count},
`;
    });
    headerContent += `};

constexpr size_t category_count = ${Object.keys(data).length};

#endif // PHRASES_H
`;
    return headerContent;
  };

  /**
   * Escape strings for C++ code
   */
  const escapeString = (str: string): string => {
    if (!str) return "";
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  };

  return {
    exportPhrases,
    downloadExport,
    isExporting,
    error,
    setError
  };
};