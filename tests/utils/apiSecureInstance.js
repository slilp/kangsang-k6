import http from "k6/http";
import { config, testUsers, endpoints } from "../../config/config.js";

const apiSecureInstance = {
  get: (path, params) => {
    const BASE_URL = `${config.baseUrl}${config.apiVersion}`;
    const url = buildUrl(BASE_URL, path, params);
    const requestParams = getRequestParams();
    return http.get(url, requestParams);
  },

  post: (path, payload, params) => {
    const BASE_URL = `${config.baseUrl}${config.apiVersion}`;
    const url = buildUrl(BASE_URL, path, params);
    const requestParams = getRequestParams();
    return http.post(url, JSON.stringify(payload), requestParams);
  },

  put: (path, payload, params) => {
    const BASE_URL = `${config.baseUrl}${config.apiVersion}`;
    const url = buildUrl(BASE_URL, path, params);
    const requestParams = getRequestParams();
    return http.put(url, JSON.stringify(payload), requestParams);
  },

  patch: (path, payload, params) => {
    const BASE_URL = `${config.baseUrl}${config.apiVersion}`;
    const url = buildUrl(BASE_URL, path, params);
    const requestParams = getRequestParams();
    return http.patch(url, JSON.stringify(payload), requestParams);
  },

  delete: (path, params) => {
    const BASE_URL = `${config.baseUrl}${config.apiVersion}`;
    const url = buildUrl(BASE_URL, path, params);
    const requestParams = getRequestParams();
    return http.del(url, null, requestParams);
  },
};

function getAuthToken(baseUrl, loginEndpoint, user) {
  const loginUrl = `${baseUrl}${loginEndpoint}`;
  const payload = JSON.stringify({
    username: user.username,
    password: user.password,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.post(loginUrl, payload, params);

  if (response.status === 200 || response.status === 201) {
    try {
      const body = JSON.parse(response.body);
      // Handle different token response formats
      return body.token || body.access_token || body.accessToken || null;
    } catch (error) {
      console.error(`Failed to parse auth response: ${error}`);
      return null;
    }
  }

  console.error(`Authentication failed: ${response.status} - ${response.body}`);
  return null;
}

function buildUrl(baseUrl, path, params) {
  let url = `${baseUrl}${path}`;
  if (params) {
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
    url += `?${queryString}`;
  }
  return url;
}

function getRequestParams() {
  const BASE_URL = `${config.baseUrl}${config.apiVersion}`;
  const accessToken = getAuthToken(
    BASE_URL,
    endpoints.auth.login,
    testUsers.user
  );

  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    timeout: "30s",
  };
}

export default apiSecureInstance;
