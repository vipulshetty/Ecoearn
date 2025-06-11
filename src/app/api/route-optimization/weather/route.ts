import { NextResponse } from 'next/server';

// Rate limiting to prevent API abuse
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 50; // 50 requests per minute (more generous)

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

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

    const { location } = await request.json();

    if (!location || !location.lat || !location.lng) {
      return NextResponse.json(
        { error: 'Invalid location provided' },
        { status: 400 }
      );
    }

    // Try OpenWeatherMap API (server-side, no CORS issues)
    const openWeatherApiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    
    if (openWeatherApiKey && openWeatherApiKey !== 'your_openweather_api_key_here') {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${openWeatherApiKey}&units=metric`;

        console.log(`🌤️ Server-side weather request for: ${location.lat.toFixed(4)},${location.lng.toFixed(4)}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'EcoEarn-RouteOptimizer/1.0'
          }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          
          const weatherData = {
            condition: data.weather[0].main.toLowerCase(),
            temperature: data.main.temp,
            precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
            windSpeed: data.wind.speed,
            visibility: (data.visibility || 10000) / 1000, // Convert to km
            source: 'openweathermap'
          };
          
          console.log(`✅ OpenWeatherMap success: ${weatherData.condition}, ${weatherData.temperature}°C`);
          
          return NextResponse.json(weatherData);
        } else if (response.status === 429) {
          console.warn('⚠️ OpenWeatherMap rate limit hit, using fallback calculation');
        } else {
          console.warn(`⚠️ OpenWeatherMap error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.warn('⚠️ OpenWeatherMap request failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    } else {
      console.log('ℹ️ OpenWeatherMap API key not configured, using intelligent defaults');
    }

    // Fallback to intelligent weather estimation
    const weatherData = generateIntelligentWeatherDefaults(location);
    console.log(`📐 Weather fallback: ${weatherData.condition}, ${weatherData.temperature}°C`);

    return NextResponse.json(weatherData);

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate intelligent weather defaults based on location and season
function generateIntelligentWeatherDefaults(location: { lat: number; lng: number }) {
  const month = new Date().getMonth();
  const hour = new Date().getHours();
  const isWinter = month >= 11 || month <= 2;
  const isSummer = month >= 5 && month <= 8;
  const isNorthern = location.lat > 30;
  const isTropical = Math.abs(location.lat) < 23.5;

  let condition = 'clear';
  let temperature = 20;
  let precipitation = 0;
  let windSpeed = 5;
  let visibility = 10;

  // Temperature estimation based on location and season
  if (isTropical) {
    temperature = 25 + Math.random() * 8; // 25-33°C
    condition = Math.random() > 0.7 ? 'rain' : 'clear';
    precipitation = condition === 'rain' ? 2 + Math.random() * 8 : 0;
  } else if (isNorthern && isWinter) {
    temperature = -5 + Math.random() * 15; // -5 to 10°C
    condition = Math.random() > 0.6 ? (temperature < 0 ? 'snow' : 'rain') : 'clear';
    precipitation = condition !== 'clear' ? 1 + Math.random() * 4 : 0;
  } else if (isSummer) {
    temperature = 20 + Math.random() * 15; // 20-35°C
    condition = Math.random() > 0.8 ? 'rain' : 'clear';
    precipitation = condition === 'rain' ? 1 + Math.random() * 5 : 0;
  } else {
    // Spring/Fall
    temperature = 10 + Math.random() * 20; // 10-30°C
    condition = Math.random() > 0.75 ? 'rain' : 'clear';
    precipitation = condition === 'rain' ? 0.5 + Math.random() * 3 : 0;
  }

  // Adjust for time of day
  if (hour < 6 || hour > 20) {
    temperature -= 3; // Cooler at night
  } else if (hour >= 12 && hour <= 16) {
    temperature += 2; // Warmer in afternoon
  }

  // Wind and visibility based on weather
  windSpeed = 3 + Math.random() * 7;
  if (condition === 'rain' || condition === 'snow') {
    windSpeed += 2;
    visibility = 3 + Math.random() * 5; // Reduced visibility
  }

  return {
    condition,
    temperature: Math.round(temperature * 10) / 10,
    precipitation: Math.round(precipitation * 10) / 10,
    windSpeed: Math.round(windSpeed * 10) / 10,
    visibility: Math.round(visibility * 10) / 10,
    source: 'intelligent_fallback'
  };
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'EcoEarn Weather API',
    rateLimit: {
      window: '1 minute',
      maxRequests: 20
    },
    supportedConditions: ['clear', 'rain', 'snow', 'clouds', 'fog']
  });
}
