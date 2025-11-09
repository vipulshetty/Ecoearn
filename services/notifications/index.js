const { Kafka } = require('kafkajs');
const nodemailer = require('nodemailer');
const webpush = require('web-push');

class NotificationService {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'notification-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
    });
    
    this.consumer = this.kafka.consumer({ groupId: 'notification-group' });
    
    // Setup email transporter (using free Gmail SMTP)
    this.emailTransporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS // Use app password for Gmail
      }
    });
    
    // Setup web push (free)
    webpush.setVapidDetails(
      'mailto:your-email@example.com',
      process.env.VAPID_PUBLIC_KEY || 'your-vapid-public-key',
      process.env.VAPID_PRIVATE_KEY || 'your-vapid-private-key'
    );
  }

  async initialize() {
    try {
      await this.consumer.connect();
      
      await this.consumer.subscribe({ 
        topics: [
          'notification-requests',
          'waste-detection-results',
          'route-optimization-results',
          'blockchain-events',
          'user-achievements'
        ]
      });
      
      console.log('📬 Notification Service initialized');
      this.startProcessing();
      
    } catch (error) {
      console.error('❌ Notification Service initialization failed:', error);
    }
  }

  async startProcessing() {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          console.log(`📨 Processing notification: ${topic}`);
          
          switch (topic) {
            case 'notification-requests':
              await this.processNotificationRequest(data);
              break;
            case 'waste-detection-results':
              await this.notifyWasteDetectionComplete(data);
              break;
            case 'route-optimization-results':
              await this.notifyRouteOptimized(data);
              break;
            case 'blockchain-events':
              await this.notifyBlockchainEvent(data);
              break;
            case 'user-achievements':
              await this.notifyAchievement(data);
              break;
          }
        } catch (error) {
          console.error('❌ Notification processing error:', error);
        }
      },
    });
  }

  async processNotificationRequest(data) {
    const { type, recipient, message, channels } = data;
    
    console.log(`📤 Sending ${type} notification to ${recipient}`);
    
    const notifications = [];
    
    if (channels.includes('email')) {
      notifications.push(this.sendEmail(recipient, message));
    }
    
    if (channels.includes('push')) {
      notifications.push(this.sendPushNotification(recipient, message));
    }
    
    if (channels.includes('sms')) {
      notifications.push(this.sendSMS(recipient, message));
    }
    
    await Promise.allSettled(notifications);
  }

  async notifyWasteDetectionComplete(data) {
    const { userId, result, processingTime } = data;
    
    const message = {
      subject: '🎯 Waste Detection Complete!',
      body: `Your waste has been analyzed! 
      
Category: ${result.category}
Confidence: ${Math.round(result.confidence * 100)}%
Points Earned: ${result.recommendations?.points || 0}
Processing Time: ${processingTime}ms

${result.recommendations?.disposal || 'Check the app for disposal instructions'}

Keep up the great work! 🌱`,
      data: {
        category: result.category,
        confidence: result.confidence,
        points: result.recommendations?.points
      }
    };

    await this.sendNotificationToUser(userId, message, ['push', 'email']);
  }

  async notifyRouteOptimized(data) {
    const { collectorId, metrics } = data;
    
    const message = {
      subject: '🗺️ Route Optimized',
      body: `Your collection route has been optimized!
      
Distance: ${metrics.totalDistance}km
Estimated Time: ${metrics.totalTime} minutes
Fuel Cost: $${metrics.fuelCost}
CO2 Reduced: ${metrics.co2Emissions}kg

Ready to start collecting! 🚛`,
      data: {
        distance: metrics.totalDistance,
        time: metrics.totalTime,
        cost: metrics.fuelCost
      }
    };

    await this.sendNotificationToUser(collectorId, message, ['push', 'sms']);
  }

  async notifyBlockchainEvent(data) {
    const { type, userId, amount, transactionHash } = data;
    
    let message;
    
    switch (type) {
      case 'reward_minted':
        message = {
          subject: '🎉 Rewards Earned!',
          body: `Congratulations! You've earned ${amount} ECO tokens!
          
Transaction: ${transactionHash}
These tokens can be redeemed in the marketplace.

Keep recycling to earn more! ♻️`,
          data: { amount, transactionHash }
        };
        break;
        
      case 'nft_created':
        message = {
          subject: '🎨 NFT Minted!',
          body: `Amazing! Your waste recycling achievement has been minted as an NFT!
          
This unique digital collectible represents your environmental contribution.

View in your wallet: ${transactionHash}

You're making a difference! 🌍`,
          data: { transactionHash }
        };
        break;
        
      case 'transaction_confirmed':
        message = {
          subject: '✅ Transaction Confirmed',
          body: `Your blockchain transaction has been confirmed!
          
Transaction Hash: ${transactionHash}
Amount: ${amount} ECO

The tokens are now available in your wallet.`,
          data: { amount, transactionHash }
        };
        break;
    }

    if (message) {
      await this.sendNotificationToUser(userId, message, ['push', 'email']);
    }
  }

  async notifyAchievement(data) {
    const { userId, achievement, level } = data;
    
    const message = {
      subject: '🏆 Achievement Unlocked!',
      body: `Congratulations! You've unlocked: ${achievement}
      
Level: ${level}
You're becoming an eco champion! 

Check your profile to see all your achievements.

Keep up the amazing work! 🌟`,
      data: { achievement, level }
    };

    await this.sendNotificationToUser(userId, message, ['push']);
  }

  async sendNotificationToUser(userId, message, channels) {
    // In a real app, you'd fetch user preferences and contact info from database
    const userPreferences = await this.getUserNotificationPreferences(userId);
    
    const notifications = [];
    
    if (channels.includes('email') && userPreferences.email) {
      notifications.push(this.sendEmail(userPreferences.email, message));
    }
    
    if (channels.includes('push') && userPreferences.pushSubscription) {
      notifications.push(this.sendPushNotification(userPreferences.pushSubscription, message));
    }
    
    if (channels.includes('sms') && userPreferences.phone) {
      notifications.push(this.sendSMS(userPreferences.phone, message));
    }
    
    await Promise.allSettled(notifications);
  }

  async sendEmail(email, message) {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: message.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">EcoeEarn</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${message.body}</pre>
            </div>
            <div style="padding: 20px; text-align: center; background-color: #e8e8e8;">
              <p style="margin: 0; color: #666;">
                Keep making a difference! 🌱
                <br>
                <a href="https://your-vercel-app.vercel.app" style="color: #667eea;">Open EcoeEarn App</a>
              </p>
            </div>
          </div>
        `
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully to:', email);
    } catch (error) {
      console.error('❌ Email sending failed:', error);
    }
  }

  async sendPushNotification(subscription, message) {
    try {
      const payload = JSON.stringify({
        title: message.subject,
        body: message.body.substring(0, 100) + '...', // Truncate for push
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: message.data,
        actions: [
          {
            action: 'view',
            title: 'View Details'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      });

      await webpush.sendNotification(subscription, payload);
      console.log('📱 Push notification sent successfully');
    } catch (error) {
      console.error('❌ Push notification failed:', error);
    }
  }

  async sendSMS(phone, message) {
    try {
      // Using free SMS services (you can integrate Twilio trial or other free services)
      console.log(`📱 SMS would be sent to ${phone}: ${message.subject}`);
      // Implement actual SMS sending with your preferred service
    } catch (error) {
      console.error('❌ SMS sending failed:', error);
    }
  }

  async getUserNotificationPreferences(userId) {
    // Mock user preferences - in real app, fetch from database
    return {
      email: `user${userId}@example.com`,
      phone: '+1234567890',
      pushSubscription: {
        endpoint: 'https://fcm.googleapis.com/fcm/send/example',
        keys: {
          p256dh: 'example-p256dh-key',
          auth: 'example-auth-key'
        }
      },
      preferences: {
        email: true,
        push: true,
        sms: false
      }
    };
  }

  // Email templates for different notification types
  getEmailTemplate(type, data) {
    const templates = {
      welcome: `
        Welcome to EcoeEarn! 🎉
        
        Start earning rewards by recycling waste and making a positive environmental impact.
        
        Get started by uploading your first waste photo!
      `,
      
      weekly_summary: `
        Your Weekly EcoImpact Summary 📊
        
        Detections: ${data.detections}
        Points Earned: ${data.points}
        CO2 Reduced: ${data.co2}kg
        
        You're ranked #${data.rank} this week!
      `,
      
      milestone: `
        Milestone Achievement! 🏆
        
        You've reached ${data.milestone}!
        
        Special reward: ${data.reward}
      `
    };
    
    return templates[type] || 'EcoeEarn Notification';
  }
}

const notificationService = new NotificationService();
notificationService.initialize().catch(console.error);

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down Notification Service...');
  process.exit(0);
});

module.exports = NotificationService;