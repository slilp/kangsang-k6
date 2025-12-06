import { group, check, sleep } from "k6";
import apiInstance from "../utils/apiInstance.js";
import { endpoints } from "../../config/config.js";
import {
  commonChecks,
  randomEmail,
  randomString,
  parseJson,
} from "../utils/helpers.js";

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
  },
  tags: {
    test_type: "regression",
    api: "auth",
    environment: __ENV.ENVIRONMENT || "local",
  },
};

export default function () {
  let userEmail;
  let userPassword;
  let accessToken;

  group("Register New User", function () {
    userEmail = randomEmail();
    userPassword = `Test@${randomString(12)}`;

    const registerPayload = {
      email: userEmail,
      password: userPassword,
      displayName: `Test User ${randomString(5)}`,
    };

    const registerResponse = apiInstance.post(
      endpoints.auth.register,
      registerPayload,
      {
        tags: { name: "register" },
      }
    );

    check(registerResponse, Object.assign({}, commonChecks.is201));
  });

  group("Login with Registered User", function () {
    const loginPayload = {
      email: userEmail,
      password: userPassword,
    };

    const loginResponse = apiInstance.post(endpoints.auth.login, loginPayload, {
      tags: { name: "login" },
    });

    const loginResult = parseJson(loginResponse);

    check(
      loginResponse,
      Object.assign({}, commonChecks.is200, commonChecks.hasBody, {
        "login returns accessToken": (r) =>
          loginResult && loginResult.accessToken !== undefined,
        "login returns refreshToken": (r) =>
          loginResult && loginResult.refreshToken !== undefined,
        "login returns userId": (r) =>
          loginResult && loginResult.userId !== undefined,
        "login returns email": (r) =>
          loginResult && loginResult.email === userEmail,
      })
    );

    sleep(1);
  });
}
