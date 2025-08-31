'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { WasteDetector, WasteAnalysisResult, WasteCategory } from '@/lib/waste-detector';

export default function WasteImageUpload() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<WasteAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const detector = useRef<WasteDetector | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!image || !imageRef.current) return;
    
    setIsAnalyzing(true);
    
    try {
      console.log('🔍 Starting waste image analysis...');
      
      // Initialize detector if not already done
      if (!detector.current) {
        detector.current = new WasteDetector();
      }
      
      // Wait for model to load
      await detector.current.loadModel();
      
      // Analyze the image
      const analysisResult = await detector.current.detectWaste(imageRef.current);
      console.log('♻️ Analysis result:', analysisResult);
      
      setResult(analysisResult);
      
      // Send result to API for processing
      try {
        await fetch('/api/waste-classification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageData: image,
            analysisResult 
          })
        });
      } catch (apiError) {
        console.warn('⚠️ API call failed:', apiError);
        // Continue anyway - we have the analysis result
      }
    } catch (error) {
      console.error('❌ Error analyzing image:', error);
      // Provide fallback result
      setResult({
        detections: [],
        primaryWasteType: WasteCategory.OTHER,
        confidence: 0.5,
        recyclable: false,
        points: 1
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryColor = (category: WasteCategory) => {
    const colors: Record<WasteCategory, string> = {
      [WasteCategory.PLASTIC]: 'text-blue-500',
      [WasteCategory.PAPER]: 'text-yellow-500',
      [WasteCategory.GLASS]: 'text-green-500',
      [WasteCategory.METAL]: 'text-gray-500',
      [WasteCategory.ORGANIC]: 'text-green-700',
      [WasteCategory.ELECTRONIC]: 'text-red-500',
      [WasteCategory.OTHER]: 'text-purple-500'
    };
    return colors[category] || 'text-black';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Waste Image Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="mb-4"
          >
            Select Image
          </Button>
          
          {image && (
            <div className="relative w-full h-64 border rounded-md overflow-hidden">
              <Image
                src={image}
                alt="Waste image"
                fill
                style={{ objectFit: 'contain' }}
                ref={imageRef as any}
                onLoad={() => {
                  // Image is loaded and ready for analysis
                }}
              />
            </div>
          )}
        </div>
        
        {result && (
          <div className="mt-4 p-4 border rounded-md">
            <h3 className="font-semibold text-lg mb-2">Analysis Results</h3>
            <p>
              Primary waste type: 
              <span className={`font-bold ml-2 ${getCategoryColor(result.primaryWasteType)}`}>
                {result.primaryWasteType.toUpperCase()}
              </span>
            </p>
            <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
            <p>Recyclable: {result.recyclable ? 'Yes' : 'No'}</p>
            <p>Points earned: {result.points}</p>
            
            <div className="mt-2">
              <h4 className="font-medium">Detected items:</h4>
              <ul className="list-disc pl-5">
                {result.detections.map((detection, index) => (
                  <li key={index}>
                    {detection.className} ({(detection.confidence * 100).toFixed(1)}%)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={analyzeImage} 
          disabled={!image || isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Waste'}
        </Button>
      </CardFooter>
    </Card>
  );
}