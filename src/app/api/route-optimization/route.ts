import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { routeOptimization } from '@/services/routeOptimization';
import { supabase } from '@/lib/supabase';

interface Location {
  lat: number;
  lng: number;
  address?: string;
  wasteType?: string;
  priority?: number;
  estimatedWeight?: number;
}

// POST - Optimize a collection route
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
    const { 
      collectorId, 
      pickupLocations, 
      startLocation, 
      vehicleType = 'truck' 
    } = body;

    // Validate input
    if (!collectorId || !pickupLocations || !startLocation) {
      return NextResponse.json(
        { error: 'Missing required fields: collectorId, pickupLocations, startLocation' },
        { status: 400 }
      );
    }

    if (!Array.isArray(pickupLocations) || pickupLocations.length === 0) {
      return NextResponse.json(
        { error: 'pickupLocations must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate location format
    const validateLocation = (loc: any): loc is Location => {
      return loc && 
             typeof loc.lat === 'number' && 
             typeof loc.lng === 'number' &&
             loc.lat >= -90 && loc.lat <= 90 &&
             loc.lng >= -180 && loc.lng <= 180;
    };

    if (!validateLocation(startLocation)) {
      return NextResponse.json(
        { error: 'Invalid startLocation format' },
        { status: 400 }
      );
    }

    for (let i = 0; i < pickupLocations.length; i++) {
      if (!validateLocation(pickupLocations[i])) {
        return NextResponse.json(
          { error: `Invalid location format at index ${i}` },
          { status: 400 }
        );
      }
    }

    // Validate vehicle type
    const validVehicleTypes = ['truck', 'van', 'bike'];
    if (!validVehicleTypes.includes(vehicleType)) {
      return NextResponse.json(
        { error: 'Invalid vehicle type. Must be truck, van, or bike' },
        { status: 400 }
      );
    }

    console.log(`🚛 Optimizing route for ${pickupLocations.length} locations`);

    // Optimize the route using AI
    const optimizedRoute = await routeOptimization.optimizeCollectionRoute(
      collectorId,
      pickupLocations,
      startLocation,
      vehicleType
    );

    // Save the optimized route to database
    const { error: saveError } = await supabase
      .from('optimized_routes')
      .insert({
        route_id: optimizedRoute.id,
        collector_id: collectorId,
        user_email: session.user.email,
        start_location: startLocation,
        pickup_locations: pickupLocations,
        optimized_waypoints: optimizedRoute.waypoints,
        vehicle_type: vehicleType,
        total_distance: optimizedRoute.totalDistance,
        total_duration: optimizedRoute.totalDuration,
        total_fuel_cost: optimizedRoute.totalFuelCost,
        total_emissions: optimizedRoute.totalEmissions,
        estimated_savings: optimizedRoute.estimatedSavings,
        efficiency_score: optimizedRoute.efficiency,
        created_at: new Date().toISOString()
      });

    if (saveError) {
      console.error('Error saving optimized route:', saveError);
      // Don't fail the request if saving fails
    }

    console.log(`✅ Route optimized with ${optimizedRoute.estimatedSavings.cost.toFixed(1)}% cost reduction`);

    return NextResponse.json({
      success: true,
      optimizedRoute,
      message: 'Route optimized successfully',
      savings: {
        distance: `${optimizedRoute.estimatedSavings.distance.toFixed(1)}%`,
        time: `${optimizedRoute.estimatedSavings.time.toFixed(1)}%`,
        cost: `${optimizedRoute.estimatedSavings.cost.toFixed(1)}%`,
        emissions: `${optimizedRoute.estimatedSavings.emissions.toFixed(1)}%`
      }
    });

  } catch (error) {
    console.error('Error optimizing route:', error);
    return NextResponse.json(
      { error: 'Failed to optimize route' },
      { status: 500 }
    );
  }
}

// GET - Fetch route optimization performance metrics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get('routeId');

    if (routeId) {
      // Get specific route details
      const route = routeOptimization.getRouteById(routeId);
      
      if (!route) {
        return NextResponse.json(
          { error: 'Route not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        route,
        success: true
      });
    } else {
      // Get performance metrics
      const metrics = routeOptimization.getPerformanceMetrics();
      
      // Get user's route history from database
      const { data: routeHistory, error } = await supabase
        .from('optimized_routes')
        .select('*')
        .eq('user_email', session.user.email)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching route history:', error);
      }

      return NextResponse.json({
        metrics,
        routeHistory: routeHistory || [],
        success: true
      });
    }

  } catch (error) {
    console.error('Error fetching route data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch route data' },
      { status: 500 }
    );
  }
}

// PUT - Update route status or feedback
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
    const { routeId, status, feedback, actualMetrics } = body;

    if (!routeId) {
      return NextResponse.json(
        { error: 'Route ID is required' },
        { status: 400 }
      );
    }

    // Update route in database
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (feedback) updateData.feedback = feedback;
    if (actualMetrics) updateData.actual_metrics = actualMetrics;

    const { error } = await supabase
      .from('optimized_routes')
      .update(updateData)
      .eq('route_id', routeId)
      .eq('user_email', session.user.email);

    if (error) {
      console.error('Error updating route:', error);
      return NextResponse.json(
        { error: 'Failed to update route' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Route updated successfully'
    });

  } catch (error) {
    console.error('Error updating route:', error);
    return NextResponse.json(
      { error: 'Failed to update route' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a route
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get('routeId');

    if (!routeId) {
      return NextResponse.json(
        { error: 'Route ID is required' },
        { status: 400 }
      );
    }

    // Delete route from database
    const { error } = await supabase
      .from('optimized_routes')
      .delete()
      .eq('route_id', routeId)
      .eq('user_email', session.user.email);

    if (error) {
      console.error('Error deleting route:', error);
      return NextResponse.json(
        { error: 'Failed to delete route' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Route deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting route:', error);
    return NextResponse.json(
      { error: 'Failed to delete route' },
      { status: 500 }
    );
  }
}
