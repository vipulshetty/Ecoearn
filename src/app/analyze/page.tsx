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
      
      // Navigate to results page after a delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Error analyzing waste:', error);
      setError('Failed to analyze waste. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
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