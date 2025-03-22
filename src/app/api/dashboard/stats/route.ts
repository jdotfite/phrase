// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DashboardDataService } from '@/services/dashboard-data-service';

export async function POST(request: NextRequest) {
  try {
    const { dateRange = 30 } = await request.json();
    
    const stats = await DashboardDataService.fetchDashboardStats(dateRange);
    
    if (!stats) {
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in stats API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}