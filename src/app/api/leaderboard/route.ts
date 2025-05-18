import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Dummy data for development
const dummyUsers = [
  {
    id: '1',
    name: 'Eco Warrior',
    image: '/default-avatar.png',
    totalPoints: 1250,
    wasteCount: 25,
  },
  {
    id: '2',
    name: 'Green Champion',
    image: '/default-avatar.png',
    totalPoints: 980,
    wasteCount: 20,
  },
  {
    id: '3',
    name: 'Earth Guardian',
    image: '/default-avatar.png',
    totalPoints: 850,
    wasteCount: 17,
  },
  {
    id: '4',
    name: 'Recycling Hero',
    image: '/default-avatar.png',
    totalPoints: 720,
    wasteCount: 15,
  },
  {
    id: '5',
    name: 'Nature Protector',
    image: '/default-avatar.png',
    totalPoints: 650,
    wasteCount: 13,
  },
  {
    id: '6',
    name: 'Eco Explorer',
    image: '/default-avatar.png',
    totalPoints: 520,
    wasteCount: 11,
  },
  {
    id: '7',
    name: 'Planet Saver',
    image: '/default-avatar.png',
    totalPoints: 480,
    wasteCount: 10,
  },
  {
    id: '8',
    name: 'Waste Warrior',
    image: '/default-avatar.png',
    totalPoints: 420,
    wasteCount: 9,
  },
  {
    id: '9',
    name: 'Green Innovator',
    image: '/default-avatar.png',
    totalPoints: 380,
    wasteCount: 8,
  },
  {
    id: '10',
    name: 'Eco Pioneer',
    image: '/default-avatar.png',
    totalPoints: 350,
    wasteCount: 7,
  },
];

export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add current user to the leaderboard
    const currentUserEntry = {
      id: session.user.id,
      name: session.user.name || 'You',
      image: session.user.image || '/default-avatar.png',
      totalPoints: 600, // Random position in middle of leaderboard
      wasteCount: 12,
    };

    // Insert current user into dummy data
    const allUsers = [...dummyUsers];
    allUsers.splice(5, 0, currentUserEntry); // Insert current user at position 6

    // Sort by points (in case current user position changes order)
    const leaderboard = allUsers.sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json(leaderboard);
  } catch (error: any) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}
