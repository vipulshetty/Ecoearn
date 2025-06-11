import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// TODO: Convert to Supabase - MongoDB models not available
// import dbConnect from '@/lib/mongodb';
// import Reward from '@/models/Reward';
// import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement with Supabase
    // await dbConnect();
    // const rewards = await Reward.find({ isActive: true });

    // Temporary mock data for deployment
    const rewards = [
      { id: 1, name: 'Eco-friendly Water Bottle', pointsCost: 100, isActive: true },
      { id: 2, name: 'Reusable Shopping Bag', pointsCost: 50, isActive: true },
      { id: 3, name: 'Plant a Tree Certificate', pointsCost: 200, isActive: true }
    ];

    return NextResponse.json(rewards);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement with Supabase
    // await dbConnect();
    const { userId, rewardId } = await request.json();

    // Temporary implementation - return success for deployment
    return NextResponse.json({
      success: true,
      message: 'Reward redemption feature coming soon!',
      remainingPoints: 100,
    });

    /*
    const user = await User.findById(userId);
    const reward = await Reward.findById(rewardId);

    if (!user || !reward) {
      return NextResponse.json(
        { error: 'User or reward not found' },
        { status: 404 }
      );
    }

    if (user.points < reward.pointsCost) {
      return NextResponse.json(
        { error: 'Insufficient points' },
        { status: 400 }
      );
    }

    // Update user points
    user.points -= reward.pointsCost;
    await user.save();

    // Update reward availability if needed
    if (reward.availability > 0) {
      reward.availability -= 1;
      if (reward.availability === 0) {
        reward.isActive = false;
      }
      await reward.save();
    }

    return NextResponse.json({
      success: true,
      remainingPoints: user.points,
    });
    */
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to redeem reward' },
      { status: 500 }
    );
  }
}
