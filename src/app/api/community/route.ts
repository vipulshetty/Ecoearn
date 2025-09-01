import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET community leaderboard and stats
export async function GET(request: NextRequest) {
  try {
    // Get top users by points
    const { data: topUsers, error: usersError } = await supabase
      .from('users')
      .select('name, points, email')
      .order('points', { ascending: false })
      .limit(10);

    if (usersError) {
      console.error('Failed to fetch top users:', usersError);
    }

    // Get total community stats
    const { data: totalUsers, error: countError } = await supabase
      .from('users')
      .select('id')
      .gte('points', 1);

    const { data: totalDetections, error: detectionsError } = await supabase
      .from('ai_detections')
      .select('id');

    const { data: totalPoints, error: pointsError } = await supabase
      .from('users')
      .select('points');

    const communityStats = {
      totalUsers: totalUsers?.length || 0,
      totalDetections: totalDetections?.length || 0,
      totalPointsAwarded: totalPoints?.reduce((sum, user) => sum + (user.points || 0), 0) || 0,
      satisfactionRate: 95 // Mock data
    };

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from('ai_detections')
      .select('user_email, waste_type, points_earned, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (activityError) {
      console.error('Failed to fetch recent activity:', activityError);
    }

    return NextResponse.json({
      success: true,
      leaderboard: topUsers?.map((user, index) => ({
        rank: index + 1,
        name: user.name || user.email.split('@')[0],
        points: user.points || 0,
        email: user.email
      })) || [],
      stats: communityStats,
      recentActivity: recentActivity || []
    });

  } catch (error) {
    console.error('Error in GET /api/community:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}