import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PickupService } from '@/services/pickupService';

const pickupService = new PickupService();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const pickup = await pickupService.createPickupRequest({
      user_id: session.user.id,
      ...data
    });

    return NextResponse.json({ success: true, pickup });
  } catch (error: any) {
    console.error('Pickup request failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create pickup request' },
      { status: 500 }
    );
  }
}
