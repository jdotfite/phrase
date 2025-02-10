import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PhraseMetadata {
  categories: string[];
  difficulties: string[];
  partsOfSpeech: string[];
  loading: boolean;
  error: string | null;
}

interface DatabaseRecord {
  category: string;
  difficulty: string;
  part_of_speech: string;
}

export const usePhraseMetadata = (): PhraseMetadata => {
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [partsOfSpeech, setPartsOfSpeech] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all unique metadata in one query
        const { data, error: fetchError } = await supabase
          .from('phrases')
          .select('category, difficulty, part_of_speech');

        if (fetchError) throw fetchError;
        if (!data) throw new Error('No data received');

        const records = data as DatabaseRecord[];

        // Process categories
        const uniqueCategories = Array.from(
          new Set(
            records
              .map(record => record.category)
              .filter(Boolean)
              .sort()
          )
        );

        // Process difficulties (assuming these are predefined)
        const uniqueDifficulties = ['Easy', 'Medium', 'Hard'];

        // Process parts of speech
        const uniquePartsOfSpeech = Array.from(
          new Set(
            records
              .map(record => record.part_of_speech)
              .filter(Boolean)
              .sort()
          )
        );

        setCategories(uniqueCategories);
        setDifficulties(uniqueDifficulties);
        setPartsOfSpeech(uniquePartsOfSpeech);
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch metadata');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  return {
    categories,
    difficulties,
    partsOfSpeech,
    loading,
    error
  };
};

export default usePhraseMetadata;