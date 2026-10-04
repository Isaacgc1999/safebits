# Spec Delta

## Purpose

Proves with load tests that the backend meets its latency targets and scales out by adding instances.

## ADDED Requirements

### Requirement: API latency under load
In the load-test environment, each backend instance SHALL sustain 100 requests per second of a realistic traffic mix for 10 minutes with:
- p95 latency of 250 ms or less for reads;
- p95 latency of 500 ms or less for writes;
- an error rate below 0.1%.

#### Scenario: Load test
- **WHEN** the load test runs against one instance
- **THEN** all latency and error thresholds are met, or the pipeline fails

### Requirement: Scaling out
Adding backend instances SHALL increase sustained throughput with no code or data changes.

#### Scenario: Two instances
- **WHEN** the load test runs against two instances instead of one
- **THEN** sustained throughput is at least 1.8 times that of a single instance within the same latency thresholds
