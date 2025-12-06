import { check, sleep } from "k6";
import apiInstance from "../utils/apiInstance.js";
import { endpoints } from "../../config/config.js";
import {
  commonChecks,
  randomEmail,
  randomString,
  parseJson,
} from "../utils/helpers.js";

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
    api: "post-register",
    environment: __ENV.ENVIRONMENT || "local",
  },
};

export default function () {
  const payload = {
    email: randomEmail(),
    password: `Test@${randomString(12)}`,
    displayName: `Test User ${randomString(5)}`,
  };

  const response = apiInstance.post(endpoints.auth.register, payload, {
    tags: { name: "post_register" },
  });

  check(
    response,
    Object.assign(
      {},
      commonChecks.is201,
      commonChecks.responseTimeLessThan(500)
    )
  );

  sleep(1);
}
