import React, { useState, useRef } from 'react';
import { ChevronRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BulkImportFormProps, NewPhrase, ImportedPhrase } from '@/types/types';
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';

interface CategoryMap {
  [key: string]: number;
}

interface SubcategoryMap {
  [key: string]: number;
}

interface TagMap {
  [key: string]: number;
}

interface ParsedRow {
  phrase: string;
  category: string;
  difficulty: string;
  subcategory: string;
  tags: string;
  hint: string;
  part_of_speech: string;
}

const BulkImportForm: React.FC<BulkImportFormProps> = ({
  onSuccess,
  onError,
  categories = [],
  difficulties = [],
  partsOfSpeech = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processAndValidateCSV = (text: string): NewPhrase[] => {
    const result = Papa.parse<string[]>(text, {
      header: false,
      skipEmptyLines: true
    });

    if (result.errors.length > 0) {
      throw new Error(`CSV parsing error: ${result.errors[0].message}`);
    }

    return result.data.map((row: string[], index: number) => {
      if (row.length !== 7) {
        throw new Error(`Row ${index + 1}: Expected 7 fields but got ${row.length}`);
      }

      const [phrase, category, difficulty, subcategory, tags, hint, part_of_speech] = row;

      if (!phrase?.trim()) throw new Error(`Row ${index + 1}: Phrase is required`);
      if (!category?.trim()) throw new Error(`Row ${index + 1}: Category is required`);
      if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
        throw new Error(`Row ${index + 1}: Invalid difficulty value`);
      }

      return {
        phrase: phrase.trim(),
        category: category.trim(),
        difficulty: difficulty.trim(),
        subcategory: subcategory?.trim() || '',
        tags: tags?.trim() || '',
        hint: hint?.trim() || '',
        part_of_speech: part_of_speech?.trim() || ''
      };
    });
  };

  const handleBulkImport = async (text: string) => {
    if (!text?.trim()) return;
    setLoading(true);

    try {
      const phrases = processAndValidateCSV(text);
      
      // Step 1: Create/get categories and build mapping
      const categoryMap: CategoryMap = {};
      for (const phrase of phrases) {
        if (!categoryMap[phrase.category]) {
          const { data: existingCategory } = await supabase
            .from('categories')
            .select('id')
            .eq('name', phrase.category)
            .single();

          if (existingCategory) {
            categoryMap[phrase.category] = existingCategory.id;
          } else {
            const { data: newCategory } = await supabase
              .from('categories')
              .insert({ name: phrase.category })
              .select('id')
              .single();

            if (newCategory) categoryMap[phrase.category] = newCategory.id;
          }
        }
      }

      // Step 2: Create/get subcategories and build mapping
      const subcategoryMap: SubcategoryMap = {};
      for (const phrase of phrases) {
        if (phrase.subcategory && !subcategoryMap[phrase.subcategory]) {
          const categoryId = categoryMap[phrase.category];
          
          const { data: existingSubcategory } = await supabase
            .from('subcategories')
            .select('id')
            .eq('name', phrase.subcategory)
            .eq('category_id', categoryId)
            .single();

          if (existingSubcategory) {
            subcategoryMap[phrase.subcategory] = existingSubcategory.id;
          } else {
            const { data: newSubcategory } = await supabase
              .from('subcategories')
              .insert({
                name: phrase.subcategory,
                category_id: categoryId
              })
              .select('id')
              .single();

            if (newSubcategory) subcategoryMap[phrase.subcategory] = newSubcategory.id;
          }
        }
      }

      // Step 3: Create/get tags and build mapping
      const tagMap: TagMap = {};
      for (const phrase of phrases) {
        if (phrase.tags) {
          const tags = phrase.tags.split(',').map(t => t.trim());
          for (const tag of tags) {
            if (!tagMap[tag]) {
              const { data: existingTag } = await supabase
                .from('tags')
                .select('id')
                .eq('tag', tag)
                .single();

              if (existingTag) {
                tagMap[tag] = existingTag.id;
              } else {
                const { data: newTag } = await supabase
                  .from('tags')
                  .insert({ tag })
                  .select('id')
                  .single();

                if (newTag) tagMap[tag] = newTag.id;
              }
            }
          }
        }
      }

      // Step 4: Insert phrases
      const phrasesForInsert = phrases.map(phrase => ({
        phrase: phrase.phrase,
        category_id: categoryMap[phrase.category],
        subcategory_id: phrase.subcategory ? subcategoryMap[phrase.subcategory] : null,
        difficulty: phrase.difficulty,
        hint: phrase.hint || null,
        part_of_speech: phrase.part_of_speech
      }));

      const { data: insertedPhrases, error: phraseError } = await supabase
        .from('phrases')
        .insert(phrasesForInsert)
        .select('id');

      if (phraseError) throw phraseError;

      // Step 5: Create phrase-tag relationships
      if (insertedPhrases) {
        const phraseTagsToInsert = [];
        for (let i = 0; i < phrases.length; i++) {
          const phrase = phrases[i];
          const phraseId = insertedPhrases[i].id;
          
          if (phrase.tags) {
            const tags = phrase.tags.split(',').map(t => t.trim());
            for (const tag of tags) {
              phraseTagsToInsert.push({
                phrase_id: phraseId,
                tag_id: tagMap[tag]
              });
            }
          }
        }

        if (phraseTagsToInsert.length > 0) {
          await supabase
            .from('phrase_tags')
            .insert(phraseTagsToInsert);
        }
      }

      setBulkImportText('');
      onSuccess(insertedPhrases?.map(p => p.id));
    } catch (err) {
      console.error('Bulk import error:', err);
      onError(err instanceof Error ? err.message : 'Failed to import phrases');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      const text = await file.text();
      setBulkImportText(text);
    } catch (err) {
      console.error('File reading error:', err);
      onError('Failed to read file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow">
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronRight 
          className={`transform transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
        <h2 className="text-xl font-bold">Bulk Import</h2>
      </div>

      {isExpanded && (
        <div className="mt-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-6
              ${dragActive 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-600'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInput}
              accept=".csv"
              className="hidden"
            />
            
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-400">
                Drag and drop a CSV file, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-500 hover:text-blue-400"
                >
                  browse
                </button>
              </p>
            </div>
          </div>

          <textarea
            value={bulkImportText}
            onChange={(e) => setBulkImportText(e.target.value)}
            className="w-full h-32 p-2 mt-4 bg-gray-700 border border-gray-600 
                     rounded text-white focus:ring-2 focus:ring-blue-500"
            placeholder="phrase,category,difficulty,subcategory,tags,hint,part_of_speech"
          />

          <p className="text-sm text-gray-400 mt-2">
            Format: phrase,category,difficulty,subcategory,tags,hint,part_of_speech
          </p>

          <div className="flex justify-end gap-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBulkImportText('');
                setIsExpanded(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleBulkImport(bulkImportText)}
              disabled={loading || !bulkImportText.trim()}
            >
              {loading ? 'Importing...' : 'Import Phrases'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImportForm;