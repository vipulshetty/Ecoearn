'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  MapPinIcon,
  TruckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { routeOptimization } from '@/services/routeOptimization';

// Dynamically import map to avoid SSR issues
const RouteMap = dynamic(() => import('./RouteMap'), { ssr: false });

interface Location {
  lat: number;
  lng: number;
  address?: string;
  wasteType?: string;
  priority?: number;
  estimatedWeight?: number;
}

interface OptimizedRoute {
  id: string;
  collectorId: string;
  waypoints: Location[];
  totalDistance: number;
  totalDuration: number;
  totalFuelCost: number;
  totalEmissions: number;
  estimatedSavings: {
    distance: number;
    time: number;
    cost: number;
    emissions: number;
  };
  efficiency: number;
}

interface RouteOptimizerProps {
  collectorId: string;
  pickupLocations: Location[];
  startLocation: Location;
}

export default function RouteOptimizer({ 
  collectorId, 
  pickupLocations, 
  startLocation 
}: RouteOptimizerProps) {
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [vehicleType, setVehicleType] = useState<'truck' | 'van' | 'bike'>('truck');
  const [showMetrics, setShowMetrics] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  useEffect(() => {
    loadPerformanceMetrics();
  }, []);

  const loadPerformanceMetrics = async () => {
    const metrics = routeOptimization.getPerformanceMetrics();
    setPerformanceMetrics(metrics);
  };

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);

    try {
      // Better progress simulation that doesn't get stuck
      const progressInterval = setInterval(() => {
        setOptimizationProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 15 + 5; // Random progress between 5-20%
        });
      }, 300);

      console.log('🚛 Starting route optimization...');

      const route = await routeOptimization.optimizeCollectionRoute(
        collectorId,
        pickupLocations,
        startLocation,
        vehicleType
      );

      clearInterval(progressInterval);
      setOptimizationProgress(100);
      setOptimizedRoute(route);

      console.log('✅ Route optimization completed successfully');

      // Update performance metrics
      await loadPerformanceMetrics();

    } catch (error) {
      console.error('❌ Route optimization failed:', error);

      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Route optimization failed: ${errorMessage}\n\nThe system will use fallback calculations.`);

      // Try to create a fallback route
      try {
        const fallbackRoute = await routeOptimization.optimizeCollectionRoute(
          collectorId,
          pickupLocations.slice(0, 3), // Limit to 3 locations for fallback
          startLocation,
          vehicleType
        );
        setOptimizedRoute(fallbackRoute);
        console.log('✅ Fallback route created successfully');
      } catch (fallbackError) {
        console.error('❌ Fallback route creation also failed:', fallbackError);
      }
    } finally {
      setIsOptimizing(false);
      setTimeout(() => setOptimizationProgress(0), 2000);
    }
  };

  const formatDuration = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDistance = (km: number): string => {
    return `${km.toFixed(1)} km`;
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🚛 AI Route Optimization
        </h2>
        <p className="text-gray-600">
          Optimize collection routes using machine learning algorithms for maximum efficiency
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="truck">Truck (Large)</option>
                <option value="van">Van (Medium)</option>
                <option value="bike">Bike (Small)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Locations
              </label>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4" />
                <span>{pickupLocations.length} locations</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChartBarIcon className="h-5 w-5" />
              <span>Metrics</span>
            </button>
            
            <button
              onClick={handleOptimizeRoute}
              disabled={isOptimizing || pickupLocations.length === 0}
              className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOptimizing ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <PlayIcon className="h-5 w-5" />
                  <span>Optimize Route</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Optimization Progress */}
        {isOptimizing && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Optimizing route with AI algorithms...</span>
              <span>{optimizationProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${optimizationProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics Modal */}
      {showMetrics && performanceMetrics && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border p-6 mb-6"
        >
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {performanceMetrics.totalRoutes}
              </p>
              <p className="text-sm text-gray-600">Routes Optimized</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {performanceMetrics.averageCostReduction}
              </p>
              <p className="text-sm text-gray-600">Avg Cost Reduction</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {performanceMetrics.averageSavings.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Efficiency Gain</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {performanceMetrics.environmentalImpact}
              </p>
              <p className="text-sm text-gray-600">CO₂ Saved</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Route Visualization</h3>
            </div>
            <div className="h-96">
              <RouteMap
                startLocation={startLocation}
                pickupLocations={pickupLocations}
                optimizedRoute={optimizedRoute?.waypoints || []}
                isOptimized={!!optimizedRoute}
                routeCoordinates={optimizedRoute?.fullRouteCoordinates}
              />
            </div>
          </div>
        </div>

        {/* Route Details */}
        <div className="space-y-6">
          {/* Route Summary */}
          {optimizedRoute && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl border p-6"
            >
              <h3 className="font-semibold mb-4">Optimized Route Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">Total Distance</span>
                  </div>
                  <span className="font-medium">
                    {formatDistance(optimizedRoute.totalDistance)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">Estimated Time</span>
                  </div>
                  <span className="font-medium">
                    {formatDuration(optimizedRoute.totalDuration)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">Fuel Cost</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(optimizedRoute.totalFuelCost)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TruckIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">CO₂ Emissions</span>
                  </div>
                  <span className="font-medium">
                    {optimizedRoute.totalEmissions.toFixed(1)} kg
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Savings Breakdown */}
          {optimizedRoute && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border p-6"
            >
              <h3 className="font-semibold mb-4 text-green-800">
                🎯 Optimization Savings
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Distance Saved</span>
                  <span className="font-bold text-green-800">
                    {optimizedRoute.estimatedSavings.distance.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Time Saved</span>
                  <span className="font-bold text-green-800">
                    {optimizedRoute.estimatedSavings.time.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Cost Reduction</span>
                  <span className="font-bold text-green-800">
                    {optimizedRoute.estimatedSavings.cost.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Emission Reduction</span>
                  <span className="font-bold text-green-800">
                    {optimizedRoute.estimatedSavings.emissions.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-800">Overall Efficiency</span>
                  <span className="text-xl font-bold text-green-800">
                    {optimizedRoute.efficiency.toFixed(0)}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Waypoint List */}
          {optimizedRoute && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border p-6"
            >
              <h3 className="font-semibold mb-4">Optimized Route Order</h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {optimizedRoute.waypoints.map((waypoint, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {waypoint.address || `Location ${index + 1}`}
                      </p>
                      {waypoint.wasteType && (
                        <p className="text-xs text-gray-500">
                          {waypoint.wasteType} • {waypoint.estimatedWeight || 0}kg
                        </p>
                      )}
                    </div>
                    {waypoint.priority && (
                      <div className="flex-shrink-0">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          waypoint.priority === 1 
                            ? 'bg-red-100 text-red-800' 
                            : waypoint.priority === 2 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          Priority {waypoint.priority}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* No Route Message */}
      {!optimizedRoute && !isOptimizing && (
        <div className="text-center py-12">
          <TruckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to Optimize
          </h3>
          <p className="text-gray-500 mb-4">
            Click "Optimize Route" to generate the most efficient collection path using AI algorithms.
          </p>
          <div className="text-sm text-gray-400">
            • Machine Learning Route Planning<br />
            • Real-time Traffic Integration<br />
            • Weather-Aware Optimization<br />
            • 20% Average Cost Reduction
          </div>
        </div>
      )}
    </div>
  );
}
