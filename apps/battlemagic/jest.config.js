const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    setupFiles: ['<rootDir>/jest.polyfills.js'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    // Only files named *.test.* are suites; helpers/mocks/fixtures under
    // __tests__ are shared plumbing, not tests
    testMatch: ['**/*.test.ts', '**/*.test.tsx'],
    moduleNameMapper: {
        // WASM-backed modules cannot load in Jest's Node environment
        '^@alexaltea/capstone-js(/.*)?$':
            '<rootDir>/src/__tests__/__mocks__/@alexaltea/capstone-js.ts',
        '^battlemagic-analyzer/pkg/(.*)$':
            '<rootDir>/src/__tests__/mocks/MockAnalyzer.ts',
    },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
