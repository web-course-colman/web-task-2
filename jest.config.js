module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Coverage is generated when running: `npm run test:cov`
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}",
    "!src/config/**",
    "!src/**/index.{ts,js}",
  ],
};
