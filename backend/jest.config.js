module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 60000,
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@ingestion/(.*)$': '<rootDir>/src/ingestion/$1',
    '^@normalization/(.*)$': '<rootDir>/src/normalization/$1',
    '^@engines/(.*)$': '<rootDir>/src/engines/$1',
    '^@knowledge/(.*)$': '<rootDir>/src/knowledge/$1',
    '^@conversation/(.*)$': '<rootDir>/src/conversation/$1',
    '^@arbitration/(.*)$': '<rootDir>/src/arbitration/$1',
    '^@fallback-gate/(.*)$': '<rootDir>/src/fallback-gate/$1',
    '^@observability/(.*)$': '<rootDir>/src/observability/$1',
  },
  // Default run: all test tiers EXCEPT benchmarks (run benchmarks independently)
  testMatch: [
    '**/tests/unit/**/*.spec.ts',
    '**/tests/integration/**/*.spec.ts',
    '**/tests/regression/**/*.spec.ts',
    '**/tests/fuzz/**/*.spec.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/benchmarks/',
  ],
};

