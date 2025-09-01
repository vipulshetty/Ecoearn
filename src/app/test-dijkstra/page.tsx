'use client';

import { useState } from 'react';

export default function TestDijkstra() {
  const [result, setResult] = useState<string>('');

  const testNetworkCreation = () => {
    console.log('🧪 Testing network creation step by step...');
    
    // Simulate the network creation manually
    const startLat = 12.9716;
    const startLng = 77.5946;
    const endLat = 12.9800;
    const endLng = 77.6000;
    
    console.log(`📍 Start: [${startLat}, ${startLng}]`);
    console.log(`📍 End: [${endLat}, ${endLng}]`);
    
    // Calculate network bounds
    const padding = 0.01;
    const minLat = Math.min(startLat, endLat) - padding;
    const maxLat = Math.max(startLat, endLat) + padding;
    const minLng = Math.min(startLng, endLng) - padding;
    const maxLng = Math.max(startLng, endLng) + padding;
    
    console.log(`🗺️ Network bounds: lat[${minLat.toFixed(4)}, ${maxLat.toFixed(4)}], lng[${minLng.toFixed(4)}, ${maxLng.toFixed(4)}]`);
    
    // Calculate grid
    const gridSize = 0.003;
    const latSteps = Math.ceil((maxLat - minLat) / gridSize);
    const lngSteps = Math.ceil((maxLng - minLng) / gridSize);
    
    console.log(`🏗️ Grid will be ${latSteps}x${lngSteps} = ${latSteps * lngSteps} intersections`);
    
    // Test distance calculation
    const testDistance = Math.sqrt(
      Math.pow((endLat - startLat) * 111, 2) + 
      Math.pow((endLng - startLng) * 111, 2)
    );
    
    console.log(`📏 Direct distance: ${testDistance.toFixed(2)} km`);
    
    setResult(`
Network Analysis:
- Bounds: lat[${minLat.toFixed(4)}, ${maxLat.toFixed(4)}], lng[${minLng.toFixed(4)}, ${maxLng.toFixed(4)}]
- Grid: ${latSteps}x${lngSteps} = ${latSteps * lngSteps} intersections
- Direct distance: ${testDistance.toFixed(2)} km
- Grid size: ${gridSize} degrees (~${(gridSize * 111).toFixed(0)}m)
    `);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">🧪 Dijkstra Debug Test</h1>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
          <button
            onClick={testNetworkCreation}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700"
          >
            Test Network Creation Logic
          </button>
        </div>

        {result && (
          <div className="bg-gray-50 border rounded-xl p-6">
            <h3 className="font-semibold mb-2">Network Analysis Results:</h3>
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
          <p className="text-yellow-800 text-sm">
            📝 <strong>Debug Steps:</strong><br/>
            1. Click the button above to test network logic<br/>
            2. Open browser console (F12) to see detailed logs<br/>
            3. Compare results with the main algorithm<br/>
            4. Look for differences in network creation
          </p>
        </div>
      </div>
    </div>
  );
}