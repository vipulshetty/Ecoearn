'use client';

import { useState, useRef } from 'react';
import { CameraIcon } from '@heroicons/react/24/solid';

export default function Upload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) return;

    setIsProcessing(true);
    try {
      // TODO: Implement AI waste detection and points calculation
      // const response = await fetch('/api/analyze-waste', {
      //   method: 'POST',
      //   body: JSON.stringify({ image: preview }),
      //   headers: { 'Content-Type': 'application/json' },
      // });
      // const data = await response.json();
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Handle response
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upload Waste Image</h1>
      
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500"
            >
              {preview ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-full object-contain"
                />
              ) : (
                <>
                  <CameraIcon className="h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Click to take or upload a photo</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageCapture}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={!preview || isProcessing}
            className={`w-full py-2 px-4 rounded-md text-white ${
              !preview || isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
