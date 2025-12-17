import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Demo fallback store (used when Supabase is unreachable)
const demoPointsStore = new Map<string, number>();

function isFetchFailedError(err: unknown): boolean {
  const msg = typeof (err as any)?.message === 'string' ? (err as any).message : '';
  return msg.includes('fetch failed');
}

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

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('points, email, name')
        .eq('email', userEmail)
        .single();

      if (error && error.code !== 'PGRST116') {
        // If Supabase is unreachable, fall back to demo store
        if ((error as any)?.message?.includes?.('fetch failed')) {
          const points = demoPointsStore.get(userEmail) ?? 0;
          return NextResponse.json({
            points,
            email: userEmail,
            name: userEmail.split('@')[0],
            source: 'demo',
          });
        }

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
    } catch (supabaseError) {
      if (isFetchFailedError(supabaseError)) {
        const points = demoPointsStore.get(userEmail) ?? 0;
        return NextResponse.json({
          points,
          email: userEmail,
          name: userEmail.split('@')[0],
          source: 'demo',
        });
      }
      throw supabaseError;
    }

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
    if (operation !== 'add' && operation !== 'subtract') {
      return NextResponse.json(
        { error: 'Invalid operation. Must be "add" or "subtract"' },
        { status: 400 }
      );
    }

    // Default to demo store; try Supabase when available.
    let currentPoints = demoPointsStore.get(userEmail) ?? 0;
    let usedDemo = true;

    try {
      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('points')
        .eq('email', userEmail)
        .single();

      if (!fetchError && currentUser) {
        currentPoints = currentUser.points || 0;
        usedDemo = false;
      }
    } catch (supabaseError) {
      if (!isFetchFailedError(supabaseError)) {
        throw supabaseError;
      }
    }

    const newPoints = operation === 'add'
      ? currentPoints + pointsChange
      : Math.max(0, currentPoints - pointsChange);

    // Always persist to demo store so the UI works without a DB.
    demoPointsStore.set(userEmail, newPoints);

    // Best-effort persist to Supabase; ignore unreachable errors.
    try {
      const { error: upsertError } = await supabase
        .from('users')
        .upsert(
          {
            email: userEmail,
            name: userEmail.split('@')[0],
            points: newPoints,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );

      if (upsertError) {
        // If Supabase is unreachable, don't fail the demo.
        if ((upsertError as any)?.message?.includes?.('fetch failed')) {
          usedDemo = true;
        } else {
          console.error('Failed to persist user points to Supabase:', upsertError);
        }
      } else {
        usedDemo = false;
      }
    } catch (supabaseError) {
      if (!isFetchFailedError(supabaseError)) {
        throw supabaseError;
      }
      usedDemo = true;
    }

    return NextResponse.json({
      success: true,
      points: newPoints,
      previousPoints: currentPoints,
      change: pointsChange,
      operation,
      reason,
      source: usedDemo ? 'demo' : 'supabase',
    });
  } catch (error) {
    console.error('Error in POST /api/users/points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}