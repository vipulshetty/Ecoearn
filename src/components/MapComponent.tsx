'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShortestPathResult } from '@/services/ospfRouting';

// Fix for default markers in react-leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface MapComponentProps {
  traderLocation: {
    lat: number;
    lng: number;
    name: string;
  };
  userLocation: {
    lat: number;
    lng: number;
  };
  route: ShortestPathResult | null;
  routeCoordinates: [number, number][];
  onMapReady: () => void;
}

export default function MapComponent({
  traderLocation,
  userLocation,
  route,
  routeCoordinates,
  onMapReady
}: MapComponentProps) {
  return (
    <MapContainer
      center={[
        (traderLocation.lat + userLocation.lat) / 2,
        (traderLocation.lng + userLocation.lng) / 2
      ]}
      zoom={13}
      className="h-full w-full"
      whenReady={onMapReady}
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
      {route && routeCoordinates.length > 1 && (
        <>
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
            smoothFactor={2}
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
      )}
      
      {/* Show key waypoints as numbered markers */}
      {route && routeCoordinates.length > 2 && routeCoordinates.map((coord, index) => {
        // Skip start and end markers as they're already shown
        if (index === 0 || index === routeCoordinates.length - 1) return null;
        
        // Show only every 8th point to avoid cluttering
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
      })}
    </MapContainer>
  );
}