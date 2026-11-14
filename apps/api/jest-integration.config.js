/** Integration tests: test/*.e2e-spec.ts – cần PostgreSQL thật (DATABASE_URL) */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: 'test/.*\\.e2e-spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  testEnvironment: 'node',
  testTimeout: 30000,
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/**/*.spec.ts', '!src/database/**', '!src/main.ts'],
  coverageDirectory: './coverage-integration',
};
