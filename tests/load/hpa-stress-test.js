import http from 'k6/http';
import { check, sleep } from 'k6';

// Stress test to validate HPA (Horizontal Pod Autoscaler)
export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Ramp to 100 users
    { duration: '3m', target: 500 },   // Spike to 500 users (trigger HPA)
    { duration: '5m', target: 500 },   // Maintain load
    { duration: '3m', target: 1000 },  // Spike to 1000 users
    { duration: '5m', target: 1000 },  // Maintain high load
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<2000'], // 99% under 2s during stress
    http_req_failed: ['rate<0.05'],    // Less than 5% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Simulate real user behavior
  const endpoints = [
    '/api/health',
    '/api/metrics',
    '/api/devops/metrics',
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(`${BASE_URL}${endpoint}`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time acceptable': (r) => r.timings.duration < 3000,
  });

  sleep(Math.random() * 2 + 1); // Random sleep 1-3 seconds
}

export function setup() {
  console.log('🔥 Starting HPA stress test...');
  console.log('This test will trigger Kubernetes HPA scaling');
  console.log(`Target: ${BASE_URL}`);
  console.log('Expected: Pods should scale from 3 to 10 replicas');
}

export function teardown() {
  console.log('✅ HPA stress test completed');
  console.log('Check kubectl: kubectl get hpa -n ecoearn');
}
