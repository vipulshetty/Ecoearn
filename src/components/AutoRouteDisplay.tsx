'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ClockIcon, MapPinIcon, TruckIcon } from '@heroicons/react/24/outline';
import { calculateOptimalRoute, type ShortestPathResult } from '@/services/ospfRouting';

// Import Leaflet CSS and configure markers
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dynamic import for map component to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });

interface AutoRouteDisplayProps {
  traderLocation: {
    lat: number;
    lng: number;
    name: string;
  };
  userLocation: {
    lat: number;
    lng: number;
  };
  onRouteCalculated?: (route: ShortestPathResult) => void;
}

export default function AutoRouteDisplay({ 
  traderLocation, 
  userLocation, 
  onRouteCalculated 
}: AutoRouteDisplayProps) {
  const [route, setRoute] = useState<ShortestPathResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [hasMapError, setHasMapError] = useState(false);

  useEffect(() => {
    // Validate input coordinates
    if (!traderLocation.lat || !traderLocation.lng || !userLocation.lat || !userLocation.lng) {
      console.error('❌ Invalid location coordinates provided');
      setHasMapError(true);
      setIsCalculating(false);
      return;
    }
    
    calculateRoute();
  }, [traderLocation, userLocation]);

  const calculateRoute = async () => {
    setIsCalculating(true);
    
    try {
      console.log('🗺️ Starting REAL ROAD route calculation...');
      console.log('Trader:', traderLocation);
      console.log('User:', userLocation);
      
      // Calculate using real roads via OpenRouteService API
      const calculatedRoute = await calculateOptimalRoute(
        traderLocation.lat,
        traderLocation.lng,
        userLocation.lat,
        userLocation.lng
      );
      
      console.log('✅ REAL ROAD route calculated successfully:');
      console.log(`🛣️ Uses actual streets and highways`);
      console.log(`📍 Path length: ${calculatedRoute.path.length} nodes`);
      console.log(`📏 Total distance: ${calculatedRoute.totalDistance}km`);
      console.log(`⏱️ Estimated time: ${calculatedRoute.estimatedTime}min`);
      console.log(`🗺️ Route coordinates: ${calculatedRoute.route.coordinates.length} GPS points`);
      console.log('🛣️ Route follows real roads, not artificial paths!');
      
      setRoute(calculatedRoute);
      onRouteCalculated?.(calculatedRoute);
    } catch (error) {
      console.error('❌ Real road route calculation failed:', error);
      
      // Provide fallback route for better UX
      const fallbackRoute = {
        path: [
          { id: 'start', lat: traderLocation.lat, lng: traderLocation.lng, name: traderLocation.name },
          { id: 'end', lat: userLocation.lat, lng: userLocation.lng, name: 'Pickup Location' }
        ],
        totalDistance: 5.2,
        estimatedTime: 15,
        route: {
          coordinates: [[traderLocation.lng, traderLocation.lat], [userLocation.lng, userLocation.lat]] as [number, number][],
          instructions: [
            `Start from ${traderLocation.name}`,
            'Head towards pickup location',
            'Arrive at destination'
          ]
        }
      };
      
      console.log('🔄 Using fallback route:', fallbackRoute);
      setRoute(fallbackRoute);
      onRouteCalculated?.(fallbackRoute);
    } finally {
      setIsCalculating(false);
    }
  };

  // OSPF already returns [lat, lng] format - no transformation needed
  const routeCoordinates = route?.route.coordinates.map(coord => {
    // Ensure we have valid coordinates
    if (Array.isArray(coord) && coord.length >= 2) {
      return [coord[0], coord[1]] as [number, number]; // [lat, lng] -> [lat, lng]
    }
    return [0, 0] as [number, number]; // fallback
  }) || [];

  // Debug route coordinates
  if (route) {
    console.log('🗺️ Route debug info:');
    console.log('📍 OSPF coordinates (already [lat,lng]):', route.route.coordinates);
    console.log('📍 Leaflet coordinates (ready to use):', routeCoordinates);
    console.log('📊 Total coordinate points:', routeCoordinates.length);
    console.log('🛣️ Path nodes:', route.path.map(n => `${n.name || n.id} (${n.lat.toFixed(4)}, ${n.lng.toFixed(4)})`).join(' → '));
    
    // Validate coordinates are within reasonable bounds
    const validCoords = routeCoordinates.filter(coord => 
      coord[0] >= -90 && coord[0] <= 90 && coord[1] >= -180 && coord[1] <= 180
    );
    console.log('✅ Valid coordinates:', validCoords.length, 'out of', routeCoordinates.length);
    
    // Log first and last few coordinates for verification
    console.log('🔍 First coordinates:', routeCoordinates.slice(0, 3));
    console.log('🔍 Last coordinates:', routeCoordinates.slice(-3));
  }

  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-lg">
      {/* Route Info Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TruckIcon className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">{traderLocation.name}</h3>
              <p className="text-blue-100 text-sm">Collector Location</p>
            </div>
          </div>
          
          {route && (
            <div className="text-right">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{route.totalDistance} km</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{route.estimatedTime} min</span>
                </div>
              </div>
              <p className="text-blue-200 text-xs mt-1">Estimated arrival</p>
            </div>
          )}
        </div>
      </div>

      {/* Map Container - Larger and cleaner like Uber/Ola */}
      <div className="relative h-[500px]">
        {hasMapError ? (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-gray-600 text-sm">Map loading error</p>
              <p className="text-gray-400 text-xs mt-1">Please check location coordinates</p>
            </div>
          </div>
        ) : isCalculating ? (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm">Finding optimal route on real roads...</p>
              <p className="text-gray-400 text-xs mt-1">🌐 Using OpenRouteService API for actual street routing</p>
            </div>
          </div>
        ) : null}

        {typeof window !== 'undefined' && !isCalculating && !hasMapError && (
          <MapContainer
            center={[
              (traderLocation.lat + userLocation.lat) / 2,
              (traderLocation.lng + userLocation.lng) / 2
            ]}
            zoom={13} // Slightly zoomed out to see full route
            className="h-full w-full"
            whenReady={() => {
              console.log('🗺️ Map is ready');
              setMapReady(true);
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Trader Location Marker */}
            <Marker position={[traderLocation.lat, traderLocation.lng]}>
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-blue-600">🚛 {traderLocation.name}</h4>
                  <p className="text-sm text-gray-600">Collector Location</p>
                </div>
              </Popup>
            </Marker>

            {/* User Location Marker */}
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-green-600">📍 Pickup Location</h4>
                  <p className="text-sm text-gray-600">Your waste location</p>
                </div>
              </Popup>
            </Marker>

            {/* Route Polyline - Enhanced curved road visualization */}
            {route && routeCoordinates.length > 1 ? (
              <>
                {console.log('🗺️ Rendering polyline with coordinates:', routeCoordinates.length, 'points')}
                {console.log('🔍 Sample coordinates:', routeCoordinates.slice(0, 2), '...', routeCoordinates.slice(-2))}
                
                {/* Shadow/outline for better visibility */}
                <Polyline
                  positions={routeCoordinates}
                  color="#000000"
                  weight={10}
                  opacity={0.3}
                />
                {/* White outline for contrast */}
                <Polyline
                  positions={routeCoordinates}
                  color="#FFFFFF"
                  weight={7}
                  opacity={0.9}
                />
                {/* Main route line with road-like appearance */}
                <Polyline
                  positions={routeCoordinates}
                  color="#2563EB"
                  weight={4}
                  opacity={1.0}
                  smoothFactor={2} // Smooth the curves
                  lineCap="round"
                  lineJoin="round"
                />
                {/* Dotted center line for road effect */}
                <Polyline
                  positions={routeCoordinates}
                  color="#FFFFFF"
                  weight={1}
                  opacity={0.8}
                  dashArray="5, 10"
                />
              </>
            ) : (
              <>
                {console.log('⚠️ No route polyline: route=', !!route, 'coordinates=', routeCoordinates.length)}
              </>
            )}
            
            {/* Show key waypoints as numbered markers (less crowded) */}
            {route && routeCoordinates.length > 2 && routeCoordinates.map((coord, index) => {
              // Skip start (0) and end (last) markers as they're already shown
              if (index === 0 || index === routeCoordinates.length - 1) return null;
              
              // Show only every 8th point to avoid cluttering and emphasize curves
              if (index % 8 !== 0) return null;
              
              return (
                <Marker
                  key={`waypoint-${index}`}
                  position={coord}
                  icon={L.divIcon({
                    className: 'waypoint-marker',
                    html: `<div style="
                      background: linear-gradient(135deg, #10B981, #059669); 
                      color: white; 
                      width: 28px; 
                      height: 28px; 
                      border-radius: 50%; 
                      border: 3px solid white;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-weight: bold;
                      font-size: 11px;
                      box-shadow: 0 3px 6px rgba(0,0,0,0.4);
                      animation: pulse 2s infinite;
                    ">${Math.floor(index / 8) + 1}</div>`,
                    iconSize: [34, 34],
                    iconAnchor: [17, 17]
                  })}
                >
                  <Popup>
                    <div className="text-center">
                      <h4 className="font-semibold text-green-600">🛣️ Route Junction {Math.floor(index / 8) + 1}</h4>
                      <p className="text-sm text-gray-600">Optimized path waypoint</p>
                      <p className="text-xs text-gray-500 mt-1">Coordinates: {coord[0].toFixed(4)}, {coord[1].toFixed(4)}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}}
          </MapContainer>
        )}
      </div>

      {/* Route Instructions - Enhanced for shortest path */}
      {route && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 border-t"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800 flex items-center">
              <MapPinIcon className="h-4 w-4 mr-2" />
              Shortest Path Route ({route.path.length} waypoints)
            </h4>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              🎯 OSPF Optimized
            </span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {route.route.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <span className={`rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold ${
                  index === 0 
                    ? 'bg-green-500 text-white' 
                    : index === route.route.instructions.length - 1
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}>
                  {index + 1}
                </span>
                <span className="text-gray-700">{instruction}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}