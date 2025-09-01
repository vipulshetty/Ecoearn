'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { calculateOptimalRoute } from '@/services/ospfRouting';

export default function TestOSPF() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testScenarios = [
    {
      name: "Bangalore Local Test",
      from: { lat: 12.9716, lng: 77.5946, name: "Bangalore Center" },
      to: { lat: 12.9800, lng: 77.6000, name: "Bangalore North" }
    },
    {
      name: "Mumbai Local Test", 
      from: { lat: 19.0760, lng: 72.8777, name: "Mumbai Central" },
      to: { lat: 19.0896, lng: 72.8656, name: "Mumbai North" }
    },
    {
      name: "Chelsea to Upper West Side",
      from: { lat: 40.7505, lng: -73.9934, name: "Chelsea" },
      to: { lat: 40.7831, lng: -73.9712, name: "Upper West Side" }
    },
    {
      name: "Custom Location Test",
      from: { lat: 40.7300, lng: -73.9900, name: "Random Point A" },
      to: { lat: 40.7600, lng: -73.9700, name: "Random Point B" }
    }
  ];

  const runTest = async (scenario: any) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`🧪 Testing OSPF: ${scenario.name}`);
      
      const startTime = performance.now();
      const route = calculateOptimalRoute(
        scenario.from.lat,
        scenario.from.lng,
        scenario.to.lat,
        scenario.to.lng
      );
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      setResult({
        ...route,
        executionTime: executionTime.toFixed(2),
        scenario: scenario.name
      });

      console.log(`✅ OSPF Test Complete: ${scenario.name}`);
      console.log(`📊 Path: ${route.path.length} nodes`);
      console.log(`📏 Distance: ${route.totalDistance}km`);
      console.log(`⏱️ Time: ${route.estimatedTime}min`);
      console.log(`🚀 Execution: ${executionTime.toFixed(2)}ms`);

    } catch (err) {
      console.error('❌ OSPF Test Failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 OSPF Algorithm Test Suite
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Test the enhanced OSPF shortest path algorithm with 15-node network and dynamic graph generation
          </p>
        </motion.div>

        {/* Test Scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {testScenarios.map((scenario, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <h3 className="text-lg font-semibold mb-4">{scenario.name}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><strong>From:</strong> {scenario.from.name} ({scenario.from.lat.toFixed(4)}, {scenario.from.lng.toFixed(4)})</p>
                <p><strong>To:</strong> {scenario.to.name} ({scenario.to.lat.toFixed(4)}, {scenario.to.lng.toFixed(4)})</p>
              </div>
              <button
                onClick={() => runTest(scenario)}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Running Test...' : 'Test OSPF Algorithm'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Results */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Test Failed</h3>
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <h3 className="text-xl font-semibold mb-4">✅ OSPF Results: {result.scenario}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{result.path.length}</p>
                <p className="text-sm text-blue-800">Nodes in Path</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{result.totalDistance}km</p>
                <p className="text-sm text-green-800">Total Distance</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">{result.estimatedTime}min</p>
                <p className="text-sm text-orange-800">Estimated Time</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{result.executionTime}ms</p>
                <p className="text-sm text-purple-800">Execution Time</p>
              </div>
            </div>

            {/* Path Details */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">🗺️ Path Nodes:</h4>
              <div className="flex flex-wrap gap-2">
                {result.path.map((node: any, index: number) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      index === 0 
                        ? 'bg-green-100 text-green-800' 
                        : index === result.path.length - 1 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {node.name || node.id}
                  </span>
                ))}
              </div>
            </div>

            {/* Route Instructions */}
            <div>
              <h4 className="font-semibold mb-3">📋 Route Instructions:</h4>
              <ol className="space-y-2">
                {result.route.instructions.map((instruction: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="bg-gray-100 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}

        {/* Algorithm Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 rounded-xl p-6 mt-8"
        >
          <h3 className="text-lg font-semibold mb-4">🔬 Algorithm Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Network Structure:</h4>
              <ul className="space-y-1">
                <li>• 15 fixed nodes (Manhattan grid)</li>
                <li>• Dynamic start/end node injection</li>
                <li>• Bidirectional edge connectivity</li>
                <li>• Traffic factor weighting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Algorithm Features:</h4>
              <ul className="space-y-1">
                <li>• Dijkstra's shortest path</li>
                <li>• Priority queue optimization</li>
                <li>• Early termination</li>
                <li>• Multi-connection fallback</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}