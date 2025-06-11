import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
// TODO: Convert to Supabase - MongoDB models not available
// import dbConnect from '@/lib/mongodb';
// import WasteSubmission from '@/models/WasteSubmission';
// import Trader from '@/models/Trader';
// import { TraderAssignmentService } from '@/services/traderAssignment';

export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    // TODO: Implement with Supabase
    // await dbConnect();

    // Temporary mock data for deployment
    const mockSubmission = {
      id: params.submissionId,
      status: 'assigned',
      userLocation: [40.7128, -74.0060], // NYC coordinates
      traderLocation: [40.7589, -73.9851], // Times Square coordinates
      traderName: 'EcoCollector Pro',
      estimatedArrival: new Date(Date.now() + 30 * 60000).toLocaleTimeString()
    };

    return NextResponse.json({
      submission: mockSubmission
    });

    /*
    const submission = await WasteSubmission.findById(params.submissionId)
      .populate('assignedTrader');

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Calculate estimated arrival time based on distance
    const distance = TraderAssignmentService.calculateDistance(
      submission.location.coordinates,
      submission.assignedTrader.location.coordinates
    );

    // Assume average speed of 30 km/h
    const estimatedMinutes = Math.round((distance / 30) * 60);
    const estimatedArrival = new Date(Date.now() + estimatedMinutes * 60000)
      .toLocaleTimeString();

    return NextResponse.json({
      submission: {
        id: submission._id,
        status: submission.status,
        userLocation: submission.location.coordinates,
        traderLocation: submission.assignedTrader.location.coordinates,
        traderName: submission.assignedTrader.name,
        estimatedArrival
      }
    });
    */
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking data' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    // TODO: Implement with Supabase
    // await dbConnect();

    const body = await request.json();
    const { traderId, location } = body;

    // Temporary implementation for deployment
    console.log('Tracking update request:', { traderId, location, submissionId: params.submissionId });

    return NextResponse.json({
      success: true,
      message: 'Tracking update feature coming soon!'
    });

    /*
    // Update trader location
    await Trader.findByIdAndUpdate(traderId, {
      'location.coordinates': [location.lat, location.lng]
    });

    return NextResponse.json({ success: true });
    */
  } catch (error) {
    console.error('Error updating tracking data:', error);
    return NextResponse.json(
      { error: 'Failed to update tracking data' },
      { status: 500 }
    );
  }
}
