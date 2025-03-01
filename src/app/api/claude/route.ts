import { NextResponse } from 'next/server';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(req: Request) {
  console.log('Claude API route called with method:', req.method);
  
  if (!CLAUDE_API_KEY) {
    console.error('Claude API key is not configured');
    return NextResponse.json(
      { error: 'Claude API key is not configured' },
      { status: 500 }
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
        'anthropic-version': '2023-06-01' // Consider updating to '2023-12-01'
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
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}