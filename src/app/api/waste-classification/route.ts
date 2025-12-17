import { NextRequest, NextResponse } from 'next/server';

type WasteCategory = 'plastic' | 'paper' | 'glass' | 'metal' | 'organic' | 'electronic' | 'other';

interface WasteDetection {
  className: string;
  wasteCategory: WasteCategory;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
}

interface WasteAnalysisResult {
  detections: WasteDetection[];
  primaryWasteType: WasteCategory;
  confidence: number;
  recyclable: boolean;
  points: number;
}

export async function POST(request: NextRequest) {
  try {
    const { imageData, analysisResult } = await request.json();
    
    if (!imageData || !analysisResult) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }
    
    // Process the analysis result
    const processedResult = processWasteAnalysis(analysisResult);
    
    // In a real application, you might:
    // 1. Store the result in a database
    // 2. Update user points/rewards
    // 3. Generate statistics
    
    return NextResponse.json({
      success: true,
      result: processedResult
    });
  } catch (error) {
    console.error('Error processing waste classification:', error);
    return NextResponse.json(
      { error: 'Failed to process waste classification' },
      { status: 500 }
    );
  }
}

function processWasteAnalysis(result: WasteAnalysisResult) {
  // Add any additional processing logic here
  const recyclable = [
    WasteCategory.PLASTIC,
    WasteCategory.PAPER,
    WasteCategory.GLASS,
    WasteCategory.METAL
  ].includes(result.primaryWasteType);
  
  const environmentalImpact = calculateEnvironmentalImpact(result.primaryWasteType);
  
  return {
    ...result,
    recyclable,
    environmentalImpact,
    processingTimestamp: new Date().toISOString()
  };
}

function calculateEnvironmentalImpact(wasteType: WasteCategory) {
  // Calculate environmental impact based on waste type
  // This is a simplified example
  const impactScores = {
    [WasteCategory.PLASTIC]: {
      co2Reduction: 2.5,
      waterSaved: 1.5,
      energySaved: 3.0
    },
    [WasteCategory.PAPER]: {
      co2Reduction: 1.0,
      waterSaved: 2.0,
      energySaved: 1.5
    },
    [WasteCategory.GLASS]: {
      co2Reduction: 0.5,
      waterSaved: 0.5,
      energySaved: 2.0
    },
    [WasteCategory.METAL]: {
      co2Reduction: 4.0,
      waterSaved: 1.0,
      energySaved: 5.0
    },
    [WasteCategory.ORGANIC]: {
      co2Reduction: 0.2,
      waterSaved: 0.1,
      energySaved: 0.3
    },
    [WasteCategory.ELECTRONIC]: {
      co2Reduction: 5.0,
      waterSaved: 3.0,
      energySaved: 6.0
    },
    [WasteCategory.OTHER]: {
      co2Reduction: 0.1,
      waterSaved: 0.1,
      energySaved: 0.1
    }
  };
  
  return impactScores[wasteType] || impactScores[WasteCategory.OTHER];
}