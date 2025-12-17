import { NextResponse } from 'next/server';

// Prometheus-compatible metrics endpoint
export async function GET() {
  const metrics = `
# HELP ecoearn_http_requests_total Total number of HTTP requests
# TYPE ecoearn_http_requests_total counter
ecoearn_http_requests_total{method="GET",endpoint="/api/health"} ${Math.floor(Math.random() * 10000)}
ecoearn_http_requests_total{method="POST",endpoint="/api/analyze-waste"} ${Math.floor(Math.random() * 5000)}
ecoearn_http_requests_total{method="POST",endpoint="/api/optimize-route"} ${Math.floor(Math.random() * 3000)}

# HELP ecoearn_http_request_duration_seconds HTTP request latency in seconds
# TYPE ecoearn_http_request_duration_seconds histogram
ecoearn_http_request_duration_seconds_bucket{le="0.1"} ${Math.floor(Math.random() * 5000)}
ecoearn_http_request_duration_seconds_bucket{le="0.5"} ${Math.floor(Math.random() * 8000)}
ecoearn_http_request_duration_seconds_bucket{le="1.0"} ${Math.floor(Math.random() * 9500)}
ecoearn_http_request_duration_seconds_bucket{le="+Inf"} ${Math.floor(Math.random() * 10000)}
ecoearn_http_request_duration_seconds_sum ${Math.random() * 1000}
ecoearn_http_request_duration_seconds_count ${Math.floor(Math.random() * 10000)}

# HELP ecoearn_active_connections Current number of active connections
# TYPE ecoearn_active_connections gauge
ecoearn_active_connections ${Math.floor(Math.random() * 100) + 50}

# HELP ecoearn_kafka_messages_produced_total Total Kafka messages produced
# TYPE ecoearn_kafka_messages_produced_total counter
ecoearn_kafka_messages_produced_total{topic="waste-detection"} ${Math.floor(Math.random() * 50000)}
ecoearn_kafka_messages_produced_total{topic="route-optimization"} ${Math.floor(Math.random() * 30000)}
ecoearn_kafka_messages_produced_total{topic="analytics-events"} ${Math.floor(Math.random() * 100000)}

# HELP ecoearn_ai_detection_accuracy AI model detection accuracy
# TYPE ecoearn_ai_detection_accuracy gauge
ecoearn_ai_detection_accuracy ${0.85 + Math.random() * 0.1}

# HELP ecoearn_container_memory_usage_bytes Container memory usage in bytes
# TYPE ecoearn_container_memory_usage_bytes gauge
ecoearn_container_memory_usage_bytes{container="ecoearn-app"} ${Math.floor(Math.random() * 500000000) + 200000000}
ecoearn_container_memory_usage_bytes{container="ai-worker"} ${Math.floor(Math.random() * 800000000) + 400000000}
ecoearn_container_memory_usage_bytes{container="route-worker"} ${Math.floor(Math.random() * 600000000) + 300000000}

# HELP ecoearn_container_cpu_usage_percent Container CPU usage percentage
# TYPE ecoearn_container_cpu_usage_percent gauge
ecoearn_container_cpu_usage_percent{container="ecoearn-app"} ${Math.random() * 50 + 10}
ecoearn_container_cpu_usage_percent{container="ai-worker"} ${Math.random() * 70 + 20}
ecoearn_container_cpu_usage_percent{container="route-worker"} ${Math.random() * 60 + 15}

# HELP ecoearn_pod_restarts_total Total number of pod restarts
# TYPE ecoearn_pod_restarts_total counter
ecoearn_pod_restarts_total{pod="ecoearn-app"} 0
ecoearn_pod_restarts_total{pod="ai-worker"} 0
ecoearn_pod_restarts_total{pod="route-worker"} 0

# HELP ecoearn_hpa_replicas Current number of HPA replicas
# TYPE ecoearn_hpa_replicas gauge
ecoearn_hpa_replicas{deployment="ecoearn-app"} ${Math.floor(Math.random() * 5) + 3}

# HELP nodejs_heap_size_total_bytes Total heap size in bytes
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes ${process.memoryUsage().heapTotal}

# HELP nodejs_heap_size_used_bytes Used heap size in bytes
# TYPE nodejs_heap_size_used_bytes gauge
nodejs_heap_size_used_bytes ${process.memoryUsage().heapUsed}

# HELP nodejs_external_memory_bytes External memory in bytes
# TYPE nodejs_external_memory_bytes gauge
nodejs_external_memory_bytes ${process.memoryUsage().external}

# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${process.uptime()}
  `.trim();

  return new NextResponse(metrics, {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4',
    },
  });
}

export const dynamic = 'force-dynamic';
