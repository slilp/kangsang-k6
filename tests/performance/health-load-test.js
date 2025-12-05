import { check, sleep } from "k6";
import apiSecureInstance from "../utils/apiSecureInstance.js";

/**
 * Performance Test: Health Check Load Test
 * Tests the /health endpoint to ensure system is healthy under load
 */

export const options = {
  stages: [
    { duration: "5s", target: 10 }, // Ramp up to 10 users over 5 seconds
    { duration: "5s", target: 10 }, // Stay at 10 users for 5 seconds
    { duration: "5s", target: 0 }, // Ramp down to 0 users over 5 seconds
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
  },
  tags: {
    test_type: "load",
    api: "health",
    environment: __ENV.ENVIRONMENT || "local",
  },
};

export default function () {
  const response = apiSecureInstance.get("/health", {
    tags: { name: "health_check" },
  });

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response has status field": (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status !== undefined;
      } catch (e) {
        return false;
      }
    },
    'status is "healthy"': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === "healthy";
      } catch (e) {
        return false;
      }
    },
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1);
}
