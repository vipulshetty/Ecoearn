// Test script to verify route optimization is working with real data
// Run with: node test-route-optimization.js

const testRouteOptimization = async () => {
  console.log('🧪 Testing Route Optimization Feature...\n');

  try {
    // Test 1: Check if pending pickups API works
    console.log('1️⃣ Testing Pending Pickups API...');
    const response = await fetch('http://localhost:3000/api/route-optimization/pending-pickups');
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API Response: ${data.pickupLocations.length} pickup locations found`);
      console.log(`   - Waste Submissions: ${data.summary.wasteSubmissions}`);
      console.log(`   - AI Detections: ${data.summary.aiDetections}`);
      console.log(`   - Total Points: ${data.summary.totalPoints}`);
      console.log(`   - Waste Types: ${data.summary.wasteTypes.join(', ')}`);
    } else {
      console.log('❌ API Error:', response.status, response.statusText);
    }

    // Test 2: Check if route optimization API works
    console.log('\n2️⃣ Testing Route Optimization API...');
    const optimizationResponse = await fetch('http://localhost:3000/api/route-optimization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collectorId: 'test-collector',
        pickupLocations: [
          { lat: 40.7589, lng: -73.9851, address: "Test Location 1", wasteType: "plastic" },
          { lat: 40.7505, lng: -73.9934, address: "Test Location 2", wasteType: "paper" }
        ],
        startLocation: { lat: 40.7614, lng: -73.9776, address: "Test Collection Center" },
        vehicleType: 'truck'
      })
    });

    if (optimizationResponse.ok) {
      const routeData = await optimizationResponse.json();
      console.log(`✅ Route Optimization: ${routeData.totalDistance.toFixed(2)}km route generated`);
      console.log(`   - Duration: ${(routeData.totalDuration * 60).toFixed(1)} minutes`);
      console.log(`   - Fuel Cost: $${routeData.totalFuelCost.toFixed(2)}`);
      console.log(`   - CO2 Emissions: ${routeData.totalEmissions.toFixed(1)}kg`);
      console.log(`   - Cost Savings: ${routeData.estimatedSavings.cost.toFixed(1)}%`);
      console.log(`   - Efficiency: ${routeData.efficiency.toFixed(1)}%`);
    } else {
      console.log('❌ Route Optimization Error:', optimizationResponse.status);
    }

    // Test 3: Check environment variables
    console.log('\n3️⃣ Checking Environment Variables...');
    const envVars = [
      'NEXT_PUBLIC_OPENWEATHER_API_KEY',
      'NEXT_PUBLIC_OPENROUTE_API_KEY'
    ];

    envVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value && value !== 'your_api_key_here') {
        console.log(`✅ ${envVar}: Configured`);
      } else {
        console.log(`⚠️  ${envVar}: Not configured (will use fallback data)`);
      }
    });

    console.log('\n🎉 Route Optimization Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Get free API keys from OpenWeatherMap and OpenRouteService');
    console.log('2. Add them to your .env.local file');
    console.log('3. Submit some waste or use AI detection to create pickup locations');
    console.log('4. Visit http://localhost:3000/routing to see the optimization in action');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your development server is running (npm run dev)');
    console.log('2. Check that your database is connected');
    console.log('3. Verify your API endpoints are working');
  }
};

// Run the test
testRouteOptimization();
