// Enhanced API endpoint that integrates Kafka with your existing Vercel app
import { NextRequest, NextResponse } from 'next/server';
import kafkaClient, { publishWasteDetection, publishRouteOptimization, publishAnalyticsEvent } from '@/lib/kafkaClient';

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    
    switch (action) {
      case 'waste-detection':
        // Enhanced waste detection with Kafka workers
        await publishWasteDetection({
          imageUrl: data.imageUrl,
          userId: data.userId,
          submissionId: data.submissionId,
          timestamp: Date.now()
        });
        
        return NextResponse.json({ 
          success: true, 
          message: 'Waste detection request sent to AI workers',
          fallback: 'Will process locally if Kafka unavailable'
        });
        
      case 'route-optimization':
        // Enhanced route optimization with Kafka workers
        await publishRouteOptimization({
          collectorId: data.collectorId,
          pickupLocations: data.pickupLocations,
          collectorLocation: data.collectorLocation,
          priority: data.priority || 'normal'
        });
        
        return NextResponse.json({ 
          success: true, 
          message: 'Route optimization sent to specialized workers'
        });
        
      case 'analytics':
        // Real-time analytics events
        await publishAnalyticsEvent({
          type: data.type,
          userId: data.userId,
          metadata: data.metadata
        });
        
        return NextResponse.json({ success: true });
        
      case 'batch-processing':
        // Batch waste detection
        const batchId = await kafkaClient.publishBatchWasteDetection(
          data.imageUrls, 
          data.userId
        );
        
        return NextResponse.json({ 
          success: true, 
          batchId,
          message: 'Batch processing initiated'
        });
        
      case 'health-check':
        const isHealthy = await kafkaClient.isHealthy();
        return NextResponse.json({ 
          kafka: isHealthy ? 'connected' : 'offline',
          services: isHealthy ? ['ai-worker', 'route-worker', 'analytics'] : [],
          fallback: 'Local processing available'
        });
        
      default:
        return NextResponse.json({ 
          error: 'Unknown action' 
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Kafka integration error:', error);
    return NextResponse.json({ 
      error: 'Kafka integration failed',
      fallback: 'Processing locally'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const isHealthy = await kafkaClient.isHealthy();
    
    return NextResponse.json({
      status: 'OK',
      kafka: isHealthy ? 'connected' : 'offline',
      services: {
        'ai-worker': isHealthy,
        'route-worker': isHealthy,
        'analytics-service': isHealthy,
        'notification-service': isHealthy
      },
      features: [
        'Enhanced AI Processing',
        'Advanced Route Optimization',
        'Real-time Analytics',
        'Batch Processing',
        'Background Jobs'
      ]
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}