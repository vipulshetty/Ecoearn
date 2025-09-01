'use client';

import AutoRouteDisplay from '@/components/AutoRouteDisplay';

export default function TestRoutePage() {
  // Test data to debug the AutoRouteDisplay component
  const testTraderLocation = {
    lat: 40.7589,
    lng: -73.9851,
    name: 'Test Trader - Times Square'
  };

  const testUserLocation = {
    lat: 40.7505,
    lng: -73.9934
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">🧪 Auto Route Display Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-[600px]">
            <AutoRouteDisplay
              traderLocation={testTraderLocation}
              userLocation={testUserLocation}
              onRouteCalculated={(route) => {
                console.log('🎯 Test Route Calculated:', route);
              }}
            />
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Test Parameters:</h3>
          <div className="text-sm space-y-1">
            <p><strong>Trader:</strong> {testTraderLocation.name} ({testTraderLocation.lat}, {testTraderLocation.lng})</p>
            <p><strong>User:</strong> Pickup Location ({testUserLocation.lat}, {testUserLocation.lng})</p>
          </div>
        </div>
      </div>
    </div>
  );
}