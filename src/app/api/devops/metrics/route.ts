import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate real-time metrics (in production, these would come from actual monitoring tools)
    const services = [
      {
        name: 'EcoEarn Main App',
        status: 'healthy',
        uptime: '7d 12h 45m',
        responseTime: 45,
        version: 'v1.0.0'
      },
      {
        name: 'AI Worker Service',
        status: 'healthy',
        uptime: '7d 12h 43m',
        responseTime: 123,
        version: 'v1.2.1'
      },
      {
        name: 'Route Optimization',
        status: 'healthy',
        uptime: '7d 12h 43m',
        responseTime: 89,
        version: 'v1.1.0'
      },
      {
        name: 'Analytics Service',
        status: 'healthy',
        uptime: '7d 12h 42m',
        responseTime: 67,
        version: 'v1.0.3'
      },
      {
        name: 'Notification Service',
        status: 'healthy',
        uptime: '7d 12h 41m',
        responseTime: 34,
        version: 'v1.0.2'
      },
      {
        name: 'PostgreSQL Database',
        status: 'healthy',
        uptime: '15d 3h 22m',
        responseTime: 12,
        version: '15.2'
      }
    ];

    const kafka = {
      brokerStatus: 'connected' as const,
      topics: 6,
      messagesPerSecond: Math.floor(Math.random() * 1000) + 500,
      consumerGroups: 4
    };

    const containers = [
      {
        name: 'ecoearn-app',
        status: 'running' as const,
        cpu: Math.floor(Math.random() * 30) + 10,
        memory: Math.floor(Math.random() * 40) + 20,
        restarts: 0
      },
      {
        name: 'ai-worker',
        status: 'running' as const,
        cpu: Math.floor(Math.random() * 50) + 30,
        memory: Math.floor(Math.random() * 50) + 40,
        restarts: 0
      },
      {
        name: 'route-worker',
        status: 'running' as const,
        cpu: Math.floor(Math.random() * 40) + 20,
        memory: Math.floor(Math.random() * 35) + 25,
        restarts: 0
      },
      {
        name: 'analytics',
        status: 'running' as const,
        cpu: Math.floor(Math.random() * 25) + 15,
        memory: Math.floor(Math.random() * 30) + 20,
        restarts: 0
      },
      {
        name: 'notifications',
        status: 'running' as const,
        cpu: Math.floor(Math.random() * 20) + 10,
        memory: Math.floor(Math.random() * 25) + 15,
        restarts: 0
      },
      {
        name: 'kafka',
        status: 'running' as const,
        cpu: Math.floor(Math.random() * 35) + 15,
        memory: Math.floor(Math.random() * 45) + 30,
        restarts: 0
      },
      {
        name: 'postgres',
        status: 'running' as const,
        cpu: Math.floor(Math.random() * 20) + 10,
        memory: Math.floor(Math.random() * 40) + 25,
        restarts: 0
      },

    ];

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      services,
      kafka,
      containers
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
