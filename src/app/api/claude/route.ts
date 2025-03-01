import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Just echo back the request for testing
    return NextResponse.json({
      received: true,
      messageCount: body.messages?.length || 0,
      content: [{
        type: "text",
        text: "test,debug,fake"
      }]
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}