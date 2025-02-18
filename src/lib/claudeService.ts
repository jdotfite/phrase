// src/lib/claudeService.ts
'use client';

export interface GenerateTagsResponse {
  tags: string[];
  error?: string;
}

export interface GenerateHintResponse {
  hint: string;
  error?: string;
}

const makeClaudeRequest = async (messages: Array<{ role: string; content: string }>) => {
  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API request failed:', {
        status: response.status,
        error: errorData
      });
      throw new Error(`API request failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    if (!data?.content?.[0]?.text) {
      throw new Error('Invalid API response structure');
    }

    return data;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

export const generateTags = async (phrase: string, currentHint: string = ''): Promise<GenerateTagsResponse> => {
  try {
    const data = await makeClaudeRequest([{
      role: 'user',
      content: `Generate exactly 3 descriptive tags for this catch phrase: "${phrase}"
                Current hint (for reference): "${currentHint}"

                Strict Rules for Tag Generation:
                1. Generate EXACTLY 3 tags
                2. Each tag must be a SINGLE word (no spaces, hyphens, or special characters)
                3. Each tag must be 16 characters or less
                4. Each tag must start with a capital letter
                5. Tags must be DIRECTLY related to the meaning, theme, or context of the phrase
                6. Tags MUST NOT contain any words from the phrase or the hint
                7. Tags must be distinct in meaning (no synonyms between tags)
                8. Tags should be specific and meaningful (avoid generic terms)
                
                Return exactly 3 tags separated by commas, nothing else.
                Example format for "Laser Hair Removal": MedSpa,Aesthetics,Grooming`
    }]);

    const tagsString = data.content[0].text.trim();
    const tags = tagsString
      .split(',')
      .map((tag: string) => tag.trim())
      .filter(Boolean); // Remove empty strings

    // Validate number of tags
    if (tags.length !== 3) {
      throw new Error(`Expected 3 tags, got ${tags.length}`);
    }

    // Validate each tag
    tags.forEach((tag: string, index: number) => {
      if (tag.length > 16) {
        throw new Error(`Tag ${index + 1} exceeds 16 characters: ${tag}`);
      }
      if (!/^[A-Z][a-zA-Z]*$/.test(tag)) {
        throw new Error(`Tag ${index + 1} has invalid format: ${tag}`);
      }
      if (phrase.toLowerCase().includes(tag.toLowerCase())) {
        throw new Error(`Tag ${index + 1} contains words from phrase: ${tag}`);
      }
      if (currentHint && currentHint.toLowerCase().includes(tag.toLowerCase())) {
        throw new Error(`Tag ${index + 1} contains words from hint: ${tag}`);
      }
    });

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
      content: `Create a clever hint for the catch phrase: "${phrase}"

                Strict Rules for Hint Generation:
                1. CRITICAL: Total length INCLUDING SPACES must be 18 or fewer characters
                2. Must be EXACTLY 3 short words
                3. Each word MUST start with a capital letter
                4. MUST NOT contain any words from the phrase
                5. Must be clever and indirect (no obvious synonyms)
                6. Should guide players toward the concept
                7. Keep words very short to meet character limit
                8. Count spaces in the 18-character limit
                
                Return only the 3-word hint with proper capitalization, nothing else.
                Valid Examples (note character counts):
                - For "Laser Hair Removal": "Spa Fix Beauty" (12 chars)
                - For "Mountain Climbing": "Up High Peak" (11 chars)
                - For "Birthday Party": "Fun Cake Day" (11 chars)
                
                Remember: Total characters (with spaces) MUST be 18 or less!`
    }]);

    let hint = data.content[0].text.trim();

    // Remove any punctuation that might have been added
    hint = hint.replace(/[.,!?]$/, '').trim();

    // Validate hint format
    const words = hint.split(' ').filter(Boolean); // Remove empty strings

    // Detailed validation with specific error messages
    if (words.length !== 3) {
      throw new Error(`Expected 3 words, got ${words.length}: "${hint}"`);
    }

    if (hint.length > 18) {
      throw new Error(`Hint exceeds 18 characters: "${hint}" (${hint.length} chars)`);
    }

    const invalidWords = words.filter(word => !/^[A-Z][a-zA-Z]*$/.test(word));
    if (invalidWords.length > 0) {
      throw new Error(`Invalid word format: ${invalidWords.join(', ')}`);
    }

    const phraseWords = phrase.toLowerCase().split(' ');
    const conflictingWords = words.filter(word => 
      phraseWords.some(phraseWord => 
        phraseWord.toLowerCase() === word.toLowerCase()
      )
    );
    
    if (conflictingWords.length > 0) {
      throw new Error(`Hint contains words from phrase: ${conflictingWords.join(', ')}`);
    }

    return { hint };
  } catch (error) {
    console.error('Error generating hint:', error);
    return {
      hint: '',
      error: error instanceof Error ? 
        error.message : 
        'Failed to generate hint'
    };
  }
};