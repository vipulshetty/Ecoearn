import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Spike to 200 users
    { duration: '3m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],  // Error rate under 1%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test health endpoint
  let healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test metrics endpoint
  let metricsRes = http.get(`${BASE_URL}/api/metrics`);
  check(metricsRes, {
    'metrics status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test DevOps dashboard data
  let devopsRes = http.get(`${BASE_URL}/api/devops/metrics`);
  check(devopsRes, {
    'devops metrics status is 200': (r) => r.status === 200,
    'devops metrics has services': (r) => {
      try {
        const json = JSON.parse(r.body);
        return json.services && json.services.length > 0;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);

  sleep(2);
}

// Setup function runs once before the test
export function setup() {
  console.log('🚀 Starting load test...');
  console.log(`Target URL: ${BASE_URL}`);
}

// Teardown function runs once after the test
export function teardown(data) {
  console.log('✅ Load test completed!');
}
