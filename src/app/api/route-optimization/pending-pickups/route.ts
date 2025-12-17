import { NextResponse } from 'next/server';

// Try to import Supabase, but handle gracefully if it fails
let supabase: any = null;
let supabaseDisabledDueToError = false;
try {
  const { createClient } = require('@supabase/supabase-js');
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }
} catch (error) {
  console.warn('Supabase not available, using fallback data');
}

export async function GET() {
  try {
    let submissions: any[] = [];
    let aiDetections: any[] = [];

    // Try to fetch from Supabase if available
    if (supabase && !supabaseDisabledDueToError) {
      try {
        console.log('🔍 Attempting to fetch from Supabase...');

        // Fetch pending waste submissions with pickup locations
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('waste_submissions')
          .select(`
            id,
            type,
            quality,
            points,
            pickup_location,
            created_at,
            pickup_status,
            ai_confidence,
            image_url
          `)
          .eq('pickup_status', 'PENDING')
          .not('pickup_location', 'is', null)
          .order('created_at', { ascending: true })
          .limit(20);

        if (submissionsError) {
          const msg = typeof (submissionsError as any)?.message === 'string' ? (submissionsError as any).message : '';
          if (msg.includes('fetch failed')) {
            supabaseDisabledDueToError = true;
            console.warn('Supabase unreachable (fetch failed). Using fallback data.');
          } else {
            console.warn('Supabase submissions error:', submissionsError);
          }
        } else {
          submissions = submissionsData || [];
          console.log(`✅ Found ${submissions.length} waste submissions`);
        }

        // Since ai_detections table doesn't exist, we'll skip this for now
        // In the future, you can create this table or use existing waste_submissions
        console.log('ℹ️ AI detections table not available, using only waste submissions');

      } catch (dbError: any) {
        const msg = typeof dbError?.message === 'string' ? dbError.message : '';
        // When Supabase is configured but unreachable, undici throws "TypeError: fetch failed".
        // Disable Supabase for this process so subsequent requests don't spam logs.
        if (msg.includes('fetch failed')) {
          supabaseDisabledDueToError = true;
          console.warn('Supabase unreachable (fetch failed). Using fallback data.');
        } else {
          console.warn('Database connection failed, using fallback data:', dbError);
        }
      }
    } else {
      console.log('📝 Supabase not configured, using sample data for demo');
    }

    // Transform data for route optimization
    const pickupLocations: any[] = [];

    // Add waste submissions
    if (submissions && submissions.length > 0) {
      submissions.forEach(submission => {
        if (submission.pickup_location) {
          pickupLocations.push({
            id: `submission-${submission.id}`,
            lat: submission.pickup_location.lat || submission.pickup_location.latitude,
            lng: submission.pickup_location.lng || submission.pickup_location.longitude,
            address: submission.pickup_location.address || `${submission.type} pickup`,
            wasteType: submission.type, // Using 'type' column from your schema
            priority: submission.quality === 'high' ? 1 : submission.quality === 'medium' ? 2 : 3,
            estimatedWeight: getEstimatedWeight(submission.type),
            points: submission.points,
            submissionType: 'waste_submission',
            createdAt: submission.created_at,
            confidence: submission.ai_confidence
          });
        }
      });
    }

    // Skip AI detections since the table doesn't exist in your schema
    // You can add this later if needed

    // If no real data available, provide sample data for demonstration
    if (pickupLocations.length === 0) {
      console.log('📝 No real pickup data found, providing sample locations for demo');

      // Generate realistic sample pickup locations
      const sampleLocations = [
        { lat: 40.7589, lng: -73.9851, address: "123 Main St, Manhattan", wasteType: "plastic", quality: "high" },
        { lat: 40.7505, lng: -73.9934, address: "456 Oak Ave, Chelsea", wasteType: "paper", quality: "medium" },
        { lat: 40.7614, lng: -73.9776, address: "789 Pine Rd, Midtown", wasteType: "metal", quality: "high" },
        { lat: 40.7282, lng: -73.9942, address: "321 5th Ave, Greenwich Village", wasteType: "glass", quality: "medium" },
        { lat: 40.7831, lng: -73.9712, address: "654 Broadway, Upper West Side", wasteType: "electronics", quality: "high" },
        { lat: 40.7489, lng: -73.9680, address: "987 Park Ave, Gramercy", wasteType: "organic", quality: "low" }
      ];

      sampleLocations.forEach((location, index) => {
        pickupLocations.push({
          id: `sample-${index + 1}`,
          lat: location.lat,
          lng: location.lng,
          address: location.address,
          wasteType: location.wasteType,
          priority: location.quality === 'high' ? 1 : location.quality === 'medium' ? 2 : 3,
          estimatedWeight: getEstimatedWeight(location.wasteType),
          points: Math.floor(Math.random() * 50) + 10,
          submissionType: 'sample_data',
          createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString() // Random time in last 24h
        });
      });
    }

    // Sort by priority and creation date
    pickupLocations.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Higher priority first
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Older first
    });

    // Default collection center (can be configured)
    const defaultStartLocation = {
      lat: 40.7614,
      lng: -73.9776,
      address: "EcoEarn Collection Center"
    };

    console.log(`📍 Found ${pickupLocations.length} real pickup locations for route optimization`);

    return NextResponse.json({
      pickupLocations: pickupLocations.slice(0, 15), // Limit to 15 for performance
      startLocation: defaultStartLocation,
      totalPending: pickupLocations.length,
      summary: {
        wasteSubmissions: submissions?.length || 0,
        aiDetections: 0, // No AI detections table in current schema
        totalPoints: pickupLocations.reduce((sum, loc) => sum + (loc.points || 0), 0),
        wasteTypes: Array.from(new Set(pickupLocations.map(loc => loc.wasteType)))
      }
    });

  } catch (error) {
    console.error('Error in pending pickups API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to estimate weight based on waste type
function getEstimatedWeight(wasteType: string): number {
  const weightEstimates: Record<string, number> = {
    'plastic': 0.5,
    'paper': 1.0,
    'cardboard': 0.8,
    'metal': 2.0,
    'aluminum': 0.3,
    'glass': 1.5,
    'electronics': 3.0,
    'organic': 2.5,
    'textile': 0.7,
    'battery': 0.2,
    'mixed': 1.2
  };

  const type = wasteType?.toLowerCase() || 'mixed';
  const baseWeight = weightEstimates[type] || weightEstimates['mixed'];
  
  // Add some randomness (±30%)
  const variation = 0.7 + (Math.random() * 0.6);
  return Math.round((baseWeight * variation) * 10) / 10;
}

// POST endpoint to update pickup status after route completion
export async function POST(request: Request) {
  try {
    const { pickupIds, status, collectorId, routeId } = await request.json();

    if (!pickupIds || !Array.isArray(pickupIds)) {
      return NextResponse.json(
        { error: 'Invalid pickup IDs' },
        { status: 400 }
      );
    }

    const updates = [];

    for (const pickupId of pickupIds) {
      const [type, id] = pickupId.split('-');
      
      if (type === 'submission') {
        const { error } = await supabase
          .from('waste_submissions')
          .update({
            pickup_status: status,
            pickup_collector_id: collectorId,
            updated_at: new Date().toISOString()
          })
          .eq('id', parseInt(id));
        
        if (error) {
          console.error(`Error updating submission ${id}:`, error);
        } else {
          updates.push({ type: 'submission', id, status });
        }
      }
    }

    console.log(`✅ Updated ${updates.length} pickup statuses to ${status}`);

    return NextResponse.json({
      message: 'Pickup statuses updated successfully',
      updates,
      routeId
    });

  } catch (error) {
    console.error('Error updating pickup statuses:', error);
    return NextResponse.json(
      { error: 'Failed to update pickup statuses' },
      { status: 500 }
    );
  }
}
