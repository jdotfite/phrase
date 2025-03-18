'use client';

export interface GenerateTagsResponse {
  tags: string[];
  error?: string;
}

export interface GenerateHintResponse {
  hint: string;
  error?: string;
}

export interface GeneratePhrasesResponse {
  phrases: string[];
  error?: string;
}

export interface SuggestCategoryResponse {
  category: string;
  error?: string;
}

const makeClaudeRequest = async (messages: Array<{ role: string; content: string }>) => {
  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error response:', errorText);
    throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
  }

  return await response.json();
};

export const generateTags = async (phrase: string): Promise<GenerateTagsResponse> => {
  try {
    const data = await makeClaudeRequest([{
      role: 'user',
      content: `Generate exactly 3 descriptive tags for this catch phrase: "${phrase}".
                Rules for tags:
                1. Must be single words, no spaces or hyphens
                2. All lowercase
                3. Maximum 15 characters per tag
                4. No special characters or numbers
                5. No generic words like "fun" or "game"
                6. Focus on theme, subject matter, or skill required
                7. Avoid duplicate meaning tags
                
                Return only the 3 tags separated by commas, nothing else.
                Example format: strategy,teamwork,creativity`
    }]);

    const tags = data.content[0].text
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => 
        tag.length <= 15 && 
        /^[a-z]+$/.test(tag) &&
        !['fun', 'game', 'play'].includes(tag)
      );

    if (tags.length !== 3) {
      throw new Error('Invalid tag generation result');
    }

    return { tags };
  } catch (error) {
    console.error('Error generating tags:', error);
    return {
      tags: [],
      error: error instanceof Error ? error.message : 'Failed to generate tags'
    };
  }
};

export const generateHint = async (phrase: string): Promise<GenerateHintResponse> => {
  try {
    const data = await makeClaudeRequest([{
      role: 'user',
      content: `Create a VERY SHORT helpful hint for the catch phrase: "${phrase}".
                Rules for hints:
                1. MUST BE 20 CHARACTERS OR LESS - THIS IS CRITICAL
                2. Don't reveal the exact answer
                3. Focus on context or category
                4. No direct synonyms
                5. Can be a clever riddle or wordplay
                6. Should help players think in right direction
                7. No explicit "This is..." or "Think about..." phrases
                
                Return only the hint text, nothing else.
                Example: For "BOOKWORM" -> "Reads a lot"`
    }]);

    const hint = data.content[0].text.trim();

    if (hint.length > 20) {
      // Truncate if still over limit, keeping it to 20 characters
      return { hint: hint.substring(0, 20) };
    }

    return { hint };
  } catch (error) {
    console.error('Error generating hint:', error);
    return {
      hint: '',
      error: error instanceof Error ? error.message : 'Failed to generate hint'
    };
  }
};

export const generatePhrases = async (inspiration: string, count: number = 5): Promise<GeneratePhrasesResponse> => {
  try {
    const data = await makeClaudeRequest([{
      role: 'user',
      content: `Generate ${count} unique and interesting catch phrases or words based on this inspiration: "${inspiration}".
                Rules for generated words/phrases:
                1. Mix of single words and short phrases (2-3 words)
                2. Suitable for a word game
                3. Each entry should be distinct and creative
                4. No extremely obscure terms
                5. Family-friendly content only
                6. No proper nouns unless very well known
                7. Varying difficulty levels
                
                Return only the list of words/phrases separated by commas, nothing else.
                Example format: Slumber party, Déjà vu, Photograph, Brain teaser, Pumpkin spice`
    }]);

    const phrases = data.content[0].text
      .split(',')
      .map((phrase: string) => phrase.trim())
      .filter((phrase: string) => phrase.length > 0);

    if (phrases.length === 0) {
      throw new Error('No phrases were generated');
    }

    return { phrases };
  } catch (error) {
    console.error('Error generating phrases:', error);
    return {
      phrases: [],
      error: error instanceof Error ? error.message : 'Failed to generate phrases'
    };
  }
};

export const suggestCategory = async (phrase: string, categories: string[]): Promise<SuggestCategoryResponse> => {
  try {
    const response = await fetch('/api/claude/suggest-category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phrase,
        categories
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return { category: data.category };
  } catch (error) {
    console.error('Error suggesting category:', error);
    return {
      category: '',
      error: error instanceof Error ? error.message : 'Failed to suggest category'
    };
  }
};