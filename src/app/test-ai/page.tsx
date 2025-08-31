'use client';

import { useState, useEffect } from 'react';

export default function TestAIPage() {
  const [modelStatus, setModelStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simple test without complex dependencies
    console.log('🔍 Test page loaded');
    
    // Auto-initialize the model after a short delay
    const timer = setTimeout(async () => {
      try {
        console.log('🚀 Auto-initializing YOLOv5 model...');
        
        // First, test if TensorFlow.js loads
        console.log('📦 Testing TensorFlow.js import...');
        const tf = await import('@tensorflow/tfjs');
        console.log('✅ TensorFlow.js imported successfully');
        console.log('🔧 Available backends:', tf.getBackend());
        
        // Test backend initialization
        console.log('🔄 Testing backend initialization...');
        try {
          await tf.setBackend('webgl');
          console.log('✅ WebGL backend set successfully');
        } catch (backendError) {
          console.warn('⚠️ WebGL failed, trying CPU...');
          await tf.setBackend('cpu');
          console.log('✅ CPU backend set successfully');
        }
        
        const { getModelStatus } = await import('@/lib/imageAnalysis');
        
        // Get initial status
        const status = getModelStatus();
        setModelStatus(status);
        console.log('🔍 Initial model status:', status);
        
        // Try to initialize the model
        if (!status.isLoaded) {
          console.log('🔄 Attempting to load YOLOv5 model...');
          const { aiModelDetection } = await import('@/lib/aiModelDetection');
          await aiModelDetection.initializeModel();
          
          // Check status again
          const newStatus = getModelStatus();
          setModelStatus(newStatus);
          console.log('🔍 Updated model status:', newStatus);
        }
        
      } catch (err: any) {
        console.error('❌ Failed to initialize model:', err);
        setError(`Model initialization failed: ${err.message}`);
      }
    }, 1000); // Wait 1 second before trying to load

    return () => clearTimeout(timer);
  }, []);

  const testModelLoading = async () => {
    try {
      setError(null);
      console.log('🚀 Testing model loading...');
      
      // Import and initialize the model
      const { getModelStatus } = await import('@/lib/imageAnalysis');
      const { aiModelDetection } = await import('@/lib/aiModelDetection');
      
      // Try to initialize the model
      console.log('🔄 Initializing YOLOv5 model...');
      await aiModelDetection.initializeModel();
      
      // Check the status
      const status = getModelStatus();
      setModelStatus(status);
      
      console.log('✅ Model status updated:', status);
    } catch (err: any) {
      console.error('❌ Test failed:', err);
      setError(`Test failed: ${err.message}`);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-6">❌ Error Loading Test Page</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Error Details</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={testModelLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🔄 Retry Model Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-green-600">
          🤖 AI Model Test Page
        </h1>

        {/* Status Display */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">AI Model Status</h2>
          <div className="space-y-4">
            <div>
              <p><strong>YOLOv5 Model:</strong> 
                <span className={`ml-2 px-3 py-1 rounded text-sm font-medium ${
                  modelStatus?.isLoaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {modelStatus?.isLoaded ? '✅ LOADED' : '❌ NOT LOADED'}
                </span>
              </p>
            </div>
            
            <div>
              <p><strong>Backend:</strong> 
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                  {modelStatus?.backend || 'Unknown'}
                </span>
              </p>
            </div>

            <div>
              <button 
                onClick={testModelLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                🔄 Test Model Loading
              </button>
            </div>
          </div>
        </div>

        {/* Model Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">YOLOv5 Model Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Model Details</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Type: YOLOv5 (COCO dataset)</li>
                <li>• Input: 640x640 pixels</li>
                <li>• Classes: 80 object categories</li>
                <li>• Format: TensorFlow.js</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Waste Categories</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Plastic: bottle, cup, bowl</li>
                <li>• Metal: fork, knife, spoon</li>
                <li>• Glass: wine glass, vase</li>
                <li>• Paper: book</li>
                <li>• Electronics: tv, laptop, phone</li>
                <li>• Organic: food items, plants</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Console Output */}
        <div className="bg-black rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Console Output</h3>
          <p className="text-green-400 text-sm">
            Check your browser console (F12) for detailed logs about model loading
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">What This Test Shows</h2>
          <div className="space-y-3 text-sm">
            <p><strong>✅ If YOLOv5 is working:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li>Model Status will show "✅ LOADED"</li>
              <li>Backend will show "webgl" or "cpu"</li>
              <li>Console will show successful model loading messages</li>
            </ul>
            
            <p className="mt-4"><strong>❌ If YOLOv5 is NOT working:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li>Model Status will show "❌ NOT LOADED"</li>
              <li>Backend will show "Unknown"</li>
              <li>Console will show error messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
