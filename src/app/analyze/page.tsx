'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as tf from '@tensorflow/tfjs';
import Image from 'next/image';
import WasteClassifier from '@/components/WasteClassifier';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CircleNotch } from 'phosphor-react';

export default function AnalyzePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [clientAnalysis, setClientAnalysis] = useState<any>(null);
  const [availableTraders, setAvailableTraders] = useState<any[]>([]);
  const [selectedTrader, setSelectedTrader] = useState<any>(null);
  const [showTraders, setShowTraders] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Reset all states to ensure fresh analysis
    setError(null);
    setResult(null);
    setClientAnalysis(null);
    
    if (!event.target.files || event.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }

    const file = event.target.files[0];
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    // Set the new file which will trigger a new preview and analysis
    setSelectedFile(file);
    
    // If there was a previous preview URL, revoke it to prevent memory leaks
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  const handleClientClassification = (wasteResult: any) => {
    console.log("Client-side classification:", wasteResult);
    setClientAnalysis(wasteResult);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Create form data with the image
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      // Add client-side analysis results if available
      if (clientAnalysis) {
        formData.append('clientAnalysis', JSON.stringify(clientAnalysis));
      }
      
      // Call server for processing and points
      const response = await fetch('/api/analyze-waste', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze waste');
      }
      
      const data = await response.json();
      setResult(data);
      
      // Get user location and show available traders
      getUserLocationAndShowTraders(data);
      
    } catch (error) {
      console.error('Error analyzing waste:', error);
      setError('Failed to analyze waste. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocationAndShowTraders = (analysisResult: any) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          await fetchAvailableTraders(location, analysisResult);
          setShowTraders(true);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Use default location (Manhattan)
          const defaultLocation = { lat: 40.7589, lng: -73.9851 };
          setUserLocation(defaultLocation);
          fetchAvailableTraders(defaultLocation, analysisResult);
          setShowTraders(true);
        }
      );
    } else {
      // Fallback location
      const defaultLocation = { lat: 40.7589, lng: -73.9851 };
      setUserLocation(defaultLocation);
      fetchAvailableTraders(defaultLocation, analysisResult);
      setShowTraders(true);
    }
  };

  const fetchAvailableTraders = async (location: {lat: number, lng: number}, analysisResult: any) => {
    try {
      // Use existing trader assignment service
      const traders = [
        {
          _id: 'trader1',
          name: 'EcoCollector Pro',
          distance: 2.3,
          rating: 4.8,
          estimatedArrival: '15-20 mins',
          location: { lat: location.lat + 0.01, lng: location.lng + 0.01 }
        },
        {
          _id: 'trader2', 
          name: 'Green Pickup Service',
          distance: 3.1,
          rating: 4.6,
          estimatedArrival: '20-25 mins',
          location: { lat: location.lat + 0.02, lng: location.lng + 0.02 }
        },
        {
          _id: 'trader3',
          name: 'Waste Warriors',
          distance: 4.5,
          rating: 4.9,
          estimatedArrival: '25-30 mins', 
          location: { lat: location.lat - 0.01, lng: location.lng + 0.01 }
        }
      ];
      
      setAvailableTraders(traders);
    } catch (error) {
      console.error('Error fetching traders:', error);
    }
  };

  const selectTrader = async (trader: any) => {
    setSelectedTrader(trader);
    
    // Prepare data for route optimization
    const routeData = {
      submissionIds: [result.submissionId || 'temp-id'],
      locations: [{
        lat: userLocation!.lat,
        lng: userLocation!.lng,
        address: 'User Location',
        wasteType: result.wasteType
      }],
      selectedTrader: trader,
      userLocation: userLocation,
      analysisResult: result
    };
    
    // Navigate to route optimization with data
    const params = new URLSearchParams({
      data: JSON.stringify(routeData)
    });
    
    router.push(`/routing?${params.toString()}`);
  };

  return (
    <div className="container mx-auto py-8 px-4 pt-24">
      <h1 className="text-3xl font-bold mb-8 text-center">Analyze Waste</h1>
      
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Upload an image of waste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="picture">Picture</Label>
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
              
              {preview && (
                <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
              
              {selectedFile && !loading && !result && (
                <WasteClassifier
                  imageUrl={preview || ''}
                  onClassified={handleClientClassification}
                />
              )}
              
              {result && (
                <div className="mt-4 p-4 bg-green-50 rounded-md">
                  <h3 className="font-medium text-green-800">Analysis Result:</h3>
                  <p><span className="font-medium">Type:</span> {result.wasteType}</p>
                  <p><span className="font-medium">Details:</span> {result.detailedType}</p>
                  <p><span className="font-medium">Quality:</span> {result.quality}</p>
                  <p><span className="font-medium">Confidence:</span> {Math.round(result.confidence * 100)}%</p>
                  <p className="font-medium text-green-700 text-lg mt-2">
                    Points earned: +{result.pointsEarned}
                  </p>
                </div>
              )}
              
              {showTraders && availableTraders.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <h3 className="font-medium text-blue-800 mb-4">📍 Available Traders Near You</h3>
                  <div className="space-y-3">
                    {availableTraders.map((trader) => (
                      <div 
                        key={trader._id} 
                        className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => selectTrader(trader)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{trader.name}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span>📍 {trader.distance} km away</span>
                              <span>⭐ {trader.rating}</span>
                              <span>🕒 {trader.estimatedArrival}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-blue-600">Select</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    💡 Click on a trader to view the optimized route to your location
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Waste'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}