const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  // Only *.test.* files are suites; helpers under __tests__ are plumbing
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
};

module.exports = createJestConfig(customJestConfig);
