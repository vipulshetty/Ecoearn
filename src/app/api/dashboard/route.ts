import { NextResponse } from 'next/server';
// Auth removed for DevOps demo
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent submissions
    const { data: recentSubmissions, error: submissionsError } = await supabase
      .from('waste_submissions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(6);

    if (submissionsError) {
      throw new Error('Failed to fetch recent submissions');
    }

    // Get total points
    const { data: pointsData, error: pointsError } = await supabase
      .from('waste_submissions')
      .select('points')
      .eq('user_id', session.user.id);

    if (pointsError) {
      throw new Error('Failed to fetch total points');
    }

    const totalPoints = pointsData.reduce((sum, submission) => sum + submission.points, 0);

    // Get waste distribution
    const { data: wasteData, error: wasteError } = await supabase
      .from('waste_submissions')
      .select('type')
      .eq('user_id', session.user.id);

    if (wasteError) {
      throw new Error('Failed to fetch waste distribution');
    }

    const wasteByType: Record<string, number> = {};
    wasteData.forEach(submission => {
      wasteByType[submission.type] = (wasteByType[submission.type] || 0) + 1;
    });

    // Get points history (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: historyData, error: historyError } = await supabase
      .from('waste_submissions')
      .select('points, created_at')
      .eq('user_id', session.user.id)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (historyError) {
      throw new Error('Failed to fetch points history');
    }

    // Group points by date
    const pointsHistory = historyData.reduce((acc: any[], submission) => {
      const date = new Date(submission.created_at).toLocaleDateString();
      const existingEntry = acc.find(entry => entry.date === date);
      
      if (existingEntry) {
        existingEntry.points += submission.points;
      } else {
        acc.push({ date, points: submission.points });
      }
      
      return acc;
    }, []);

    return NextResponse.json({
      totalPoints,
      totalSubmissions: wasteData.length,
      wasteByType,
      recentSubmissions,
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
