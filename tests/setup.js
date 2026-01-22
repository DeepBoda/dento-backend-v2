// Global test setup
// Mock common heavy dependencies globally if needed.
jest.setTimeout(30000); // Increase timeout for integration tests

// Example global mock (uncomment if redis is troublesome in unit tests)
// jest.mock('redis', () => require('redis-mock'));
