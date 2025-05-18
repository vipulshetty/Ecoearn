'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import WasteClassifier from '@/components/WasteClassifier';

export default function SubmitWaste() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [clientAnalysis, setClientAnalysis] = useState<any>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle client-side YOLOv5 analysis results
  const handleClientClassification = (result: any) => {
    console.log('Client-side YOLOv5 analysis:', result);
    setClientAnalysis(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if image is selected
    if (!selectedImage) {
      setError('Please select an image to analyze');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('userId', 'anonymous-user');
      formData.append('image', selectedImage);
      formData.append('description', description);
      
      // Include client-side YOLOv5 analysis if available
      if (clientAnalysis) {
        console.log('Including YOLOv5 client analysis in request');
        const analysisData = {
          wasteType: clientAnalysis.wasteType,
          label: clientAnalysis.label,
          confidence: clientAnalysis.confidence,
          quality: clientAnalysis.quality,
          modelUsed: 'yolov5'
        };
        formData.append('clientAnalysis', JSON.stringify(analysisData));
      }

      const response = await fetch('/api/analyze-waste', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Submission failed (${response.status})`);
      }
      
      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data);
        // Reset form on success
        setSelectedImage(null);
        setPreview(null);
        setDescription('');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Error analyzing waste:', err);
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Submit Your Waste</h1>
            <p className="mt-2 text-gray-600">
              Take a clear photo of your recyclable waste to earn points
            </p>
          </div>

          <div className="space-y-8">
            <form onSubmit={handleSubmit}>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
                {preview ? (
                  <div className="space-y-4">
                    <div className="relative h-64 w-full">
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-contain rounded-xl"
                      />
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setPreview(null);
                          setClientAnalysis(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Add YOLOv5 waste classifier component */}
                    <div className="mt-4">
                      <WasteClassifier 
                        imageUrl={preview} 
                        onClassified={handleClientClassification} 
                      />
                      
                      {/* Loading overlay for better visual transition */}
                      {!clientAnalysis && preview && (
                        <div className="flex flex-col items-center justify-center mt-4 p-6 bg-muted/20 rounded-lg border border-border/50 animate-pulse transition-all duration-500">
                          <div className="flex space-x-2 mb-3">
                            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <p className="text-sm text-muted-foreground">Analyzing your waste image...</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Describe the waste items you're submitting..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {isSubmitting ? 'Analyzing...' : 'Analyze Waste'}
              </motion.button>
              {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}

              {/* Analysis Results */}
              {analysisResult && (
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Analysis Results</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Waste Type:</span>
                      <span className="font-medium text-gray-800">{analysisResult.wasteType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Quality:</span>
                      <span className="font-medium text-gray-800">
                        {analysisResult.quality.charAt(0).toUpperCase() + analysisResult.quality.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-medium text-gray-800">
                        {Math.round(analysisResult.confidence * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Points Earned:</span>
                      <span className="font-medium text-green-600">
                        {analysisResult.pointsEarned} points
                      </span>
                    </div>
                    {analysisResult.detailedType && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Detailed Type:</span>
                        <span className="font-medium text-gray-800">
                          {analysisResult.detailedType}
                        </span>
                      </div>
                    )}
                    {analysisResult.isAuthenticated === false && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-yellow-600">
                          Note: You're not signed in. Sign in to save your points!
                        </p>
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Analyzed using YOLOv5 waste detection model with TACO dataset
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
