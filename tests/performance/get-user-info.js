import { check, sleep } from "k6";
import apiInstance, { getAuthToken } from "../utils/apiInstance.js";
import { commonChecks, parseJson } from "../utils/helpers.js";
import { endpoints } from "../../config/config.js";

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
    api: "get-user-info",
    environment: __ENV.ENVIRONMENT || "local",
  },
};

export function setup() {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Failed to get authentication token");
  }
  return { token };
}

export default function (data) {
  const response = apiInstance.get(
    endpoints.user.get,
    { tags: { name: "get-user-info" } },
    data.token
  );

  check(
    response,
    Object.assign(
      {},
      commonChecks.is200,
      commonChecks.hasBody,
      commonChecks.isJson,
      commonChecks.responseTimeLessThan(500),
      {
        "has userId": (r) => {
          const body = parseJson(r);
          return body && body.userId !== undefined;
        },
        "has email": (r) => {
          const body = parseJson(r);
          return body && body.email !== undefined;
        },
        "has displayName": (r) => {
          const body = parseJson(r);
          return body && body.displayName !== undefined;
        },
      }
    )
  );

  sleep(1);
}
