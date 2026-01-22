module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['modules/**/*.js', 'utils/**/*.js'],
    testMatch: ['**/tests/**/*.test.js'],
    verbose: true,
    setupFilesAfterEnv: ['./tests/setup.js'],
};
