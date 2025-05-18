'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import dbConnect from '@/lib/mongodb';
import WasteSubmission from '@/models/WasteSubmission';

// Import TrackingMap dynamically to avoid SSR issues with Leaflet
const TrackingMap = dynamic(() => import('@/components/TrackingMap'), {
  ssr: false
});

interface TrackingData {
  submission: {
    id: string;
    status: string;
    userLocation: [number, number];
    traderLocation: [number, number];
    traderName: string;
    estimatedArrival: string;
  };
}

export default function TrackingPage() {
  const params = useParams();
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        const response = await fetch(`/api/tracking/${params.submissionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tracking data');
        }
        const data = await response.json();
        setTrackingData(data);
      } catch (err) {
        setError('Failed to load tracking information');
      } finally {
        setLoading(false);
      }
    };

    if (params.submissionId) {
      fetchTrackingData();
    }
  }, [params.submissionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error || 'Something went wrong'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Track Your Waste Collection</h1>
        
        <div className="mb-6">
          <p className="text-lg">
            Status: <span className="font-semibold">{trackingData.submission.status}</span>
          </p>
          <p className="text-lg">
            Trader: <span className="font-semibold">{trackingData.submission.traderName}</span>
          </p>
          <p className="text-lg">
            Estimated Arrival: <span className="font-semibold">{trackingData.submission.estimatedArrival}</span>
          </p>
        </div>

        <div className="h-[400px] rounded-lg overflow-hidden">
          <TrackingMap
            submissionId={trackingData.submission.id}
            initialUserLocation={trackingData.submission.userLocation}
            initialTraderLocation={trackingData.submission.traderLocation}
          />
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Collection Instructions</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Please ensure the waste is properly segregated and packaged</li>
            <li>Keep the waste ready for collection</li>
            <li>The trader will verify the waste type and quantity upon arrival</li>
            <li>Points will be credited to your account after verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
