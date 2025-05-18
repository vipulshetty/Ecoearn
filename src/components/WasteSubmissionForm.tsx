'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';

export default function WasteSubmissionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);



  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear previous states
    setError(null);
    setSuccess(null);
    setAnalysisResult(null);
    
    const file = e.target.files?.[0];
    if (file) {
      // If there was a previous preview URL, revoke it to prevent memory leaks
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      setError('Please select an image to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    // Add a default user ID or anonymous identifier
    formData.append('userId', 'anonymous-user');

    // Add location if available
    if (location) {
      formData.append('location', JSON.stringify({
        type: 'Point',
        coordinates: location
      }));
    }

    try {
      const response = await axios.post('/api/analyze-waste', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // Increase timeout to 30 seconds for image processing
      });

      if (response.data.success) {
        setAnalysisResult(response.data);
        setSuccess(`Waste analyzed successfully! Type: ${response.data.analysis.wasteType} (${Math.round(response.data.analysis.confidence * 100)}% confidence), Quality: ${response.data.analysis.quality}, Points earned: ${response.data.analysis.pointsEarned}`);
        
        // Clear the form
        setSelectedImage(null);
        setPreviewUrl(null);
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }
    } catch (err: any) {
      console.error('Error analyzing waste:', err);
      let errorMessage = 'Failed to analyze waste';
      
      if (err.response) {
        // Server responded with an error
        errorMessage = err.response.data?.message || err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        // Error in setting up the request
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      
      // Don't clear the form on error so user can retry
      // setSelectedImage(null);
      // setPreviewUrl(null);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-700">
            Upload Waste Image
          </label>
          
          {/* Image Upload Area */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              {previewUrl ? (
                <div className="relative w-full h-64">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    Click or drag and drop to upload a waste image
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedImage || isLoading}
            className={`w-full py-3 px-4 rounded-md text-white font-medium ${
              !selectedImage || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } transition-colors`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                <span>Analyzing Waste...</span>
              </div>
            ) : (
              'Analyze Waste'
            )}
          </button>
        </div>
      </form>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg transform transition-all duration-300 ease-in-out">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Analysis Results
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Waste Type:</span>
              <span className="font-medium text-gray-800">
                {analysisResult.analysis.detailedType}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Original Prediction:</span>
              <span className="font-medium text-gray-800">
                {analysisResult.analysis.originalPrediction.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Quality:</span>
              <span className="font-medium text-gray-800">
                {analysisResult.analysis.quality.charAt(0).toUpperCase() + 
                 analysisResult.analysis.quality.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Confidence:</span>
              <span className="font-medium text-gray-800">
                {Math.round(analysisResult.analysis.confidence * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Points Earned:</span>
              <span className="font-medium text-green-600">
                {analysisResult.analysis.pointsEarned} points
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg transform transition-all duration-300 ease-in-out">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg transform transition-all duration-300 ease-in-out">
          {success}
        </div>
      )}
    </div>
  );
}
