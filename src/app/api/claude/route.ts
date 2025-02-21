// src/app/api/claude/route.ts
import { NextRequest, NextResponse } from 'next/server';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Replace with your specific domain in production
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(req: NextRequest) {
  // Add CORS headers to the response
  if (!CLAUDE_API_KEY) {
    console.error('Claude API key is not configured');
    return NextResponse.json(
      { error: 'Claude API key is missing' },
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const body = await req.json();
    console.log('Received request for Claude API:', body);

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
    console.log('Successful response from Claude:', data);
    return NextResponse.json(data, { headers: corsHeaders });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}