import http from "k6/http";
import { config, endpoints, testUsers } from "../../config/config.js";

const apiInstance = {
  get: (path, options = {}, token) => {
    const BASE_URL = `${config.baseUrl}${config.apiVersion}`;
    const url = `${BASE_URL}${path}`;
    const requestParams = mergeRequestParams(options, token);
    return http.get(url, requestParams);
  },

  post: (path, payload, options = {}, token) => {
    const BASE_URL = `${config.baseUrl}${config.apiVersion}`;
    const url = `${BASE_URL}${path}`;
    const requestParams = mergeRequestParams(options, token);
    return http.post(url, JSON.stringify(payload), requestParams);
  },

  put: (path, payload, options = {}, token) => {
    const BASE_URL = `${config.baseUrl}${config.apiVersion}`;
    const url = `${BASE_URL}${path}`;
    const requestParams = mergeRequestParams(options, token);
    return http.put(url, JSON.stringify(payload), requestParams);
  },

  patch: (path, payload, options = {}, token) => {
    const BASE_URL = `${config.baseUrl}${config.apiVersion}`;
    const url = `${BASE_URL}${path}`;
    const requestParams = mergeRequestParams(options, token);
    return http.patch(url, JSON.stringify(payload), requestParams);
  },

  delete: (path, options = {}, token) => {
    const BASE_URL = `${config.baseUrl}${config.apiVersion}`;
    const url = `${BASE_URL}${path}`;
    const requestParams = mergeRequestParams(options, token);
    return http.del(url, null, requestParams);
  },
};

function getAuthToken() {
  const loginUrl = `${config.baseUrl}${endpoints.auth.login}`;
  const payload = JSON.stringify({
    email: testUsers.user.email,
    password: testUsers.user.password,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.post(loginUrl, payload, params);

  if (response.status === 200) {
    try {
      const body = JSON.parse(response.body);
      return body.accessToken || null;
    } catch (error) {
      console.error(`Failed to parse auth response: ${error}`);
      return null;
    }
  }

  console.error(`Authentication failed: ${response.status} - ${response.body}`);
  return null;
}

function mergeRequestParams(options, token) {
  // Start with provided options (tags, headers, etc.)
  const mergedParams = Object.assign({}, options);

  // Merge headers - combine user headers with auth header
  mergedParams.headers = Object.assign(
    { "Content-Type": "application/json" },
    options.headers || {},
    token ? { Authorization: `Bearer ${token}` } : {}
  );

  // Add default timeout if not provided
  if (!mergedParams.timeout) {
    mergedParams.timeout = "30s";
  }

  return mergedParams;
}

export { apiInstance as default, getAuthToken };
