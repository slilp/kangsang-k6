/**
 * Configuration file for K6 tests
 * Manages environment-specific settings
 */

const environments = {
  local: {
    baseUrl: "http://localhost:8080",
    apiVersion: "",
  },
  dev: {
    baseUrl: "https://dev-api.example.com",
    apiVersion: "/api/v1",
  },
  staging: {
    baseUrl: "https://staging-api.example.com",
    apiVersion: "/api/v1",
  },
  production: {
    baseUrl: "https://api.example.com",
    apiVersion: "/api/v1",
  },
};

// Get environment from environment variable or default to 'local'
const currentEnv = __ENV.ENVIRONMENT || "local";

export const config = environments[currentEnv];

// Test user credentials (should be replaced with real test accounts)
export const testUsers = {
  admin: {
    username: "admin@example.com",
    password: "Admin@1234",
  },
  user: {
    username: "user@example.com",
    password: "User@1234",
  },
};

// Common endpoints
export const endpoints = {
  auth: {
    login: "/token",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    register: "/auth/register",
  },
  users: {
    list: "/users",
    create: "/users",
    get: (id) => `/users/${id}`,
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
  },
  products: {
    list: "/products",
    create: "/products",
    get: (id) => `/products/${id}`,
    update: (id) => `/products/${id}`,
    delete: (id) => `/products/${id}`,
  },
};

// Test thresholds
export const thresholds = {
  regression: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"], // Less than 1% errors
    checks: ["rate>0.95"], // 95% of checks should pass
  },
  performance: {
    http_req_duration: ["p(95)<1000", "p(99)<2000"],
    http_req_failed: ["rate<0.05"], // Less than 5% errors
    checks: ["rate>0.90"], // 90% of checks should pass
  },
};

export default config;
