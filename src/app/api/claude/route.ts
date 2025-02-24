// src/app/api/claude/route.ts
import { NextResponse } from 'next/server';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'Accept': 'application/json'
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
      return new NextResponse(
        JSON.stringify({ error: `Claude API error: ${claudeResponse.statusText}` }),
        {
          status: claudeResponse.status,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const data = await claudeResponse.json();
    return new NextResponse(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('API route error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to process request' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}