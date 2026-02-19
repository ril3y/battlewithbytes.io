const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    testPathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
        '<rootDir>/src/__tests__/fixtures/',
        '<rootDir>/src/__tests__/mocks/',
        '<rootDir>/src/__tests__/utils/',
        // WASM integration tests require a built WASM binary and running server
        '<rootDir>/src/__tests__/wasm-integration.test.ts',
        '<rootDir>/src/__tests__/e2e-firmware-analysis.test.ts',
    ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
