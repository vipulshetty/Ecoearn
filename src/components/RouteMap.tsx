'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';

// Dynamic imports to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });

// Import Leaflet CSS and configure markers only on client-side
if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css');
  
  // Fix for default markers in react-leaflet
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface Location {
  lat: number;
  lng: number;
  address?: string;
  wasteType?: string;
  priority?: number;
  estimatedWeight?: number;
}

interface RouteMapProps {
  startLocation: Location;
  pickupLocations: Location[];
  optimizedRoute: Location[];
  isOptimized: boolean;
  routeCoordinates?: [number, number][]; // Real road-based route coordinates
}

export default function RouteMap({
  startLocation,
  pickupLocations,
  optimizedRoute,
  isOptimized,
  routeCoordinates
}: RouteMapProps) {
  
  // Create custom icons
  const startIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path fill="#10B981" stroke="#065F46" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
        <circle fill="white" cx="12.5" cy="12.5" r="6"/>
        <text x="12.5" y="17" text-anchor="middle" fill="#065F46" font-size="8" font-weight="bold">S</text>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const pickupIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EF4444" stroke="#991B1B" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
        <circle fill="white" cx="12.5" cy="12.5" r="6"/>
        <text x="12.5" y="17" text-anchor="middle" fill="#991B1B" font-size="8" font-weight="bold">P</text>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const optimizedIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path fill="#8B5CF6" stroke="#5B21B6" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
        <circle fill="white" cx="12.5" cy="12.5" r="6"/>
        <text x="12.5" y="17" text-anchor="middle" fill="#5B21B6" font-size="8" font-weight="bold">O</text>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // Calculate map center and bounds
  const allLocations = [startLocation, ...pickupLocations];
  const center: [number, number] = [
    allLocations.reduce((sum, loc) => sum + loc.lat, 0) / allLocations.length,
    allLocations.reduce((sum, loc) => sum + loc.lng, 0) / allLocations.length
  ];

  // Create route polyline coordinates - use real route coordinates if available
  console.log(`🗺️ RouteMap received routeCoordinates:`, !!routeCoordinates, routeCoordinates?.length || 0);
  console.log(`🗺️ RouteMap isOptimized:`, isOptimized, 'optimizedRoute length:', optimizedRoute.length);

  const polylineCoordinates: [number, number][] = isOptimized && routeCoordinates && routeCoordinates.length > 0
    ? routeCoordinates // Use real road-based coordinates
    : isOptimized && optimizedRoute.length > 0
    ? optimizedRoute.map(loc => [loc.lat, loc.lng]) // Fallback to straight lines
    : [];

  console.log(`🗺️ RouteMap final polylineCoordinates:`, polylineCoordinates.length, 'coordinates');
  console.log(`🗺️ Using real route data:`, isOptimized && routeCoordinates && routeCoordinates.length > 0);

  const getWasteTypeColor = (wasteType?: string): string => {
    const colors: Record<string, string> = {
      plastic: '#3B82F6',
      paper: '#10B981',
      metal: '#F59E0B',
      glass: '#8B5CF6',
      electronics: '#EF4444',
      organic: '#84CC16'
    };
    return colors[wasteType || 'plastic'] || '#6B7280';
  };

  const getPriorityColor = (priority?: number): string => {
    if (priority === 1) return '#EF4444'; // High priority - red
    if (priority === 2) return '#F59E0B'; // Medium priority - orange
    return '#10B981'; // Low priority - green
  };

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Start Location */}
      <Marker position={[startLocation.lat, startLocation.lng]} icon={startIcon}>
        <Popup>
          <div className="p-2">
            <h3 className="font-semibold text-green-800">🏠 Start Location</h3>
            <p className="text-sm text-gray-600">
              {startLocation.address || 'Collection Center'}
            </p>
          </div>
        </Popup>
      </Marker>

      {/* Pickup Locations (Original) */}
      {!isOptimized && pickupLocations.map((location, index) => (
        <Marker
          key={`pickup-${index}`}
          position={[location.lat, location.lng]}
          icon={pickupIcon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-red-800">
                📍 Pickup Location {index + 1}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {location.address || `Location ${index + 1}`}
              </p>
              {location.wasteType && (
                <div className="flex items-center space-x-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getWasteTypeColor(location.wasteType) }}
                  />
                  <span className="text-sm capitalize">{location.wasteType}</span>
                </div>
              )}
              {location.estimatedWeight && (
                <p className="text-xs text-gray-500">
                  Estimated: {location.estimatedWeight}kg
                </p>
              )}
              {location.priority && (
                <div className="mt-1">
                  <span 
                    className="px-2 py-1 text-xs rounded-full text-white"
                    style={{ backgroundColor: getPriorityColor(location.priority) }}
                  >
                    Priority {location.priority}
                  </span>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Optimized Route Locations */}
      {isOptimized && optimizedRoute.slice(1).map((location, index) => (
        <Marker
          key={`optimized-${index}`}
          position={[location.lat, location.lng]}
          icon={optimizedIcon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-purple-800">
                🎯 Stop {index + 1}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {location.address || `Optimized Stop ${index + 1}`}
              </p>
              {location.wasteType && (
                <div className="flex items-center space-x-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getWasteTypeColor(location.wasteType) }}
                  />
                  <span className="text-sm capitalize">{location.wasteType}</span>
                </div>
              )}
              {location.estimatedWeight && (
                <p className="text-xs text-gray-500">
                  Estimated: {location.estimatedWeight}kg
                </p>
              )}
              <div className="mt-2 p-2 bg-purple-50 rounded">
                <p className="text-xs text-purple-700 font-medium">
                  ✨ AI Optimized Order
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Optimized Route Polyline - Real Road-Based Route */}
      {isOptimized && polylineCoordinates.length > 1 && (
        <>
          <Polyline
            positions={polylineCoordinates}
            color="#8B5CF6"
            weight={4}
            opacity={0.8}
            dashArray={routeCoordinates && routeCoordinates.length > 0 ? "none" : "10, 5"}
          />
          {/* Add a label to indicate if it's real road data */}
          {routeCoordinates && routeCoordinates.length > 0 && (
            <div className="absolute top-4 right-4 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium z-[1000]">
              🛣️ Real Road Route
            </div>
          )}
        </>
      )}

      {/* Original Route Polyline (for comparison) */}
      {!isOptimized && pickupLocations.length > 0 && (
        <Polyline
          positions={[
            [startLocation.lat, startLocation.lng],
            ...pickupLocations.map(loc => [loc.lat, loc.lng] as [number, number])
          ]}
          color="#EF4444"
          weight={3}
          opacity={0.5}
          dashArray="5, 5"
        />
      )}
    </MapContainer>
  );
}
