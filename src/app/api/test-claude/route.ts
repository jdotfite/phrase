// src/app/api/test-claude/route.ts
import { NextResponse } from 'next/server';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// Add a GET method for easy testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Claude test endpoint',
    keyExists: !!CLAUDE_API_KEY,
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  if (!CLAUDE_API_KEY) {
    console.error('Claude API key is not configured');
    return NextResponse.json(
      { error: 'Claude API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    console.log('Received request for test-claude:', body);
    
    // Implement the actual Claude API call
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 150,
        messages: body.messages
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      return NextResponse.json(
        { error: `Claude API error: ${claudeResponse.statusText}`, details: errorText },
        { status: claudeResponse.status }
      );
    }

    const data = await claudeResponse.json();
    console.log('Successful response from Claude:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}