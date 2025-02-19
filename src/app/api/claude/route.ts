// src/app/api/claude/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';  // Add this
export const dynamic = 'force-dynamic';  // Add this

export async function POST(request: Request) {
  try {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
        'anthropic-beta': 'messages-2023-12-15'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 150,
        messages: body.messages
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}