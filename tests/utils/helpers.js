import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

/**
 * Common helper utilities for K6 tests
 */

// Custom metrics
export const errorRate = new Rate('error_rate');
export const successRate = new Rate('success_rate');
export const requestDuration = new Trend('request_duration');
export const failedRequests = new Counter('failed_requests');

/**
 * Enhanced check function with custom metrics
 * @param {object} response - HTTP response object
 * @param {object} checks - Check conditions
 * @param {string} requestName - Name of the request for logging
 * @returns {boolean} - Whether all checks passed
 */
export function enhancedCheck(response, checks, requestName = 'request') {
  const result = check(response, checks);

  // Track metrics
  errorRate.add(!result);
  successRate.add(result);
  requestDuration.add(response.timings.duration);

  if (!result) {
    failedRequests.add(1);
    console.error(`[${requestName}] Check failed - Status: ${response.status}, Body: ${response.body.substring(0, 200)}`);
  }

  return result;
}

/**
 * Random sleep with configurable min and max duration
 * @param {number} min - Minimum sleep duration in seconds
 * @param {number} max - Maximum sleep duration in seconds
 */
export function randomSleep(min, max) {
  const duration = Math.random() * (max - min) + min;
  sleep(duration);
}

/**
 * Generate random string
 * @param {number} length - Length of the string
 * @returns {string} - Random string
 */
export function randomString(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random email
 * @param {string} domain - Email domain (default: 'example.com')
 * @returns {string} - Random email address
 */
export function randomEmail(domain = 'example.com') {
  return `user_${randomString(8)}@${domain}`;
}

/**
 * Common check functions for HTTP responses
 */
export const commonChecks = {
  is200: {
    'status is 200': (r) => r.status === 200,
  },
  is201: {
    'status is 201': (r) => r.status === 201,
  },
  is2xx: {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
  },
  hasBody: {
    'has response body': (r) => r.body && r.body.length > 0,
  },
  isJson: {
    'response is JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  },
  responseTimeLessThan: (ms) => ({
    [`response time < ${ms}ms`]: (r) => r.timings.duration < ms,
  }),
};

/**
 * Combine multiple check objects
 * @param  {...object} checks - Check objects to combine
 * @returns {object} - Combined checks object
 */
export function combineChecks(...checks) {
  return Object.assign({}, ...checks);
}

/**
 * Parse JSON response safely
 * @param {object} response - HTTP response
 * @returns {object|null} - Parsed JSON or null if parsing fails
 */
export function parseJson(response) {
  try {
    return JSON.parse(response.body);
  } catch (error) {
    console.error(`Failed to parse JSON: ${error}`);
    return null;
  }
}

/**
 * Generate test data for creating resources
 * @param {string} resourceType - Type of resource (user, product, etc.)
 * @returns {object} - Test data object
 */
export function generateTestData(resourceType) {
  const timestamp = Date.now();

  const dataGenerators = {
    user: () => ({
      username: `testuser_${timestamp}_${randomString(6)}`,
      email: `test_${timestamp}@example.com`,
      password: 'Test@1234',
      firstName: 'Test',
      lastName: 'User',
    }),
    product: () => ({
      name: `Product ${timestamp}`,
      description: `Test product created at ${new Date().toISOString()}`,
      price: randomInt(10, 1000),
      sku: `SKU-${randomString(8).toUpperCase()}`,
      quantity: randomInt(1, 100),
    }),
    order: () => ({
      orderNumber: `ORD-${timestamp}-${randomString(6)}`,
      totalAmount: randomInt(100, 5000),
      status: 'pending',
      items: [],
    }),
  };

  return dataGenerators[resourceType]
    ? dataGenerators[resourceType]()
    : { id: timestamp, name: `${resourceType}_${randomString(8)}` };
}

/**
 * Log test summary
 * @param {object} data - Test data from handleSummary
 */
export function logTestSummary(data) {
  console.log('====================');
  console.log('Test Summary');
  console.log('====================');
  console.log(`Duration: ${data.state.testRunDurationMs}ms`);
  console.log(`VUs: ${data.options.scenarios?.default?.vus || 'N/A'}`);
  console.log(`Iterations: ${data.metrics.iterations?.values?.count || 0}`);
  console.log(`HTTP Requests: ${data.metrics.http_reqs?.values?.count || 0}`);
  console.log(`Failed Requests: ${data.metrics.http_req_failed?.values?.rate * 100 || 0}%`);
  console.log('====================');
}
