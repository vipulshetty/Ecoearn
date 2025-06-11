'use client';

import { useState } from 'react';
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
  const [totalPoints, setTotalPoints] = useState(2500); // Demo points
  const [submissionSaved, setSubmissionSaved] = useState(false);

  const handleDetectionComplete = (result: DetectionResult) => {
    setDetectionResult(result);
    setTotalPoints(prev => prev + result.pointsEarned);
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
      alert('Waste submission saved successfully!');

    } catch (error) {
      console.error('Error saving submission:', error);
      alert('Failed to save submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            <span className="text-2xl font-bold text-green-600">{totalPoints.toLocaleString()}</span>
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
        </motion.div>

      </div>
    </div>
  );
}
