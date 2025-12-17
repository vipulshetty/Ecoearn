import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TraderAssignmentService } from '@/services/traderAssignment';
import { routeOptimization } from '@/services/routeOptimization';

interface AssignmentRequest {
  submissionIds: string[];
  locations: Array<{
    lat: number;
    lng: number;
    address?: string;
    wasteType?: string;
  }>;
  vehicleType?: 'truck' | 'van' | 'bike';
  optimizeRoute?: boolean;
}

// POST - Assign collector with optional route optimization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AssignmentRequest;
    const { 
      submissionIds, 
      locations, 
      vehicleType = 'truck', 
      optimizeRoute = true 
    } = body;

    // Validate input
    if (!submissionIds || !Array.isArray(submissionIds) || submissionIds.length === 0) {
      return NextResponse.json(
        { error: 'submissionIds array is required' },
        { status: 400 }
      );
    }

    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return NextResponse.json(
        { error: 'locations array is required' },
        { status: 400 }
      );
    }

    if (submissionIds.length !== locations.length) {
      return NextResponse.json(
        { error: 'submissionIds and locations arrays must have the same length' },
        { status: 400 }
      );
    }

    console.log(`🚛 Assigning collector for ${submissionIds.length} submissions`);

    if (optimizeRoute && submissionIds.length > 1) {
      // Use enhanced assignment with route optimization
      try {
        // Convert locations to the format expected by TraderAssignmentService
        const traderLocations = locations.map(loc => ({
          type: 'Point',
          coordinates: [loc.lng, loc.lat] as [number, number] // Note: MongoDB uses [lng, lat] format
        }));

        const result = await TraderAssignmentService.assignTraderWithRouteOptimization(
          submissionIds,
          traderLocations,
          vehicleType
        );

        // Update Supabase records as well
        for (let i = 0; i < submissionIds.length; i++) {
          const { error } = await supabase
            .from('waste_submissions')
            .update({
              pickup_status: 'ASSIGNED',
              pickup_collector_id: result.trader._id,
              optimized_route_id: result.optimizedRoute.id,
              route_order: i + 1,
              estimated_arrival: new Date(Date.now() + result.optimizedRoute.totalDuration * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', submissionIds[i]);

          if (error) {
            console.error(`Error updating submission ${submissionIds[i]}:`, error);
          }
        }

        console.log(`✅ Collector assigned with ${result.savings.cost} cost reduction`);

        return NextResponse.json({
          success: true,
          assignment: {
            collector: {
              id: result.trader._id,
              name: result.trader.name,
              location: result.trader.location
            },
            optimizedRoute: result.optimizedRoute,
            savings: result.savings,
            estimatedCompletionTime: result.optimizedRoute.totalDuration,
            totalDistance: result.optimizedRoute.totalDistance,
            totalCost: result.optimizedRoute.totalFuelCost
          },
          message: `Collector assigned with AI-optimized route. ${result.savings.cost} cost reduction achieved.`
        });

      } catch (optimizationError) {
        console.warn('Route optimization failed, falling back to simple assignment:', optimizationError);
        // Fall back to simple assignment
      }
    }

    // Simple assignment without route optimization
    const firstLocation = {
      type: 'Point',
      coordinates: [locations[0].lng, locations[0].lat] as [number, number]
    };

    const nearestTrader = await TraderAssignmentService.findNearestTrader(firstLocation);
    
    if (!nearestTrader) {
      return NextResponse.json(
        { error: 'No available collectors found' },
        { status: 404 }
      );
    }

    // Assign to all submissions
    for (const submissionId of submissionIds) {
      await TraderAssignmentService.assignTrader(submissionId, firstLocation);
      
      // Update Supabase record
      const { error } = await supabase
        .from('waste_submissions')
        .update({
          pickup_status: 'ASSIGNED',
          pickup_collector_id: nearestTrader._id,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) {
        console.error(`Error updating submission ${submissionId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      assignment: {
        collector: {
          id: nearestTrader._id,
          name: nearestTrader.name,
          location: nearestTrader.location,
          distance: nearestTrader.distance
        },
        optimizedRoute: null,
        savings: null
      },
      message: 'Collector assigned successfully'
    });

  } catch (error) {
    console.error('Error assigning collector:', error);
    return NextResponse.json(
      { error: 'Failed to assign collector' },
      { status: 500 }
    );
  }
}

// GET - Get optimal collection time prediction
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'lat and lng parameters are required' },
        { status: 400 }
      );
    }

    const location = {
      type: 'Point',
      coordinates: [lng, lat] as [number, number]
    };

    const prediction = await TraderAssignmentService.getOptimalCollectionTime(location);

    return NextResponse.json({
      success: true,
      prediction,
      location: { lat, lng }
    });

  } catch (error) {
    console.error('Error getting optimal collection time:', error);
    return NextResponse.json(
      { error: 'Failed to get optimal collection time' },
      { status: 500 }
    );
  }
}

// PUT - Update collector location (for real-time tracking)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { collectorId, location, routeId } = body;

    if (!collectorId || !location) {
      return NextResponse.json(
        { error: 'collectorId and location are required' },
        { status: 400 }
      );
    }

    // Update collector location in MongoDB
    await TraderAssignmentService.updateCollectorLocation(collectorId, location);

    // Update Supabase collector record
    const { error } = await supabase
      .from('collectors')
      .update({
        current_location: location,
        last_active_at: new Date().toISOString()
      })
      .eq('id', collectorId);

    if (error) {
      console.error('Error updating collector location in Supabase:', error);
    }

    // If there's an active route, update route progress
    if (routeId) {
      const route = routeOptimization.getRouteById(routeId);
      if (route) {
        // Calculate route progress based on current location
        // This would involve more complex logic in a real implementation
        console.log(`📍 Collector ${collectorId} location updated for route ${routeId}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Collector location updated successfully'
    });

  } catch (error) {
    console.error('Error updating collector location:', error);
    return NextResponse.json(
      { error: 'Failed to update collector location' },
      { status: 500 }
    );
  }
}
