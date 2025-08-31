import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const clientAnalysisStr = formData.get('clientAnalysis') as string;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    let clientAnalysis = null;
    if (clientAnalysisStr) {
      try {
        clientAnalysis = JSON.parse(clientAnalysisStr);
      } catch (parseError) {
        console.warn('Failed to parse client analysis:', parseError);
      }
    }

    // Use client analysis if available, otherwise provide fallback
    const result = clientAnalysis || {
      wasteType: 'other',
      detailedType: 'unknown',
      confidence: 0.5,
      quality: 'fair',
      pointsEarned: 3,
      recyclable: false
    };

    // Calculate additional points based on waste type
    const pointsMultiplier = {
      'plastic': 1.2,
      'glass': 1.5,
      'metal': 2.0,
      'paper': 1.0,
      'electronic': 2.5,
      'organic': 0.8
    };

    const multiplier = pointsMultiplier[result.wasteType as keyof typeof pointsMultiplier] || 1.0;
    result.pointsEarned = Math.round((result.pointsEarned || 3) * multiplier);

    // Simulate database storage
    console.log('💾 Storing waste analysis result:', {
      imageSize: image.size,
      wasteType: result.wasteType,
      points: result.pointsEarned,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('❌ Error processing waste analysis:', error);
    return NextResponse.json(
      { error: 'Failed to process waste analysis' },
      { status: 500 }
    );
  }
}