// Kafka Client for EcoeEarn - Integrates with your existing Vercel app
import { Kafka, Producer, Consumer } from 'kafkajs';

class EcoearnKafkaClient {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'ecoearn-vercel-app',
      brokers: [
        process.env.KAFKA_BROKER || 'localhost:9092',
        // Add your cloud Kafka brokers here when deployed
        // process.env.CONFLUENT_KAFKA_BROKER || 'your-confluent-broker'
      ],
      // Add authentication for production
      // sasl: {
      //   mechanism: 'plain',
      //   username: process.env.KAFKA_USERNAME,
      //   password: process.env.KAFKA_PASSWORD,
      // },
    });
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      this.producer = this.kafka.producer({
        maxInFlightRequests: 1,
        idempotent: true,
        transactionTimeout: 30000,
      });

      await this.producer.connect();
      this.isConnected = true;
      console.log('✅ Kafka producer connected from Vercel app');
    } catch (error) {
      console.warn('⚠️ Kafka connection failed, running in offline mode:', error);
      // Graceful fallback - app continues working without Kafka
    }
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
    }
    if (this.consumer) {
      await this.consumer.disconnect();
    }
    this.isConnected = false;
  }

  // Enhanced waste detection with Kafka
  async publishWasteDetection(data: {
    imageUrl: string;
    userId: string;
    submissionId: string;
    timestamp?: number;
  }): Promise<void> {
    if (!this.isConnected) {
      console.log('📦 Kafka offline - processing locally only');
      return;
    }

    try {
      await this.producer?.send({
        topic: 'waste-detection-requests',
        messages: [{
          key: data.submissionId,
          value: JSON.stringify({
            ...data,
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: data.timestamp || Date.now(),
            source: 'vercel-app'
          })
        }]
      });

      console.log('🚀 Waste detection request sent to AI workers');
    } catch (error) {
      console.error('❌ Failed to publish waste detection:', error);
    }
  }

  // Route optimization with Kafka
  async publishRouteOptimization(data: {
    collectorId: string;
    pickupLocations: Array<{ latitude: number; longitude: number; submissionId: string }>;
    collectorLocation: { latitude: number; longitude: number };
    priority?: 'normal' | 'urgent';
  }): Promise<void> {
    if (!this.isConnected) {
      console.log('🗺️ Kafka offline - using local routing only');
      return;
    }

    try {
      await this.producer?.send({
        topic: 'route-optimization-requests',
        messages: [{
          key: data.collectorId,
          value: JSON.stringify({
            ...data,
            requestId: `route_${Date.now()}_${data.collectorId}`,
            timestamp: Date.now(),
            source: 'vercel-app'
          })
        }]
      });

      console.log('🛣️ Route optimization request sent to workers');
    } catch (error) {
      console.error('❌ Failed to publish route optimization:', error);
    }
  }

  // Real-time analytics events
  async publishAnalyticsEvent(data: {
    type: 'user_action' | 'ai_detection' | 'route_optimization' | 'reward_earned';
    userId?: string;
    metadata: any;
  }): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.producer?.send({
        topic: 'analytics-events',
        messages: [{
          key: data.userId || 'anonymous',
          value: JSON.stringify({
            ...data,
            timestamp: new Date().toISOString(),
            source: 'vercel-app'
          })
        }]
      });
    } catch (error) {
      console.error('❌ Failed to publish analytics event:', error);
    }
  }

  // Blockchain transaction events
  async publishBlockchainEvent(data: {
    type: 'reward_minted' | 'nft_created' | 'transaction_confirmed';
    userId: string;
    transactionHash?: string;
    amount?: number;
    metadata: any;
  }): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.producer?.send({
        topic: 'blockchain-events',
        messages: [{
          key: data.userId,
          value: JSON.stringify({
            ...data,
            timestamp: new Date().toISOString(),
            source: 'vercel-app'
          })
        }]
      });

      console.log('⛓️ Blockchain event published');
    } catch (error) {
      console.error('❌ Failed to publish blockchain event:', error);
    }
  }

  // Listen for results from workers
  async subscribeToResults(topics: string[], callback: (topic: string, message: any) => void): Promise<void> {
    if (!this.isConnected) return;

    try {
      this.consumer = this.kafka.consumer({ groupId: 'vercel-app-consumer' });
      await this.consumer.connect();
      await this.consumer.subscribe({ topics });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const data = JSON.parse(message.value?.toString() || '{}');
            callback(topic, data);
          } catch (error) {
            console.error('❌ Failed to process message:', error);
          }
        },
      });

      console.log('👂 Subscribed to worker results:', topics);
    } catch (error) {
      console.error('❌ Failed to subscribe to results:', error);
    }
  }

  // Batch processing
  async publishBatchWasteDetection(imageUrls: string[], userId: string): Promise<string> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!this.isConnected) {
      console.log('📦 Kafka offline - processing batch locally');
      return batchId;
    }

    try {
      await this.producer?.send({
        topic: 'batch-ai-processing',
        messages: [{
          key: batchId,
          value: JSON.stringify({
            batchId,
            imageUrls,
            userId,
            timestamp: Date.now(),
            source: 'vercel-app'
          })
        }]
      });

      console.log('📊 Batch processing request sent:', batchId);
    } catch (error) {
      console.error('❌ Failed to publish batch request:', error);
    }

    return batchId;
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    return this.isConnected;
  }
}

// Singleton instance
const kafkaClient = new EcoearnKafkaClient();

// Auto-connect when imported (with graceful failure)
kafkaClient.connect().catch(() => {
  console.log('🔄 Kafka will retry connection later...');
});

// Graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await kafkaClient.disconnect();
  });
}

export default kafkaClient;

// Utility functions for easy integration
export const publishWasteDetection = (data: Parameters<typeof kafkaClient.publishWasteDetection>[0]) => 
  kafkaClient.publishWasteDetection(data);

export const publishRouteOptimization = (data: Parameters<typeof kafkaClient.publishRouteOptimization>[0]) => 
  kafkaClient.publishRouteOptimization(data);

export const publishAnalyticsEvent = (data: Parameters<typeof kafkaClient.publishAnalyticsEvent>[0]) => 
  kafkaClient.publishAnalyticsEvent(data);