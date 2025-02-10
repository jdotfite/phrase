import React, { useState, useRef } from 'react';
import { ChevronRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BulkImportFormProps, PhraseBase } from '@/types/types';
import { validateCSVFile, processCSVFile } from '@/utils/bulkImport';

const BulkImportForm: React.FC<BulkImportFormProps> = ({
  onSuccess,
  onError
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertToCSVString = (phrases: PhraseBase[]): string => {
    return phrases.map(phrase => {
      // No need to handle tags as array since it's already a string
      return [
        phrase.phrase,
        phrase.category,
        phrase.difficulty,
        phrase.subcategory || '',
        phrase.tags || '',
        phrase.hint || '',
        phrase.part_of_speech || ''
      ].join(',');
    }).join('\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkImportText?.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await fetch('/api/phrases/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phrases: bulkImportText }),
      }).then(res => res.json());

      if (error) throw new Error(error);

      setBulkImportText('');
      onSuccess(data?.newIds);
    } catch (err) {
      console.error('Bulk import error:', err);
      onError(err instanceof Error ? err.message : 'Failed to import phrases');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      // Validate file
      const validation = await validateCSVFile(file);
      if (!validation.isValid) {
        onError(validation.message);
        return;
      }

      // Process file
      const content = await processCSVFile(file);
      // Convert the processed array to CSV string format
      const csvString = convertToCSVString(content);
      setBulkImportText(csvString);
    } catch (err) {
      console.error('File processing error:', err);
      onError(err instanceof Error ? err.message : 'Failed to process file');
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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full h-32 p-2 bg-gray-700 border border-gray-600 
                       rounded text-white focus:ring-2 focus:ring-blue-500"
              placeholder="phrase,category,difficulty,subcategory,tags,hint,part_of_speech"
            />

            <p className="text-sm text-gray-400">
              Format: phrase,category,difficulty,subcategory,tags,hint,part_of_speech
            </p>

            <div className="flex justify-end gap-4">
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
                type="submit"
                disabled={loading || !bulkImportText.trim()}
              >
                {loading ? 'Importing...' : 'Import Phrases'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BulkImportForm;