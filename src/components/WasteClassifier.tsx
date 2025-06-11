'use client';

import { useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { YOLOv5WasteDetector } from '@/lib/yolov5';

// Waste categories and keywords for classification
const wasteCategories = {
  plastic: [
    'plastic', 'bottle', 'container', 'jug', 'packaging', 'wrapper', 'bag', 
    'poly', 'polymer', 'polyethylene', 'PET', 'HDPE', 'LDPE', 'cup', 'straw'
  ],
  paper: [
    'paper', 'cardboard', 'carton', 'box', 'newspaper', 'magazine', 'book', 
    'envelope', 'document', 'mail', 'card', 'packaging', 'tissue'
  ],
  metal: [
    'metal', 'aluminum', 'aluminium', 'tin', 'can', 'foil', 'steel', 'iron', 
    'copper', 'brass', 'silverware', 'utensil', 'wire', 'scrap'
  ],
  glass: [
    'glass', 'bottle', 'jar', 'window', 'container', 'drinkware', 'mirror', 
    'cup', 'vase', 'bulb', 'wineglass', 'tumbler', 'beaker'
  ],
  organic: [
    'food', 'fruit', 'vegetable', 'plant', 'leaf', 'garden', 'compost', 
    'biodegradable', 'organic', 'wood', 'paper', 'cotton', 'leather'
  ],
  electronics: [
    'electronic', 'computer', 'laptop', 'phone', 'device', 'appliance', 
    'battery', 'charger', 'cable', 'wire', 'circuit', 'bulb', 'led'
  ]
};

type WasteType = 'plastic' | 'paper' | 'metal' | 'glass' | 'organic' | 'electronics' | 'other';

type WasteResult = {
  wasteType: string;
  confidence: number;
  label: string;
  detailedType: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
};

interface WasteClassifierProps {
  imageUrl: string;
  onClassified: (result: WasteResult) => void;
}

export default function WasteClassifier({ imageUrl, onClassified }: WasteClassifierProps) {
  const [detector, setDetector] = useState<YOLOv5WasteDetector | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WasteResult | null>(null);
  const [previousImageUrl, setPreviousImageUrl] = useState<string | null>(null);

  // Load the YOLOv5 model
  useEffect(() => {
    async function loadModel() {
      try {
        // Set loading state
        setLoading(true);
        setLoadingProgress(10);
        console.log('Starting to load YOLOv5 model...');
        
        // Create YOLOv5 detector
        const yoloDetector = new YOLOv5WasteDetector();
        
        // Load the model with progress callback
        await yoloDetector.loadModel((progress) => {
          console.log(`Model loading progress: ${progress}%`);
          setLoadingProgress(progress);
        });
        
        setDetector(yoloDetector);
        console.log('YOLOv5 model loaded successfully');
        setLoading(false);
      } catch (err) {
        console.error('Failed to load YOLOv5 model', err);
        // Important: Continue with fallback detection even if model fails
        const yoloDetector = new YOLOv5WasteDetector();
        setDetector(yoloDetector);
        setError('Using color-based detection due to model loading issue.');
        setLoading(false);
      }
    }

    loadModel();

    // Cleanup function
    return () => {
      if (detector) {
        // Reset the detector state first to clean up any tensors
        detector.reset();
        // Then dispose of the detector
        detector.dispose();
        console.log('YOLOv5 detector disposed');
      }
    };
  }, []);

  // Reset result and show loading transition when image URL changes
  useEffect(() => {
    if (imageUrl && imageUrl !== previousImageUrl) {
      // Clear previous results
      setResult(null);
      setError(null);
      
      // Set predicting state to show loading animation
      setPredicting(true);
      
      // Store current URL to prevent duplicate processing
      setPreviousImageUrl(imageUrl);
      
      // Reset any previous detection state
      if (detector) {
        detector.reset();
      }
    }
  }, [imageUrl, previousImageUrl, detector]);

  // Predict waste category from image
  useEffect(() => {
    // Only run if we have a detector, image URL, and we're not already predicting
    if (!detector || !imageUrl || !previousImageUrl) return;

    // Create a variable to track if the component is still mounted
    let isMounted = true;
    
    async function classifyImage() {
      // We already set predicting=true in the imageUrl change effect
      // This ensures the loading indicator appears immediately when image changes
      setError(null);
      
      // Add a small delay to ensure the loading animation is visible
      // This improves user experience by showing a clear transition between analyses
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if component is still mounted after the delay
      if (!isMounted) return;

      try {
        console.log('Analyzing image with YOLOv5 model:', imageUrl);
        
        // Verify detector is properly initialized
        if (!detector) {
          throw new Error('YOLOv5 detector not initialized');
        }
        
        // Detect waste in the image
        console.log('Calling YOLOv5 detectWaste method...');
        const detectionResult = await detector.detectWaste(imageUrl);
        console.log('YOLOv5 detection completed successfully');
        
        // Check if component is still mounted after detection
        if (!isMounted) return;
        
        if (detectionResult) {
          // Format the result
          const wasteResult: WasteResult = {
            wasteType: detectionResult.wasteType,
            confidence: detectionResult.confidence,
            label: detectionResult.label,
            detailedType: detectionResult.detailedType,
            quality: detectionResult.quality
          };
          
          // Add a small delay before showing results for better UX
          await new Promise(resolve => setTimeout(resolve, 300));
          if (!isMounted) return;
          
          // Store the result
          setResult(wasteResult);
          
          // Pass the result to the parent component
          onClassified(wasteResult);
          
          console.log('YOLOv5 detection result:', wasteResult);
        } else {
          throw new Error('No detection results returned from YOLOv5 model');
        }
      } catch (err) {
        console.error('Error during waste classification:', err);
        if (!isMounted) return;
        
        // Provide a user-friendly error message
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Failed to analyze image: ${errorMessage}`);
      } finally {
        if (isMounted) {
          setPredicting(false);
        }
      }
    }

    // Start classification process
    classifyImage();

    // Cleanup function to handle component unmounting
    return () => {
      isMounted = false;
    };
  }, [detector, imageUrl, previousImageUrl, onClassified]);

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading || predicting) {
    return (
      <div className="my-4 space-y-3">
        <div className="flex items-center">
          <div className="mr-3">
            <div className="h-10 w-10 rounded-full border-4 border-muted-foreground/30 border-t-primary animate-spin" />
          </div>
          <p className="text-sm font-medium">
            {loading ? `Loading waste detection model (${loadingProgress}%)` : 'Analyzing waste in image...'}
          </p>
        </div>
        <Progress 
          value={loading ? loadingProgress : predicting ? Math.floor(50 + Math.random() * 40) : 50} 
          className="h-2 transition-all duration-300 ease-in-out" 
        />
        <div className="flex items-center justify-center py-2">
          <div className="animate-pulse flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {loading 
            ? 'Initializing waste detection model...'
            : 'Using AI to identify and classify waste materials...'}
        </p>
        {result && predicting && (
          <div className="mt-2 p-3 bg-muted/50 rounded-md border border-border/50 animate-pulse transition-opacity duration-300">
            <p className="text-xs text-muted-foreground">Previous result will be replaced when analysis completes</p>
          </div>
        )}
      </div>
    );
  }

  if (result) {
    return (
      <div className="my-4 space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">Analysis Result (YOLOv5+TACO)</h3>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-semibold">Detected:</span> {result.label}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Waste Type:</span> {result.wasteType}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Quality:</span> {result.quality.charAt(0).toUpperCase() + result.quality.slice(1)}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Confidence:</span> {Math.round(result.confidence * 100)}%
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}