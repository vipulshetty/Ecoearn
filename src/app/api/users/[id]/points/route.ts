import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
// TODO: Convert to Supabase - MongoDB models not available
// import dbConnect from '@/lib/mongodb';
// import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement with Supabase
    // await dbConnect();

    // Temporary implementation - calculate points from waste submissions
    const { data: submissions, error } = await supabase
      .from('waste_submissions')
      .select('points')
      .eq('user_id', params.id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user points' },
        { status: 500 }
      );
    }

    // Calculate total points from submissions
    const totalPoints = submissions?.reduce((sum, submission) => sum + (submission.points || 0), 0) || 0;

    return NextResponse.json({ points: totalPoints });
  } catch (error) {
    console.error('Error fetching user points:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user points' },
      { status: 500 }
    );
  }
}
