'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import UnifiedWasteDetection from '@/components/UnifiedWasteDetection';
import {
  SparklesIcon,
  ChartBarIcon,
  CpuChipIcon,
  GiftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface DetectionResult {
  wasteType: string;
  confidence: number;
  quality: string;
  pointsEarned: number;
  accuracyImprovement?: number;
  recyclability?: number;
  contamination?: number;
  modelUsed?: string;
}

export default function SubmitWaste() {
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0); // Load from API
  const [submissionSaved, setSubmissionSaved] = useState(false);
  const [availableTraders, setAvailableTraders] = useState<any[]>([]);
  const [showTraders, setShowTraders] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const userEmail = 'demo@ecoearn.com'; // In production, get from auth context
  const router = useRouter();

  useEffect(() => {
    loadUserPoints();
  }, []);

  const loadUserPoints = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/points?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setTotalPoints(data.points);
      }
    } catch (error) {
      console.error('Failed to load user points:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectionComplete = (result: any) => {
    // Convert WasteAnalysisResult to DetectionResult format if needed
    const detectionResult: DetectionResult = {
      wasteType: result.primaryWasteType || result.wasteType || 'other',
      confidence: result.confidence || 0.5,
      quality: result.confidence > 0.8 ? 'excellent' : result.confidence > 0.6 ? 'good' : 'fair',
      pointsEarned: result.points || result.pointsEarned || 3
    };
    
    setDetectionResult(detectionResult);
    // Points are automatically saved by the UnifiedWasteDetection component
    // So we need to reload the user's current points
    loadUserPoints();
    setSubmissionSaved(false);
  };

  const handleSaveSubmission = async () => {
    if (!detectionResult) return;

    setIsSubmitting(true);

    try {
      // Save to database (simplified for demo)
      console.log('Saving submission:', {
        wasteType: detectionResult.wasteType,
        quality: detectionResult.quality,
        confidence: detectionResult.confidence,
        pointsEarned: detectionResult.pointsEarned,
        description,
        modelUsed: detectionResult.modelUsed,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmissionSaved(true);
      
      // After saving, show available traders
      getUserLocationAndShowTraders();

    } catch (error) {
      console.error('Error saving submission:', error);
      alert('Failed to save submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserLocationAndShowTraders = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          await fetchAvailableTraders(location);
          setShowTraders(true);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Use default location (Manhattan)
          const defaultLocation = { lat: 40.7589, lng: -73.9851 };
          setUserLocation(defaultLocation);
          fetchAvailableTraders(defaultLocation);
          setShowTraders(true);
        }
      );
    } else {
      // Fallback location
      const defaultLocation = { lat: 40.7589, lng: -73.9851 };
      setUserLocation(defaultLocation);
      fetchAvailableTraders(defaultLocation);
      setShowTraders(true);
    }
  };

  const fetchAvailableTraders = async (location: {lat: number, lng: number}) => {
    try {
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
    // Prepare data for route optimization
    const routeData = {
      submissionIds: ['submission-id'],
      locations: [{
        lat: userLocation!.lat,
        lng: userLocation!.lng,
        address: 'User Location',
        wasteType: detectionResult!.wasteType
      }],
      selectedTrader: trader,
      userLocation: userLocation,
      analysisResult: detectionResult
    };
    
    // Navigate to route optimization with data
    const params = new URLSearchParams({
      data: JSON.stringify(routeData)
    });
    
    router.push(`/routing?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AI-Powered Waste Detection
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your waste image for enhanced AI analysis with 35% improved accuracy
          </p>

          {/* Points Display */}
          <div className="mt-6 inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-lg">
            <GiftIcon className="h-6 w-6 text-green-500" />
            <span className="text-lg font-semibold text-gray-700">Your Points:</span>
            <span className="text-2xl font-bold text-green-600">
              {loading ? 'Loading...' : totalPoints.toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <SparklesIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">35%</p>
            <p className="text-sm text-gray-600">Accuracy Improvement</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <CpuChipIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">4</p>
            <p className="text-sm text-gray-600">AI Models Combined</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <ChartBarIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">Real-time</p>
            <p className="text-sm text-gray-600">Processing Speed</p>
          </div>
        </motion.div>

        {/* Main Detection Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <UnifiedWasteDetection
            onDetectionComplete={handleDetectionComplete}
            userEmail="demo@ecoearn.com"
          />

          {/* Additional Information */}
          {detectionResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              {/* Description Input */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Add any additional details about the waste..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleSaveSubmission}
                  disabled={isSubmitting || submissionSaved}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : submissionSaved ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <span>Save Submission</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => window.location.href = '/rewards'}
                  className="flex-1 py-3 px-6 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  View Rewards
                </button>
              </div>
            </motion.div>
          )}

          {/* Trader Selection - Shows after submission is saved */}
          {showTraders && availableTraders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
            >
              <h3 className="text-xl font-bold text-blue-800 mb-4 text-center">
                🚛 Ready for Pickup? Select a Collector
              </h3>
              <p className="text-blue-600 text-center mb-6">
                Your waste has been saved! Now choose a nearby collector for pickup.
              </p>
              
              <div className="space-y-4">
                {availableTraders.map((trader) => (
                  <div 
                    key={trader._id} 
                    className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
                    onClick={() => selectTrader(trader)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">{trader.name}</h4>
                        <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            📍 <span className="ml-1 font-medium">{trader.distance} km away</span>
                          </span>
                          <span className="flex items-center">
                            ⭐ <span className="ml-1 font-medium">{trader.rating}</span>
                          </span>
                          <span className="flex items-center">
                            🕒 <span className="ml-1 font-medium">{trader.estimatedArrival}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                          Select & View Route
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-blue-500 text-center mt-4">
                💡 Click on a collector to see the optimized pickup route
              </p>
            </motion.div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
