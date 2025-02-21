// src/app/api/claude/route.ts
import { NextResponse } from 'next/server';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Helper function to add CORS headers
function addCorsHeaders(response: NextResponse) {
  // Add required CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function POST(req: Request) {
  if (!CLAUDE_API_KEY) {
    console.error('Claude API key is not configured');
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Claude API key is not configured' },
        { status: 500 }
      )
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
      return addCorsHeaders(
        NextResponse.json(
          { error: `Claude API error: ${claudeResponse.statusText}` },
          { status: claudeResponse.status }
        )
      );
    }

    const data = await claudeResponse.json();
    console.log('Successful response from Claude:', data);
    return addCorsHeaders(NextResponse.json(data));

  } catch (error) {
    console.error('API route error:', error);
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      )
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: Request) {
  return addCorsHeaders(
    new NextResponse(null, {
      status: 200,
    })
  );
}