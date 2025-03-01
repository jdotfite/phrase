import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    api_key_exists: !!process.env.CLAUDE_API_KEY 
  });
}