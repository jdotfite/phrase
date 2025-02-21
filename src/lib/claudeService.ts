'use client';

export interface GenerateTagsResponse {
  tags: string[];
  error?: string;
}

export interface GenerateHintResponse {
  hint: string;
  error?: string;
}

// Determine the API URL based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/claude';

const makeClaudeRequest = async (messages: Array<{ role: string; content: string }>) => {
  console.log('Making request to:', API_URL); // Debug log
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
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
      content: `Create a helpful hint for the catch phrase: "${phrase}".
                Rules for hints:
                1. Maximum 50 characters
                2. Don't reveal the exact answer
                3. Focus on context or category
                4. No direct synonyms
                5. Can be a clever riddle or wordplay
                6. Should help players think in right direction
                7. No explicit "This is..." or "Think about..." phrases
                
                Return only the hint text, nothing else.
                Example: For "BOOKWORM" -> "Library's favorite customer"`
    }]);

    const hint = data.content[0].text.trim();

    if (hint.length > 50) {
      throw new Error('Hint exceeds maximum length');
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