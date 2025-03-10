import { NextResponse } from 'next/server';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(req: Request) {
  if (!CLAUDE_API_KEY) {
    console.error('Claude API key is not configured');
    return NextResponse.json(
      { error: 'Claude API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const { phrase, categories } = await req.json();
    
    if (!phrase || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const messages = [
      {
        role: 'user',
        content: `Choose the most appropriate category for this word or phrase: "${phrase}"
                  
                  Available categories:
                  ${categories.map((cat: string) => `- ${cat}`).join('\n')}
                  
                  Rules:
                  1. Choose exactly ONE category from the list provided
                  2. Consider the meaning, theme, and subject matter
                  3. For ambiguous terms, choose the most likely category
                  4. DO NOT suggest new categories or modify existing ones
                  
                  Return ONLY the exact category name, nothing else.
                  Example: "Sports & Fitness"`
      }
    ];

    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 50,
        messages: messages
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      return NextResponse.json(
        { error: `Claude API error: ${claudeResponse.statusText}` },
        { status: claudeResponse.status }
      );
    }

    const data = await claudeResponse.json();
    const suggestedCategory = data.content[0].text.trim();
    
    // Verify the category is in our list
    if (!categories.includes(suggestedCategory)) {
      console.error(`Claude suggested an invalid category: "${suggestedCategory}"`);
      return NextResponse.json(
        { error: 'Invalid category suggestion' },
        { status: 500 }
      );
    }

    return NextResponse.json({ category: suggestedCategory });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}