import { useState, useEffect } from 'react';
import { supabase } from '@/lib/services/supabase';

interface PhraseMetadata {
  categories: string[];
  difficulties: string[];
  partsOfSpeech: string[];
  loading: boolean;
  error: string | null;
}

interface CategoryRecord {
  name: string;
}

interface PartOfSpeechRecord {
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
        // Fetch categories
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('name')
          .order('name');

        if (categoryError) throw categoryError;

        // Fetch parts of speech from phrases
        const { data: posData, error: posError } = await supabase
          .from('phrases')
          .select('part_of_speech')
          .not('part_of_speech', 'is', null);

        if (posError) throw posError;

        // Process categories
        const uniqueCategories = Array.from(
          new Set((categoryData as CategoryRecord[]).map(record => record.name))
        );

        // Process parts of speech
        const uniquePartsOfSpeech = Array.from(
          new Set((posData as PartOfSpeechRecord[])
            .map(record => record.part_of_speech)
            .filter(Boolean))
        ).sort();

        // Set predefined difficulties
        const difficultyLevels = ['Easy', 'Medium', 'Hard'];

        setCategories(uniqueCategories);
        setDifficulties(difficultyLevels);
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
