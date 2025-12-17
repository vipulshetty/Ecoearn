import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: await checkDatabase(),
      kafka: await checkKafka(),
    },
    responseTime: 0
  };

  health.responseTime = Date.now() - startTime;

  const allHealthy = Object.values(health.services).every(s => s.status === 'healthy');
  const statusCode = allHealthy ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}

async function checkDatabase() {
  try {
    // In production, do actual DB health check
    // For now, simulate
    return {
      status: 'healthy',
      responseTime: Math.floor(Math.random() * 20) + 5,
      connections: Math.floor(Math.random() * 50) + 10
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: 'Connection failed'
    };
  }
}

async function checkKafka() {
  try {
    // In production, check Kafka connection
    return {
      status: 'healthy',
      responseTime: Math.floor(Math.random() * 30) + 10,
      brokers: 1
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: 'Broker unavailable'
    };
  }
}

export const dynamic = 'force-dynamic';
