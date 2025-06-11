import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { blockchainRewards } from '@/services/blockchainRewards';
import { supabase } from '@/lib/supabase';

// GET - Fetch user's blockchain wallet info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's wallet information
    const walletInfo = await blockchainRewards.getUserWalletInfo(session.user.email);
    
    // Get user's current points from database
    const { data: userData, error } = await supabase
      .from('users')
      .select('points')
      .eq('email', session.user.email)
      .single();

    if (error) {
      console.error('Error fetching user points:', error);
    }

    return NextResponse.json({
      wallet: walletInfo,
      currentPoints: userData?.points || 0,
      rewardCatalog: blockchainRewards.getRewardsCatalog()
    });

  } catch (error) {
    console.error('Error fetching blockchain rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet information' },
      { status: 500 }
    );
  }
}

// POST - Claim a blockchain reward
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rewardType, specificType, pointsToSpend } = body;

    // Validate input
    if (!rewardType || !pointsToSpend) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if reward type is valid
    const validRewardTypes = ['crypto', 'nft', 'voucher'];
    if (!validRewardTypes.includes(rewardType)) {
      return NextResponse.json(
        { error: 'Invalid reward type' },
        { status: 400 }
      );
    }

    // Get user's current points
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('points')
      .eq('email', session.user.email)
      .single();

    if (fetchError) {
      console.error('Error fetching user data:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    const currentPoints = userData?.points || 0;

    // Check if user has enough points
    if (currentPoints < pointsToSpend) {
      return NextResponse.json(
        { error: `Insufficient points. You have ${currentPoints} but need ${pointsToSpend}` },
        { status: 400 }
      );
    }

    // Distribute the reward
    const transaction = await blockchainRewards.distributeReward(
      session.user.email,
      pointsToSpend,
      rewardType,
      specificType
    );

    // Deduct points from user's account
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        points: currentPoints - pointsToSpend 
      })
      .eq('email', session.user.email);

    if (updateError) {
      console.error('Error updating user points:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user points' },
        { status: 500 }
      );
    }

    // Log the transaction
    const { error: logError } = await supabase
      .from('reward_transactions')
      .insert({
        user_email: session.user.email,
        transaction_id: transaction.id,
        reward_type: rewardType,
        specific_type: specificType,
        points_spent: pointsToSpend,
        reward_data: transaction.reward,
        blockchain_tx_hash: transaction.blockchainTxHash,
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Error logging transaction:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      transaction,
      remainingPoints: currentPoints - pointsToSpend,
      message: `Successfully claimed ${rewardType} reward!`
    });

  } catch (error) {
    console.error('Error claiming blockchain reward:', error);
    return NextResponse.json(
      { error: 'Failed to claim reward' },
      { status: 500 }
    );
  }
}

// PUT - Update reward status (for redemption tracking)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transactionId, status, redemptionData } = body;

    // Validate input
    if (!transactionId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update transaction status
    const { error } = await supabase
      .from('reward_transactions')
      .update({ 
        status,
        redemption_data: redemptionData,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId)
      .eq('user_email', session.user.email);

    if (error) {
      console.error('Error updating transaction status:', error);
      return NextResponse.json(
        { error: 'Failed to update transaction status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction status updated successfully'
    });

  } catch (error) {
    console.error('Error updating reward status:', error);
    return NextResponse.json(
      { error: 'Failed to update reward status' },
      { status: 500 }
    );
  }
}
