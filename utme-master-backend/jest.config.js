/**
 * Jest Configuration for UTME Master Backend
 * Comprehensive testing setup for unit and integration tests
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Use ts-jest for TypeScript support
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  // Test file patterns
  testMatch: [
    '**/*.test.ts',
    '**/*.unit.ts',
    '**/*.integration.ts',
  ],
  
  // Files to ignore
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.mock.ts',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Test timeout (ms)
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Reset modules between tests
  resetModules: true,
  
  // Detect leaks
  detectLeaks: true,
  
  // Detect open handles
  detectOpenHandles: true,
};
