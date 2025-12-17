'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  responseTime: number;
  version: string;
}

interface KafkaMetrics {
  brokerStatus: 'connected' | 'disconnected';
  topics: number;
  messagesPerSecond: number;
  consumerGroups: number;
}

interface ContainerMetrics {
  name: string;
  cpu: number;
  memory: number;
  status: 'running' | 'stopped';
  restarts: number;
}

export default function DevOpsDashboard() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [kafkaMetrics, setKafkaMetrics] = useState<KafkaMetrics | null>(null);
  const [containers, setContainers] = useState<ContainerMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/devops/metrics');
      const data = await response.json();
      
      setServices(data.services || []);
      setKafkaMetrics(data.kafka || null);
      setContainers(data.containers || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
      case 'connected':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
      case 'stopped':
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-24 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">⚙️ DevOps Dashboard</h1>
            <p className="text-slate-400">Real-time Infrastructure Monitoring & Metrics</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                autoRefresh 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
            </button>
            <button
              onClick={fetchMetrics}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              🔄 Refresh Now
            </button>
            <Link href="/" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Architecture Overview */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-2xl font-bold mb-4">🏗️ System Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-3xl mb-2">🐳</div>
              <div className="font-bold">Docker</div>
              <div className="text-sm text-slate-400">Containerization</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-3xl mb-2">☸️</div>
              <div className="font-bold">Kubernetes</div>
              <div className="text-sm text-slate-400">Orchestration</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-bold">Kafka</div>
              <div className="text-sm text-slate-400">Event Streaming</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-3xl mb-2">📈</div>
              <div className="font-bold">Prometheus</div>
              <div className="text-sm text-slate-400">Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading metrics...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Service Health */}
          <section>
            <h2 className="text-2xl font-bold mb-4">🏥 Service Health Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.length > 0 ? (
                services.map((service, index) => (
                  <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{service.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(service.status)} text-white`}>
                        {service.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Uptime:</span>
                        <span className="font-semibold">{service.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Response Time:</span>
                        <span className="font-semibold">{service.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Version:</span>
                        <span className="font-semibold">{service.version}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 bg-slate-800/50 rounded-xl p-8 text-center text-slate-400">
                  No service data available. Start services with: <code className="bg-slate-900 px-2 py-1 rounded">docker-compose up</code>
                </div>
              )}
            </div>
          </section>

          {/* Kafka Metrics */}
          <section>
            <h2 className="text-2xl font-bold mb-4">📊 Kafka Event Stream Metrics</h2>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              {kafkaMetrics ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(kafkaMetrics.brokerStatus)} mb-2`}>
                      {kafkaMetrics.brokerStatus === 'connected' ? '✅ Connected' : '❌ Disconnected'}
                    </div>
                    <div className="text-sm text-slate-400">Broker Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{kafkaMetrics.topics}</div>
                    <div className="text-sm text-slate-400">Active Topics</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{kafkaMetrics.messagesPerSecond}</div>
                    <div className="text-sm text-slate-400">Messages/sec</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">{kafkaMetrics.consumerGroups}</div>
                    <div className="text-sm text-slate-400">Consumer Groups</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-4">
                  Kafka metrics unavailable. Ensure Kafka is running.
                </div>
              )}
            </div>
          </section>

          {/* Container Metrics */}
          <section>
            <h2 className="text-2xl font-bold mb-4">🐳 Container Resource Usage</h2>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Container</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">CPU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Memory</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Restarts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {containers.length > 0 ? (
                    containers.map((container, index) => (
                      <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">{container.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(container.status)}`}>
                            {container.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-slate-700 rounded-full h-2 mr-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${container.cpu}%` }}></div>
                            </div>
                            <span className="text-sm">{container.cpu}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-slate-700 rounded-full h-2 mr-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${container.memory}%` }}></div>
                            </div>
                            <span className="text-sm">{container.memory}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`font-semibold ${container.restarts > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {container.restarts}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        No container data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* DevOps Features List */}
          <section>
            <h2 className="text-2xl font-bold mb-4">🚀 Implemented DevOps Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold mb-3 text-green-400">✅ Container Orchestration</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Kubernetes with HPA (3-10 replicas)</li>
                  <li>• Docker multi-stage builds</li>
                  <li>• ConfigMaps & Secrets management</li>
                  <li>• Rolling updates & health checks</li>
                  <li>• Resource limits & requests</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold mb-3 text-blue-400">✅ Event-Driven Architecture</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Apache Kafka message broker</li>
                  <li>• 4 microservices (AI, Route, Analytics, Notifications)</li>
                  <li>• Producer-consumer patterns</li>
                  <li>• Message persistence & replay</li>
                  <li>• Consumer group management</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold mb-3 text-purple-400">✅ Monitoring & Observability</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Prometheus metrics collection</li>
                  <li>• Grafana dashboards</li>
                  <li>• Health check endpoints</li>
                  <li>• Service discovery</li>
                  <li>• Alerting rules</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold mb-3 text-yellow-400">✅ CI/CD & Automation</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• GitHub Actions pipelines</li>
                  <li>• Multi-environment deployment</li>
                  <li>• Automated testing</li>
                  <li>• Infrastructure as Code</li>
                  <li>• Kustomize overlays (dev/prod)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <section>
            <h2 className="text-2xl font-bold mb-4">🔗 Quick Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer" 
                 className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-green-500 transition-colors text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-bold">Kafka UI</div>
                <div className="text-xs text-slate-400 mt-1">:8080</div>
              </a>
              <a href="http://localhost:9090" target="_blank" rel="noopener noreferrer"
                 className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors text-center">
                <div className="text-2xl mb-2">📈</div>
                <div className="font-bold">Prometheus</div>
                <div className="text-xs text-slate-400 mt-1">:9090</div>
              </a>
              <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer"
                 className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition-colors text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-bold">Grafana</div>
                <div className="text-xs text-slate-400 mt-1">:3001</div>
              </a>
              <Link href="/api/health"
                 className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-yellow-500 transition-colors text-center">
                <div className="text-2xl mb-2">🏥</div>
                <div className="font-bold">Health API</div>
                <div className="text-xs text-slate-400 mt-1">/api/health</div>
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
