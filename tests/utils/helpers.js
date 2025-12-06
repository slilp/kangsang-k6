import { sleep } from "k6";

export function buildUrl(baseUrl, path, params) {
  let url = `${baseUrl}${path}`;

  if (params && Object.keys(params).length > 0) {
    const queryString = Object.keys(params)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");
    url += `?${queryString}`;
  }

  return url;
}

export function randomSleep(min, max) {
  const duration = Math.random() * (max - min) + min;
  sleep(duration);
}

export function randomString(length = 10) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomEmail(domain = "example.com") {
  return `user_${randomString(8)}@${domain}`;
}

export const commonChecks = {
  is200: {
    "status is 200": (r) => r.status === 200,
  },
  is201: {
    "status is 201": (r) => r.status === 201,
  },
  is2xx: {
    "status is 2xx": (r) => r.status >= 200 && r.status < 300,
  },
  hasBody: {
    "has response body": (r) => r.body && r.body.length > 0,
  },
  isJson: {
    "response is JSON": (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  },
  responseTimeLessThan: (ms) => ({
    [`response time < ${ms}ms`]: (r) => r.timings.duration < ms,
  }),
};

export function parseJson(response) {
  try {
    return JSON.parse(response.body);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return null;
  }
}
