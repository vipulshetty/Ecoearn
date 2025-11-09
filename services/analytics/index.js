const { Kafka } = require('kafkajs');
const Redis = require('redis');
const express = require('express');
const cors = require('cors');

class AnalyticsService {
  constructor() {
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());
    
    this.kafka = new Kafka({
      clientId: 'analytics-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
    });
    
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    this.consumer = this.kafka.consumer({ groupId: 'analytics-group' });
    this.producer = this.kafka.producer();
    
    this.metrics = {
      wasteDetections: 0,
      routeOptimizations: 0,
      userActions: 0,
      totalUsers: 0,
      averageAccuracy: 0
    };
    
    this.setupRoutes();
  }

  async initialize() {
    try {
      await this.redis.connect();
      await this.consumer.connect();
      await this.producer.connect();
      
      await this.consumer.subscribe({ 
        topics: [
          'analytics-events',
          'waste-detection-results',
          'route-optimization-results',
          'blockchain-events'
        ]
      });
      
      console.log('📊 Analytics Service initialized');
      this.startProcessing();
      
      // Start Express server
      const port = process.env.PORT || 3000;
      this.app.listen(port, () => {
        console.log(`📈 Analytics API running on port ${port}`);
      });
      
    } catch (error) {
      console.error('❌ Analytics Service initialization failed:', error);
    }
  }

  setupRoutes() {
    // Real-time metrics endpoint
    this.app.get('/metrics', async (req, res) => {
      try {
        const realTimeMetrics = await this.getRealTimeMetrics();
        res.json(realTimeMetrics);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Dashboard data endpoint
    this.app.get('/dashboard', async (req, res) => {
      try {
        const dashboardData = await this.getDashboardData();
        res.json(dashboardData);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // User analytics endpoint
    this.app.get('/users/:userId/analytics', async (req, res) => {
      try {
        const userAnalytics = await this.getUserAnalytics(req.params.userId);
        res.json(userAnalytics);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Leaderboard endpoint
    this.app.get('/leaderboard', async (req, res) => {
      try {
        const leaderboard = await this.getLeaderboard();
        res.json(leaderboard);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Environmental impact endpoint
    this.app.get('/environmental-impact', async (req, res) => {
      try {
        const impact = await this.getEnvironmentalImpact();
        res.json(impact);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  async startProcessing() {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          console.log(`📊 Processing analytics event: ${topic}`);
          
          switch (topic) {
            case 'analytics-events':
              await this.processAnalyticsEvent(data);
              break;
            case 'waste-detection-results':
              await this.processWasteDetectionResult(data);
              break;
            case 'route-optimization-results':
              await this.processRouteOptimizationResult(data);
              break;
            case 'blockchain-events':
              await this.processBlockchainEvent(data);
              break;
          }
        } catch (error) {
          console.error('❌ Analytics processing error:', error);
        }
      },
    });
  }

  async processAnalyticsEvent(data) {
    const { type, userId, metadata, timestamp } = data;
    
    // Update real-time counters
    switch (type) {
      case 'user_action':
        await this.incrementMetric('user_actions');
        await this.trackUserActivity(userId, metadata);
        break;
      case 'ai_detection':
        await this.incrementMetric('ai_detections');
        await this.updateAccuracyMetrics(metadata.accuracy);
        break;
      case 'route_optimization':
        await this.incrementMetric('route_optimizations');
        await this.trackRouteEfficiency(metadata);
        break;
    }
    
    // Store event for historical analysis
    await this.storeEvent(type, data);
  }

  async processWasteDetectionResult(data) {
    const { userId, result, processingTime } = data;
    
    // Track AI performance metrics
    await this.redis.hIncrBy('ai_metrics', 'total_detections', 1);
    await this.redis.hIncrBy('ai_metrics', 'total_processing_time', processingTime);
    
    if (result.confidence) {
      await this.redis.lPush('confidence_scores', result.confidence);
      await this.redis.lTrim('confidence_scores', 0, 999); // Keep last 1000 scores
    }
    
    // Track waste categories
    if (result.category) {
      await this.redis.hIncrBy('waste_categories', result.category, 1);
    }
    
    // User-specific analytics
    await this.redis.hIncrBy(`user:${userId}:stats`, 'detections', 1);
    
    console.log('📊 Processed waste detection analytics');
  }

  async processRouteOptimizationResult(data) {
    const { collectorId, metrics, pickupCount } = data;
    
    if (metrics) {
      // Track route efficiency
      await this.redis.hIncrBy('route_metrics', 'total_routes', 1);
      await this.redis.hIncrBy('route_metrics', 'total_distance', Math.round(metrics.totalDistance));
      await this.redis.hIncrBy('route_metrics', 'total_cost_saved', Math.round(metrics.fuelCost));
      
      // Environmental impact
      if (metrics.co2Emissions) {
        await this.redis.hIncrBy('environmental_impact', 'co2_reduced', Math.round(metrics.co2Emissions));
      }
    }
    
    // Collector performance
    await this.redis.hIncrBy(`collector:${collectorId}:stats`, 'routes_completed', 1);
    await this.redis.hIncrBy(`collector:${collectorId}:stats`, 'pickups_handled', pickupCount || 0);
    
    console.log('📊 Processed route optimization analytics');
  }

  async processBlockchainEvent(data) {
    const { type, userId, amount } = data;
    
    // Track blockchain activity
    await this.redis.hIncrBy('blockchain_metrics', 'total_transactions', 1);
    
    if (amount) {
      await this.redis.hIncrBy('blockchain_metrics', 'total_rewards', amount);
    }
    
    // User rewards
    await this.redis.hIncrBy(`user:${userId}:stats`, 'rewards_earned', amount || 0);
    
    console.log('📊 Processed blockchain analytics');
  }

  async getRealTimeMetrics() {
    const [
      userActions,
      aiDetections,
      routeOptimizations,
      aiMetrics,
      routeMetrics,
      blockchainMetrics
    ] = await Promise.all([
      this.redis.get('user_actions') || 0,
      this.redis.get('ai_detections') || 0,
      this.redis.get('route_optimizations') || 0,
      this.redis.hGetAll('ai_metrics'),
      this.redis.hGetAll('route_metrics'),
      this.redis.hGetAll('blockchain_metrics')
    ]);
    
    return {
      realTimeCounters: {
        userActions: parseInt(userActions),
        aiDetections: parseInt(aiDetections),
        routeOptimizations: parseInt(routeOptimizations)
      },
      aiPerformance: {
        totalDetections: parseInt(aiMetrics.total_detections) || 0,
        averageProcessingTime: this.calculateAverageProcessingTime(aiMetrics),
        averageConfidence: await this.calculateAverageConfidence()
      },
      routeEfficiency: {
        totalRoutes: parseInt(routeMetrics.total_routes) || 0,
        totalDistance: parseInt(routeMetrics.total_distance) || 0,
        costSaved: parseInt(routeMetrics.total_cost_saved) || 0
      },
      blockchain: {
        totalTransactions: parseInt(blockchainMetrics.total_transactions) || 0,
        totalRewards: parseInt(blockchainMetrics.total_rewards) || 0
      },
      timestamp: new Date().toISOString()
    };
  }

  async getDashboardData() {
    const wasteCategories = await this.redis.hGetAll('waste_categories');
    const environmentalImpact = await this.redis.hGetAll('environmental_impact');
    
    return {
      wasteBreakdown: wasteCategories,
      environmentalImpact: {
        co2Reduced: parseInt(environmentalImpact.co2_reduced) || 0,
        wasteProcessed: Object.values(wasteCategories).reduce((sum, count) => sum + parseInt(count), 0),
        recyclingRate: this.calculateRecyclingRate(wasteCategories)
      },
      trends: await this.generateTrends(),
      topPerformers: await this.getTopPerformers()
    };
  }

  async getUserAnalytics(userId) {
    const userStats = await this.redis.hGetAll(`user:${userId}:stats`);
    
    return {
      detections: parseInt(userStats.detections) || 0,
      rewardsEarned: parseInt(userStats.rewards_earned) || 0,
      rank: await this.getUserRank(userId),
      achievements: await this.getUserAchievements(userId),
      environmentalImpact: await this.getUserEnvironmentalImpact(userId)
    };
  }

  async getLeaderboard() {
    // Get top users by various metrics
    const topByDetections = await this.getTopUsersByMetric('detections');
    const topByRewards = await this.getTopUsersByMetric('rewards_earned');
    
    return {
      topDetectors: topByDetections,
      topEarners: topByRewards,
      lastUpdated: new Date().toISOString()
    };
  }

  async getEnvironmentalImpact() {
    const impact = await this.redis.hGetAll('environmental_impact');
    
    return {
      co2Reduced: parseInt(impact.co2_reduced) || 0,
      wasteProcessed: await this.getTotalWasteProcessed(),
      recyclingRate: await this.getOverallRecyclingRate(),
      treesEquivalent: Math.round((parseInt(impact.co2_reduced) || 0) / 21), // 21kg CO2 per tree per year
      energySaved: Math.round((parseInt(impact.co2_reduced) || 0) * 2.5), // Rough calculation
      lastUpdated: new Date().toISOString()
    };
  }

  // Helper methods
  async incrementMetric(metricName) {
    await this.redis.incr(metricName);
  }

  async storeEvent(type, data) {
    const eventKey = `events:${type}:${new Date().toISOString().split('T')[0]}`;
    await this.redis.lPush(eventKey, JSON.stringify(data));
    await this.redis.expire(eventKey, 86400 * 30); // Keep for 30 days
  }

  calculateAverageProcessingTime(aiMetrics) {
    const total = parseInt(aiMetrics.total_processing_time) || 0;
    const count = parseInt(aiMetrics.total_detections) || 1;
    return Math.round(total / count);
  }

  async calculateAverageConfidence() {
    const scores = await this.redis.lRange('confidence_scores', 0, -1);
    if (scores.length === 0) return 0;
    
    const sum = scores.reduce((acc, score) => acc + parseFloat(score), 0);
    return Math.round((sum / scores.length) * 100) / 100;
  }

  calculateRecyclingRate(wasteCategories) {
    const recyclableTypes = ['recyclable_plastic', 'glass', 'paper', 'metal'];
    const recyclableCount = recyclableTypes.reduce((sum, type) => 
      sum + (parseInt(wasteCategories[type]) || 0), 0);
    const totalCount = Object.values(wasteCategories).reduce((sum, count) => 
      sum + parseInt(count), 0);
    
    return totalCount > 0 ? Math.round((recyclableCount / totalCount) * 100) : 0;
  }

  async generateTrends() {
    // Generate trend data for the last 7 days
    const trends = {};
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dailyEvents = await this.redis.lLen(`events:ai_detection:${dateStr}`);
      trends[dateStr] = dailyEvents || 0;
    }
    
    return trends;
  }

  async getTopPerformers() {
    return {
      topDetector: 'user123', // Implement actual logic
      topCollector: 'collector456',
      mostImproved: 'user789'
    };
  }

  async getUserRank(userId) {
    // Implement ranking logic
    return Math.floor(Math.random() * 100) + 1;
  }

  async getUserAchievements(userId) {
    // Implement achievements system
    return [
      'First Detection',
      'Recycling Champion',
      'Eco Warrior'
    ];
  }

  async getUserEnvironmentalImpact(userId) {
    return {
      co2Saved: Math.floor(Math.random() * 50),
      wasteProcessed: Math.floor(Math.random() * 100),
      treesEquivalent: Math.floor(Math.random() * 5)
    };
  }

  async getTopUsersByMetric(metric) {
    // Simplified - implement proper sorting logic
    return [
      { userId: 'user1', value: 150 },
      { userId: 'user2', value: 120 },
      { userId: 'user3', value: 100 }
    ];
  }

  async getTotalWasteProcessed() {
    const categories = await this.redis.hGetAll('waste_categories');
    return Object.values(categories).reduce((sum, count) => sum + parseInt(count), 0);
  }

  async getOverallRecyclingRate() {
    const categories = await this.redis.hGetAll('waste_categories');
    return this.calculateRecyclingRate(categories);
  }
}

const analyticsService = new AnalyticsService();
analyticsService.initialize().catch(console.error);

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down Analytics Service...');
  process.exit(0);
});

module.exports = AnalyticsService;