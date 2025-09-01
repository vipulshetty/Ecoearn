import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET user points
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('points, email, name')
      .eq('email', userEmail)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch user points:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    if (!user) {
      // User doesn't exist, return 0 points
      return NextResponse.json({
        points: 0,
        email: userEmail,
        name: userEmail.split('@')[0]
      });
    }

    return NextResponse.json({
      points: user.points || 0,
      email: user.email,
      name: user.name
    });

  } catch (error) {
    console.error('Error in GET /api/users/points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST to update user points (add or subtract)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, pointsChange, operation = 'add', reason } = body;

    if (!userEmail || typeof pointsChange !== 'number') {
      return NextResponse.json(
        { error: 'User email and pointsChange are required' },
        { status: 400 }
      );
    }

    // Get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('points')
      .eq('email', userEmail)
      .single();

    let newPoints = 0;
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist, create them
      newPoints = operation === 'add' ? pointsChange : 0;
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: userEmail,
          name: userEmail.split('@')[0],
          points: newPoints
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        points: newPoints,
        previousPoints: 0,
        change: pointsChange,
        operation,
        reason
      });

    } else if (fetchError) {
      console.error('Failed to fetch user:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // Calculate new points
    const currentPoints = currentUser.points || 0;
    if (operation === 'add') {
      newPoints = currentPoints + pointsChange;
    } else if (operation === 'subtract') {
      newPoints = Math.max(0, currentPoints - pointsChange); // Don't allow negative points
    }

    // Update user points
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        points: newPoints,
        updated_at: new Date().toISOString()
      })
      .eq('email', userEmail);

    if (updateError) {
      console.error('Failed to update user points:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user points' },
        { status: 500 }
      );
    }

    console.log(`✅ ${operation === 'add' ? 'Added' : 'Subtracted'} ${pointsChange} points ${operation === 'add' ? 'to' : 'from'} ${userEmail}. New total: ${newPoints}`);

    return NextResponse.json({
      success: true,
      points: newPoints,
      previousPoints: currentPoints,
      change: pointsChange,
      operation,
      reason
    });

  } catch (error) {
    console.error('Error in POST /api/users/points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}