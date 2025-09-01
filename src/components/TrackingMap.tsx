'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import { TrackingService } from '@/services/trackingService';

// Dynamic imports to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Import Leaflet CSS only on client-side
if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css');
}

interface TrackingMapProps {
  submissionId: string;
  initialUserLocation: [number, number];
  initialTraderLocation: [number, number];
}

export default function TrackingMap({
  submissionId,
  initialUserLocation,
  initialTraderLocation
}: TrackingMapProps) {
  const [traderLocation, setTraderLocation] = useState<[number, number]>(initialTraderLocation);
  const [trackingService] = useState(() => new TrackingService());

  useEffect(() => {
    trackingService.startTracking(submissionId, (data) => {
      setTraderLocation([data.location.lat, data.location.lng]);
    });

    return () => {
      trackingService.stopTracking();
    };
  }, [submissionId, trackingService]);

  // Custom markers - only create on client-side
  const userIcon = typeof window !== 'undefined' ? new L.Icon({
    iconUrl: '/markers/user-marker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }) : null;

  const traderIcon = typeof window !== 'undefined' ? new L.Icon({
    iconUrl: '/markers/trader-marker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }) : null;

  if (typeof window === 'undefined') {
    return (
      <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={initialUserLocation}
      zoom={13}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User Location Marker */}
      <Marker position={initialUserLocation} icon={userIcon || undefined}>
        <Popup>Your Location</Popup>
      </Marker>

      {/* Trader Location Marker */}
      <Marker position={traderLocation} icon={traderIcon || undefined}>
        <Popup>Trader Location</Popup>
      </Marker>
    </MapContainer>
  );
}
