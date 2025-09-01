'use client';

'use client';

import { useState } from 'react';
import { calculateOptimalRoute } from '@/services/ospfRouting';

export default function TestRouting() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testDijkstraAlgorithm = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🗺️ Testing Dijkstra\'s shortest path algorithm...');
      
      // Test with Bangalore coordinates
      const startLat = 12.9716;
      const startLng = 77.5946;
      const endLat = 12.9800;
      const endLng = 77.6000;
      
      console.log(`🎯 Testing route: ${startLat},${startLng} → ${endLat},${endLng}`);
      
      const routeResult = await calculateOptimalRoute(startLat, startLng, endLat, endLng);
      
      console.log('✅ Dijkstra Algorithm Result:', routeResult);
      
      const distance = routeResult.totalDistance;
      const duration = routeResult.estimatedTime;
      const coordinatesCount = routeResult.route.coordinates.length;
      const algorithm = routeResult.algorithm;
      
      console.log(`🛣️ Route calculated: ${distance}km, ${duration}min`);
      console.log(`🗺️ Algorithm: ${algorithm}`);
      console.log(`📍 Waypoints: ${coordinatesCount}`);
      
      setResult({
        success: true,
        distance: distance.toFixed(2),
        duration: duration.toFixed(0),
        algorithm: algorithm,
        coordinatesCount: coordinatesCount,
        isDijkstra: algorithm === 'dijkstra',
        pathNodes: routeResult.path.length,
        rawResponse: routeResult
      });
      
    } catch (err) {
      console.error('❌ Dijkstra Test Failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">🗺️ Dijkstra's Shortest Path Algorithm Test</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-800 text-sm">
            📋 <strong>Testing:</strong> Dijkstra's shortest path algorithm with artificial road network<br/>
            🎯 <strong>Goal:</strong> Create realistic road network and find optimal path like Uber/Ola<br/>
            ✅ <strong>Success:</strong> Should create city-like intersections and calculate shortest route
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
          <button
            onClick={testDijkstraAlgorithm}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Running Dijkstra\'s Algorithm...' : 'Test Shortest Path Algorithm'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Test Failed</h3>
            <p className="text-red-600 font-mono text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className={`border rounded-xl p-6 ${
            result.isDijkstra 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              result.isDijkstra 
                ? 'text-green-800' 
                : 'text-yellow-800'
            }`}>
              {result.isDijkstra 
                ? '✅ Dijkstra\'s Shortest Path Found!' 
                : '⚠️ Fallback Route Used'
              }
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Distance</p>
                <p className="text-lg font-semibold">{result.distance} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-semibold">{result.duration} min</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Algorithm</p>
                <p className="text-lg font-semibold capitalize">{result.algorithm}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Path Nodes</p>
                <p className="text-lg font-semibold">{result.pathNodes}</p>
              </div>
            </div>
            
            <div className={`p-3 rounded-lg mb-4 ${
              result.isDijkstra 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              <p className="font-semibold">
                {result.isDijkstra 
                  ? '🛣️ Artificial road network created with intersections & highways!' 
                  : '📏 Using fallback calculation (direct route)'
                }
              </p>
              <p className="text-sm mt-1">
                {result.isDijkstra
                  ? `Optimal path found through ${result.pathNodes} network nodes with ${result.coordinatesCount} waypoints`
                  : `Direct route with only ${result.coordinatesCount} coordinate points`
                }
              </p>
            </div>
            
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold">Algorithm Result Details</summary>
              <pre className="mt-2 bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(result.rawResponse, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}