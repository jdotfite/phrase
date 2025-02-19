// app/api/claude/route.ts
import { NextResponse } from 'next/server';

import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const apiKey = process.env.CLAUDE_API_KEY;
  
  if (!apiKey) {
    console.error('Missing CLAUDE_API_KEY in environment');
    return NextResponse.json(
      { error: 'API configuration error' },
      { status: 500 }
    );
  }
  try {
    const body = await req.json();
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
        'anthropic-beta': 'messages-2023-12-15'  // Add this line
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 150,
        messages: body.messages
      })
    });


    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return NextResponse.json(
        { error: `API error: ${response.status} - ${errorData}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Route handler error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}