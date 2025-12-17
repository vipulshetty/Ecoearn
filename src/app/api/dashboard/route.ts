import { NextResponse } from 'next/server';
// Auth removed for DevOps demo
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Return demo dashboard data (auth removed for DevOps showcase)
    const pointsHistory = [
      { date: new Date(Date.now() - 6 * 86400000).toLocaleDateString(), points: 10 },
      { date: new Date(Date.now() - 5 * 86400000).toLocaleDateString(), points: 15 },
      { date: new Date(Date.now() - 4 * 86400000).toLocaleDateString(), points: 12 },
      { date: new Date(Date.now() - 3 * 86400000).toLocaleDateString(), points: 20 },
      { date: new Date(Date.now() - 2 * 86400000).toLocaleDateString(), points: 18 },
      { date: new Date(Date.now() - 1 * 86400000).toLocaleDateString(), points: 25 },
      { date: new Date().toLocaleDateString(), points: 22 },
    ];

    return NextResponse.json({
      totalPoints: 122,
      totalSubmissions: 15,
      wasteByType: {
        plastic: 5,
        paper: 4,
        glass: 3,
        metal: 1,
        organic: 2,
        electronic: 0,
        other: 0
      },
      recentSubmissions: [
        { id: '1', type: 'plastic', weight: 2.5, points: 25, created_at: new Date().toISOString() },
        { id: '2', type: 'paper', weight: 1.8, points: 18, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', type: 'glass', weight: 3.2, points: 32, created_at: new Date(Date.now() - 172800000).toISOString() },
      ],
      pointsHistory
    });
  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
