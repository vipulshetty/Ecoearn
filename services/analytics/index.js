const { Kafka } = require('kafkajs');
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

    // In-memory storage replacement for Redis
    this.store = {
      user_actions: 0,
      ai_detections: 0,
      route_optimizations: 0,
      ai_metrics: {},
      route_metrics: {},
      blockchain_metrics: {},
      waste_categories: {},
      environmental_impact: {},
      confidence_scores: [],
      user_stats: {}, // user:{userId}:stats
      collector_stats: {}, // collector:{collectorId}:stats
      events: {} // events:{type}:{date}
    };

    this.consumer = this.kafka.consumer({ groupId: 'analytics-group' });
    this.producer = this.kafka.producer();

    this.setupRoutes();
  }

  async initialize() {
    try {
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
        this.store.user_actions++;
        // await this.trackUserActivity(userId, metadata);
        break;
      case 'ai_detection':
        this.store.ai_detections++;
        // await this.updateAccuracyMetrics(metadata.accuracy);
        break;
      case 'route_optimization':
        this.store.route_optimizations++;
        // await this.trackRouteEfficiency(metadata);
        break;
    }

    // Store event for historical analysis
    await this.storeEvent(type, data);
  }

  async processWasteDetectionResult(data) {
    const { userId, result, processingTime } = data;

    // Track AI performance metrics
    this.incrementHash('ai_metrics', 'total_detections', 1);
    this.incrementHash('ai_metrics', 'total_processing_time', processingTime);

    if (result.confidence) {
      this.store.confidence_scores.unshift(result.confidence);
      if (this.store.confidence_scores.length > 1000) {
        this.store.confidence_scores.pop();
      }
    }

    // Track waste categories
    if (result.category) {
      this.incrementHash('waste_categories', result.category, 1);
    }

    // User-specific analytics
    this.incrementUserStats(userId, 'detections', 1);

    console.log('📊 Processed waste detection analytics');
  }

  async processRouteOptimizationResult(data) {
    const { collectorId, metrics, pickupCount } = data;

    if (metrics) {
      // Track route efficiency
      this.incrementHash('route_metrics', 'total_routes', 1);
      this.incrementHash('route_metrics', 'total_distance', Math.round(metrics.totalDistance));
      this.incrementHash('route_metrics', 'total_cost_saved', Math.round(metrics.fuelCost));

      // Environmental impact
      if (metrics.co2Emissions) {
        this.incrementHash('environmental_impact', 'co2_reduced', Math.round(metrics.co2Emissions));
      }
    }

    // Collector performance
    this.incrementCollectorStats(collectorId, 'routes_completed', 1);
    this.incrementCollectorStats(collectorId, 'pickups_handled', pickupCount || 0);

    console.log('📊 Processed route optimization analytics');
  }

  async processBlockchainEvent(data) {
    const { type, userId, amount } = data;

    // Track blockchain activity
    this.incrementHash('blockchain_metrics', 'total_transactions', 1);

    if (amount) {
      this.incrementHash('blockchain_metrics', 'total_rewards', amount);
    }

    // User rewards
    this.incrementUserStats(userId, 'rewards_earned', amount || 0);

    console.log('📊 Processed blockchain analytics');
  }

  async getRealTimeMetrics() {
    const aiMetrics = this.store.ai_metrics;
    const routeMetrics = this.store.route_metrics;
    const blockchainMetrics = this.store.blockchain_metrics;

    return {
      realTimeCounters: {
        userActions: this.store.user_actions,
        aiDetections: this.store.ai_detections,
        routeOptimizations: this.store.route_optimizations
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
    const wasteCategories = this.store.waste_categories;
    const environmentalImpact = this.store.environmental_impact;

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
    const userStats = this.store.user_stats[userId] || {};

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
    const impact = this.store.environmental_impact;

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
  incrementHash(hashName, field, value) {
    if (!this.store[hashName][field]) {
      this.store[hashName][field] = 0;
    }
    this.store[hashName][field] += value;
  }

  incrementUserStats(userId, field, value) {
    if (!this.store.user_stats[userId]) {
      this.store.user_stats[userId] = {};
    }
    if (!this.store.user_stats[userId][field]) {
      this.store.user_stats[userId][field] = 0;
    }
    this.store.user_stats[userId][field] += value;
  }

  incrementCollectorStats(collectorId, field, value) {
    if (!this.store.collector_stats[collectorId]) {
      this.store.collector_stats[collectorId] = {};
    }
    if (!this.store.collector_stats[collectorId][field]) {
      this.store.collector_stats[collectorId][field] = 0;
    }
    this.store.collector_stats[collectorId][field] += value;
  }

  async storeEvent(type, data) {
    const dateStr = new Date().toISOString().split('T')[0];
    const eventKey = `${type}:${dateStr}`;

    if (!this.store.events[eventKey]) {
      this.store.events[eventKey] = [];
    }
    this.store.events[eventKey].push(JSON.stringify(data));
  }

  calculateAverageProcessingTime(aiMetrics) {
    const total = parseInt(aiMetrics.total_processing_time) || 0;
    const count = parseInt(aiMetrics.total_detections) || 1;
    return Math.round(total / count);
  }

  async calculateAverageConfidence() {
    const scores = this.store.confidence_scores;
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

      const eventKey = `ai_detection:${dateStr}`;
      const dailyEvents = this.store.events[eventKey] ? this.store.events[eventKey].length : 0;
      trends[dateStr] = dailyEvents;
    }

    return trends;
  }

  async getTopPerformers() {
    // Sort users by detections
    const topDetectors = await this.getTopUsersByMetric('detections');
    const topEarners = await this.getTopUsersByMetric('rewards_earned');

    return {
      topDetector: topDetectors[0] ? topDetectors[0].userId : 'N/A',
      topCollector: 'collector456', // Placeholder for collector logic
      mostImproved: 'user789' // Placeholder
    };
  }

  async getUserRank(userId) {
    const topDetectors = await this.getTopUsersByMetric('detections');
    const rank = topDetectors.findIndex(u => u.userId === userId) + 1;
    return rank > 0 ? rank : topDetectors.length + 1;
  }

  async getUserAchievements(userId) {
    const stats = this.store.user_stats[userId] || {};
    const achievements = [];

    if (stats.detections > 0) achievements.push('First Detection');
    if (stats.detections > 100) achievements.push('Recycling Champion');
    if (stats.rewards_earned > 500) achievements.push('Eco Warrior');

    return achievements;
  }

  async getUserEnvironmentalImpact(userId) {
    const stats = this.store.user_stats[userId] || {};
    const detections = stats.detections || 0;

    // Estimated impact based on detections
    return {
      co2Saved: Math.round(detections * 0.5), // 0.5kg per detection
      wasteProcessed: detections,
      treesEquivalent: Math.round((detections * 0.5) / 21)
    };
  }

  async getTopUsersByMetric(metric) {
    const users = Object.entries(this.store.user_stats).map(([userId, stats]) => ({
      userId,
      value: stats[metric] || 0
    }));

    return users.sort((a, b) => b.value - a.value).slice(0, 10);
  }

  async getTotalWasteProcessed() {
    const categories = this.store.waste_categories;
    return Object.values(categories).reduce((sum, count) => sum + parseInt(count), 0);
  }

  async getOverallRecyclingRate() {
    const categories = this.store.waste_categories;
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