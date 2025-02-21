// src/app/api/claude/route.ts
import { NextResponse } from 'next/server';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// CORS headers for your frontend domain
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://phrase-coral.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(req: Request) {
  // Add CORS headers to all responses
  if (!CLAUDE_API_KEY) {
    return NextResponse.json(
      { error: 'Claude API key is not configured' },
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const body = await req.json();
    
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
        { error: `Claude API error: ${claudeResponse.statusText}` },
        { status: claudeResponse.status, headers: corsHeaders }
      );
    }

    const data = await claudeResponse.json();
    return NextResponse.json(data, { headers: corsHeaders });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle OPTIONS preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}