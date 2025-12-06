ENVIRONMENT ?= local

BLUE := \033[0;34m
GREEN := \033[0;32m
NC := \033[0m # No Color

clean: ## Clean up test results and data
	@echo "$(BLUE)Cleaning up...$(NC)"
	rm -rf results/*
	rm -rf monitoring/influxdb/data/*
	rm -rf monitoring/grafana/data/*
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

load-test: ## Run specific test file (usage: make load-test FILE=health-load-test.js)
	@echo "$(BLUE)Running test: $(FILE)...$(NC)"
	@ENVIRONMENT=$(ENVIRONMENT) k6 run \
		--out influxdb=http://localhost:8086/k6 \
		tests/performance/$(FILE)

regression-test: ## Run specific regression test file (usage: make regression-test FILE=auth.js)
	@echo "$(BLUE)Running regression test: $(FILE)...$(NC)"
	@ENVIRONMENT=$(ENVIRONMENT) k6 run tests/regression/$(FILE)
