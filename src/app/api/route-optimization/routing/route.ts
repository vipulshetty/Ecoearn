import { NextResponse } from 'next/server';

// Enhanced rate limiting with higher burst allowance for complete road coverage
const rateLimitMap = new Map<string, { count: number; resetTime: number; burstCount: number; lastBurstReset: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute (higher sustainable rate)
const BURST_LIMIT = 50; // Allow 50 requests in quick succession for route pre-calculation
const BURST_WINDOW = 15000; // 15 seconds burst window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
      burstCount: 1,
      lastBurstReset: now + BURST_WINDOW
    });
    return true;
  }

  // Reset burst counter if burst window expired
  if (now > userLimit.lastBurstReset) {
    userLimit.burstCount = 0;
    userLimit.lastBurstReset = now + BURST_WINDOW;
  }

  // Check burst limit first (allows quick succession of requests)
  if (userLimit.burstCount < BURST_LIMIT) {
    userLimit.count++;
    userLimit.burstCount++;
    return true;
  }

  // Check regular rate limit
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'localhost';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { from, to, vehicleType } = await request.json();

    if (!from || !to || !from.lat || !from.lng || !to.lat || !to.lng) {
      return NextResponse.json(
        { error: 'Invalid coordinates provided' },
        { status: 400 }
      );
    }

    // Try OpenRouteService API (server-side, no CORS issues)
    const openRouteApiKey = process.env.NEXT_PUBLIC_OPENROUTE_API_KEY;
    
    if (openRouteApiKey && openRouteApiKey !== 'your_openroute_api_key_here') {
      try {
        const profile = vehicleType === 'bike' ? 'cycling-regular' : 'driving-car';
        const url = `https://api.openrouteservice.org/v2/directions/${profile}`;

        console.log(`🗺️ Server-side routing request: ${from.lat.toFixed(4)},${from.lng.toFixed(4)} → ${to.lat.toFixed(4)},${to.lng.toFixed(4)}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouteApiKey}`,
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
          },
          body: JSON.stringify({
            coordinates: [[from.lng, from.lat], [to.lng, to.lat]],
            geometry: true,
            instructions: false,
            elevation: false
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log(`🔍 OpenRouteService response structure:`, {
            routes: data.routes?.length || 0,
            hasGeometry: !!data.routes?.[0]?.geometry,
            geometryType: typeof data.routes?.[0]?.geometry
          });
          const route = data.routes?.[0];

          if (route) {
            const distance = route.summary.distance / 1000; // Convert to km
            const duration = route.summary.duration / 3600;  // Convert to hours

            // Extract the route geometry (actual road path)
            const geometry = route.geometry;
            let routeCoordinates: [number, number][] = [];

            console.log(`🔍 OpenRouteService geometry:`, {
              type: typeof geometry,
              present: !!geometry,
              isString: typeof geometry === 'string',
              hasCoordinates: !!(geometry?.coordinates),
              coordinatesLength: geometry?.coordinates?.length || 0
            });

            if (geometry) {
              // OpenRouteService returns GeoJSON LineString geometry or encoded polyline
              if (geometry.coordinates && Array.isArray(geometry.coordinates)) {
                // Convert from [lng, lat] to [lat, lng] format for Leaflet
                routeCoordinates = geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
                console.log(`🗺️ Extracted ${routeCoordinates.length} route coordinates from GeoJSON`);
              } else if (typeof geometry === 'string') {
                // Decode the polyline string to get actual road coordinates
                console.log('🔍 Decoding polyline geometry...');
                try {
                  routeCoordinates = decodePolyline(geometry);
                  console.log(`🗺️ Decoded ${routeCoordinates.length} route coordinates from polyline`);
                } catch (error) {
                  console.warn('⚠️ Failed to decode polyline, using fallback coordinates:', error);
                  routeCoordinates = [[from.lat, from.lng], [to.lat, to.lng]];
                }
              } else {
                console.log('⚠️ Unknown geometry format, using fallback:', JSON.stringify(geometry));
                routeCoordinates = [[from.lat, from.lng], [to.lat, to.lng]];
              }
            } else {
              console.log('⚠️ No geometry in response, using fallback coordinates');
              routeCoordinates = [[from.lat, from.lng], [to.lat, to.lng]];
            }

            // If no geometry or empty coordinates, fall back to straight line
            if (routeCoordinates.length === 0) {
              console.log('⚠️ No route coordinates found, using straight line fallback');
              routeCoordinates = [[from.lat, from.lng], [to.lat, to.lng]];
            }

            console.log(`✅ OpenRouteService success: ${distance.toFixed(2)}km, ${(duration * 60).toFixed(1)}min, ${routeCoordinates.length} route points`);

            return NextResponse.json({
              distance,
              duration,
              routeCoordinates,
              source: 'openrouteservice'
            });
          }
        } else if (response.status === 429) {
          console.warn('⚠️ OpenRouteService rate limit hit, using fallback calculation');
        } else {
          const errorText = await response.text();
          console.warn(`⚠️ OpenRouteService error: ${response.status} ${response.statusText}`, errorText);
        }
      } catch (error) {
        console.warn('⚠️ OpenRouteService request failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    } else {
      console.log('ℹ️ OpenRouteService API key not configured, using Haversine calculation');
    }

    // Fallback to Haversine formula calculation
    const distance = calculateHaversineDistance(from, to);
    const estimatedSpeed = vehicleType === 'bike' ? 15 : 40; // km/h
    const duration = distance / estimatedSpeed;

    // For fallback, just use straight line
    const routeCoordinates: [number, number][] = [[from.lat, from.lng], [to.lat, to.lng]];

    console.log(`📐 Haversine fallback: ${distance.toFixed(2)}km, ${(duration * 60).toFixed(1)}min`);

    return NextResponse.json({
      distance,
      duration,
      routeCoordinates,
      source: 'haversine'
    });

  } catch (error) {
    console.error('Routing API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Haversine formula to calculate distance between two points
function calculateHaversineDistance(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Decode polyline string to coordinates
function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    // Decode latitude
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const deltaLat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += deltaLat;

    shift = 0;
    result = 0;

    // Decode longitude
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const deltaLng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += deltaLng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'EcoEarn Route Optimization API',
    endpoints: {
      routing: 'POST /api/route-optimization/routing',
      pendingPickups: 'GET /api/route-optimization/pending-pickups'
    },
    rateLimit: {
      window: '1 minute',
      maxRequests: 30
    }
  });
}
