# K6 Performance Testing Suite

A comprehensive, production-ready K6 testing framework with Prometheus and Grafana monitoring for regression and performance testing.

## Features

- **Regression Tests**: Validate API functionality and catch breaking changes
- **Performance Tests**: Load, stress, and spike testing capabilities
- **Authentication Utilities**: Built-in token management for authenticated endpoints
- **Prometheus Integration**: Real-time metrics collection and storage
- **Grafana Dashboards**: Visual monitoring and analysis
- **Docker Support**: Containerized testing environment
- **Makefile Commands**: Simple, memorable test execution

## Quick Start

### Prerequisites

- [K6](https://k6.io/docs/getting-started/installation/) installed locally
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Bun](https://bun.sh/) (for utilities and scripts)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd kangsang-k6

# Install dependencies with Bun
make install
# or: bun install

# Setup monitoring stack (Prometheus + Grafana)
make setup
```

### First Test Run

```bash
# Run a quick smoke test
make quick-test

# Run specific regression test
make test-auth

# Run load test with Prometheus
make docker-test-load
```

## Project Structure

```
kangsang-k6/
├── tests/
│   ├── regression/          # Regression test suites
│   │   ├── auth-api.test.js
│   │   └── user-api.test.js
│   ├── performance/         # Performance test suites
│   │   ├── load-test.js
│   │   ├── stress-test.js
│   │   └── spike-test.js
│   └── utils/               # Shared utilities
│       ├── auth.js          # Authentication helpers
│       └── helpers.js       # Common test helpers
├── config/
│   └── config.js            # Environment configuration
├── monitoring/
│   ├── prometheus/          # Prometheus configuration
│   └── grafana/             # Grafana dashboards
├── scripts/                 # Helper scripts
├── results/                 # Test results output
├── Makefile                 # Command shortcuts
└── docker-compose.yml       # Container orchestration
```

## Configuration

### Environment Setup

Edit [config/config.js](config/config.js) to configure your environments:

```javascript
const environments = {
  local: {
    baseUrl: 'http://localhost:3000',
    apiVersion: '/api/v1',
  },
  dev: {
    baseUrl: 'https://dev-api.example.com',
    apiVersion: '/api/v1',
  },
  // Add more environments...
};
```

### Test Credentials

Configure test users in [config/config.js](config/config.js):

```javascript
export const testUsers = {
  admin: {
    username: 'admin@example.com',
    password: 'Admin@1234',
  },
  user: {
    username: 'user@example.com',
    password: 'User@1234',
  },
};
```

## Test Types

### Regression Tests

Validate API functionality and ensure no breaking changes:

```bash
# Run all regression tests
make test-regression

# Run specific tests
make test-auth    # Authentication API tests
make test-user    # User CRUD operations
```

**Key Features:**
- ✅ API contract validation
- ✅ Status code verification
- ✅ Response time assertions
- ✅ Data integrity checks
- ✅ Error handling validation

### Performance Tests

Measure system performance under various load conditions:

#### Load Testing
Simulates expected user load:

```bash
make test-load
# or with Prometheus
make docker-test-load
```

- 50-100 concurrent users
- 16-minute duration
- Realistic user scenarios

#### Stress Testing
Finds system breaking point:

```bash
make test-stress
# or with Prometheus
make docker-test-stress
```

- Up to 400 concurrent users
- 33-minute duration
- Gradual load increase

#### Spike Testing
Tests sudden traffic spikes:

```bash
make test-spike
```

- Sudden jumps to 500-1000 users
- Tests recovery capabilities
- Validates auto-scaling

## Authentication

The framework includes robust authentication utilities for testing protected endpoints.

### Basic Usage

```javascript
import { setupAuth, authenticatedGet, authenticatedPost } from '../utils/auth.js';

// Setup authentication (runs once)
export function setup() {
  return setupAuth(BASE_URL, credentials, '/auth/login');
}

// Use in tests
export default function (authConfig) {
  const response = authenticatedGet(`${BASE_URL}/api/users`, authConfig);
  check(response, { 'status is 200': (r) => r.status === 200 });
}
```

### Available Auth Functions

- `getAuthToken()` - Obtain authentication token
- `createAuthHeaders()` - Create headers with token
- `setupAuth()` - Complete auth setup
- `authenticatedGet()` - Make authenticated GET request
- `authenticatedPost()` - Make authenticated POST request
- `authenticatedPut()` - Make authenticated PUT request
- `authenticatedDelete()` - Make authenticated DELETE request

## Monitoring

### Prometheus

Access metrics at: http://localhost:9090

**Key Metrics:**
- `k6_http_req_duration` - Request duration
- `k6_http_req_failed` - Failed requests
- `k6_vus` - Virtual users
- `k6_iterations` - Completed iterations

### Grafana

Access dashboards at: http://localhost:3000
- **Username**: admin
- **Password**: admin

**Pre-configured Dashboard:**
- HTTP request duration over time
- Error rate gauge
- Virtual users graph
- Request rate trends
- Check success rate
- Iteration counts

### Quick Access

```bash
make grafana-open      # Open Grafana dashboard
make prometheus-open   # Open Prometheus UI
make status           # Check service status
```

## Makefile Commands

### Setup & Management
```bash
make help          # Show all available commands
make install       # Install dependencies
make setup         # Setup monitoring stack
make start         # Start Docker services
make stop          # Stop Docker services
make restart       # Restart services
make clean         # Clean test results
```

### Regression Tests
```bash
make test-auth         # Test authentication API
make test-user         # Test user API
make test-regression   # Run all regression tests
```

### Performance Tests
```bash
make test-load         # Run load test
make test-stress       # Run stress test
make test-spike        # Run spike test
make test-performance  # Run load + stress tests
```

### Docker Tests (with Prometheus)
```bash
make docker-test-load   # Load test with metrics
make docker-test-stress # Stress test with metrics
make docker-test-auth   # Auth test with metrics
make docker-test-user   # User test with metrics
```

### Environment-Specific
```bash
make test-local    # Test local environment
make test-dev      # Test dev environment
make test-staging  # Test staging environment
```

### Utilities
```bash
make quick-test      # Quick smoke test
make validate-config # Validate test configuration
make results         # View test results
make logs           # View Docker logs
make version        # Show k6 version
```

## Writing Custom Tests

### Regression Test Template

```javascript
import { check, group, sleep } from 'k6';
import { config, testUsers, endpoints, thresholds } from '../../config/config.js';
import { setupAuth, authenticatedGet } from '../utils/auth.js';
import { enhancedCheck, commonChecks, combineChecks } from '../utils/helpers.js';

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 5 },
    { duration: '10s', target: 0 },
  ],
  thresholds: thresholds.regression,
};

const BASE_URL = `${config.baseUrl}${config.apiVersion}`;

export function setup() {
  return setupAuth(BASE_URL, testUsers.user, endpoints.auth.login);
}

export default function (authConfig) {
  group('Your Test Group', () => {
    const response = authenticatedGet(`${BASE_URL}/your-endpoint`, authConfig);

    enhancedCheck(
      response,
      combineChecks(
        commonChecks.is200,
        commonChecks.isJson,
        commonChecks.responseTimeLessThan(500)
      ),
      'Your test name'
    );

    sleep(1);
  });
}
```

### Performance Test Template

```javascript
import { config, testUsers, endpoints, thresholds } from '../../config/config.js';
import { setupAuth, authenticatedGet } from '../utils/auth.js';
import { randomSleep, generateTestData } from '../utils/helpers.js';

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 0 },
  ],
  thresholds: thresholds.performance,
};

const BASE_URL = `${config.baseUrl}${config.apiVersion}`;

export function setup() {
  return setupAuth(BASE_URL, testUsers.user, endpoints.auth.login);
}

export default function (authConfig) {
  // Simulate user behavior
  const response = authenticatedGet(`${BASE_URL}/your-endpoint`, authConfig);
  check(response, { 'status is 200': (r) => r.status === 200 });

  randomSleep(2, 5); // Think time
}
```

## Best Practices

### Test Design

1. **Use Setup Function**: Authenticate once in `setup()`, not in every iteration
2. **Think Time**: Add realistic `sleep()` between requests
3. **Check Assertions**: Use `check()` for validation, not `if` statements
4. **Custom Metrics**: Track business-specific metrics
5. **Group Related Tests**: Use `group()` for logical organization

### Performance

1. **Realistic Scenarios**: Model actual user behavior
2. **Gradual Ramp-up**: Don't spike immediately
3. **Monitor Resources**: Watch CPU, memory, network
4. **Set Thresholds**: Define SLAs in test options
5. **Use Tags**: Tag requests for filtering

### Authentication

1. **Reuse Tokens**: Don't authenticate on every request
2. **Handle Expiry**: Implement token refresh if needed
3. **Test Token Types**: Bearer, Basic, API keys
4. **Secure Credentials**: Use environment variables for sensitive data

### Monitoring

1. **Real-time Observation**: Watch tests in Grafana
2. **Trend Analysis**: Compare results over time
3. **Alert Setup**: Configure alerts for threshold breaches
4. **Export Reports**: Save results for documentation

## Troubleshooting

### Common Issues

**K6 not installed:**
```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Docker services not starting:**
```bash
make stop
make clean
make setup
```

**Permission errors:**
```bash
chmod -R 777 monitoring/prometheus/data
chmod -R 777 monitoring/grafana/data
```

**Port conflicts:**
```bash
# Check what's using the ports
lsof -i :9090  # Prometheus
lsof -i :3000  # Grafana

# Stop conflicting services or change ports in docker-compose.yml
```

## Environment Variables

```bash
# Set environment
export ENVIRONMENT=dev

# Run test
make test-load

# Or inline
ENVIRONMENT=staging make test-load
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: K6 Load Tests

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * *'  # Daily

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run load test
        run: make test-load ENVIRONMENT=staging

      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: k6-results
          path: results/
```

## Support

- K6 Documentation: https://k6.io/docs/
- Prometheus Documentation: https://prometheus.io/docs/
- Grafana Documentation: https://grafana.com/docs/

## License

MIT
