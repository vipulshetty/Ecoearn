'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TrackingService } from '@/services/trackingService';

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

  // Custom markers
  const userIcon = new L.Icon({
    iconUrl: '/markers/user-marker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const traderIcon = new L.Icon({
    iconUrl: '/markers/trader-marker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

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
      <Marker position={initialUserLocation} icon={userIcon}>
        <Popup>Your Location</Popup>
      </Marker>

      {/* Trader Location Marker */}
      <Marker position={traderLocation} icon={traderIcon}>
        <Popup>Trader Location</Popup>
      </Marker>
    </MapContainer>
  );
}
