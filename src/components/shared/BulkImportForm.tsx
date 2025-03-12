import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BulkImportFormProps, NewPhrase } from '@/types/types';
import { supabase } from '@/lib/services/supabase';
import Papa from 'papaparse';

const BulkImportForm: React.FC<BulkImportFormProps> = ({
  onSuccess,
  onError
}) => {
  const [bulkImportText, setBulkImportText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Existing handleBulkImport code and other processing functions

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
    <Card>
      <CardHeader>
        <CardTitle>Bulk Import</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 mb-4
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
          className="w-full h-32 p-2 mb-4 border rounded bg-background focus:ring-2 focus:ring-blue-500"
          placeholder="phrase,category,difficulty,subcategory,tags,hint,part_of_speech"
        />

        <p className="text-sm text-muted-foreground mb-4">
          Format: phrase,category,difficulty,subcategory,tags,hint,part_of_speech
        </p>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setBulkImportText('')}
            disabled={loading || !bulkImportText.trim()}
          >
            Clear
          </Button>
          <Button
            onClick={() => handleBulkImport(bulkImportText)}
            disabled={loading || !bulkImportText.trim()}
            className="bg-white text-black hover:bg-gray-100"
          >
            {loading ? 'Importing...' : 'Import Phrases'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkImportForm;