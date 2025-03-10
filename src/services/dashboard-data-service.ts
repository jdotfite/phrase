// src/services/dashboard-data-service.ts
import { supabase } from '@/lib/services/supabase';

export const DashboardDataService = {
  // Fetch phrase timestamps
  fetchPhrasesOverTime: async () => {
    try {
      // Use the created_at column from the phrases table
      const { data, error } = await supabase
        .from('phrases')
        .select('created_at')
        .order('created_at');

      if (error) {
        console.error('Error fetching phrase timestamps:', error);
        return { data: null, error };
      }

      if (data && data.length > 0) {
        return { data, error: null };
      } else {
        return { data: null, error: new Error('No data found') };
      }
    } catch (err) {
      console.error('Error fetching phrase timestamps:', err);
      return { data: null, error: err };
    }
  },

  // Process timestamp data into monthly buckets
  processTimestampData: (data) => {
    const monthCounts = {};

    data.forEach((item) => {
      if (!item.created_at) return;

      const date = new Date(item.created_at);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;

      if (!monthCounts[key]) {
        monthCounts[key] = { month, year, count: 0, fullDate: date };
      }
      monthCounts[key].count++;
    });

    // Convert to array, sort by date, and take the most recent 6 months
    return Object.values(monthCounts)
      .sort((a, b) => a.fullDate - b.fullDate)
      .map((item) => ({
        month: item.month,
        year: item.year,
        phrases: item.count,
      }))
      .slice(-6);
  },

  // Generate error state data when no data is available
  getErrorStateData: () => {
    // Return a special data format that indicates an error condition
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => ({
      month,
      year: new Date().getFullYear(),
      phrases: null // Use null to indicate missing/error data
    }));
  },

  // Generate monthly activity data
  generateMonthlyActivityData: () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      name: month,
      reviews: Math.floor(Math.random() * 100) + 50,
      additions: Math.floor(Math.random() * 40) + 10,
      edits: Math.floor(Math.random() * 30) + 5,
    }));
  },

  // Generate category distribution data
  generateCategoryData: (categories) => {
    if (categories && categories.length > 0) {
      return [
        { name: 'Animals & Plants', value: 30 },
        { name: 'Art & Design', value: 22 },
        { name: 'Education & Learning', value: 13 },
        { name: 'Celebrations & Traditions', value: 16 },
        { name: 'Business & Careers', value: 19 },
      ];
    }
    
    return [
      { name: 'Animals & Plants', value: 30 },
      { name: 'Art & Design', value: 22 },
      { name: 'Education & Learning', value: 13 },
      { name: 'Celebrations & Traditions', value: 16 },
      { name: 'Business & Careers', value: 19 },
    ];
  },

  // Export data
  handleExport: async (options) => {
    try {
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

      const { data: phraseTags, error: tagsError } = await supabase
        .from('phrase_tags')
        .select(`
          phrase_id,
          tags:tag_id(tag)
        `);

      if (tagsError) throw tagsError;

      const tagsByPhraseId = {};
      phraseTags.forEach((item) => {
        if (!tagsByPhraseId[item.phrase_id]) {
          tagsByPhraseId[item.phrase_id] = [];
        }
        tagsByPhraseId[item.phrase_id].push(item.tags.tag);
      });

      const categorizedPhrases = {};
      phrases.forEach((phrase) => {
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

      const esp32Data = {};
      Object.keys(categorizedPhrases).forEach((cat) => {
        if (options.optimizeForESP32) {
          // Optimized format for ESP32
          esp32Data[cat] = categorizedPhrases[cat].map(p => ({
            t: p.text,                    // text (shortened property name)
            h: p.hint || '',              // hint (shortened property name)
            d: p.difficulty || 1          // difficulty (shortened property name)
          }));
        } else {
          // Full format
          esp32Data[cat] = categorizedPhrases[cat];
        }
      });

      const headerContent = options.exportHeader ? DashboardDataService.generateArduinoHeader(esp32Data) : '';

      return {
        jsonData: esp32Data,
        headerContent,
      };
    } catch (error) {
      console.error('Export error:', error);
      return null;
    }
  },

  // Generate Arduino header file
  generateArduinoHeader: (data) => {
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

    Object.keys(data).forEach((category) => {
      const categoryVar = category.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const phrases = data[category];

      headerContent += `// ${category} phrases\n`;
      headerContent += `constexpr Phrase ${categoryVar}_phrases[] PROGMEM = {\n`;

      phrases.forEach((phrase) => {
        const text = phrase.t || phrase.text;
        const hint = phrase.h || phrase.hint || '';
        const difficulty = phrase.d || phrase.difficulty || 1;

        headerContent += `  {"${DashboardDataService.escapeString(text)}", "${DashboardDataService.escapeString(hint)}", ${difficulty}},\n`;
      });

      headerContent += `};\n\n`;
      headerContent += `constexpr size_t ${categoryVar}_count = ${phrases.length};\n\n`;
    });

    headerContent += `// Category index\n`;
    headerContent += `struct PhraseCategory {\n`;
    headerContent += `  const char* name;\n`;
    headerContent += `  const Phrase* phrases;\n`;
    headerContent += `  size_t count;\n`;
    headerContent += `};\n\n`;

    headerContent += `constexpr PhraseCategory phrase_categories[] PROGMEM = {\n`;
    Object.keys(data).forEach((category) => {
      const categoryVar = category.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      headerContent += `  {"${DashboardDataService.escapeString(category)}", ${categoryVar}_phrases, ${categoryVar}_count},\n`;
    });
    headerContent += `};\n\n`;

    headerContent += `constexpr size_t category_count = ${Object.keys(data).length};\n\n`;
    headerContent += `#endif // PHRASES_H\n`;

    return headerContent;
  },

  // Helper function to escape strings for C++ code
  escapeString: (str) => {
    if (!str) return "";
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
  }
};