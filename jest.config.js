const dotenv = require("dotenv");

dotenv.config({
  path: ".env.development",
});

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: ".",
});

const jestConfig = createJestConfig({
  setupFilesAfterEnv: ["./tests/extentions/setup.js"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  maxConcurrency: 1,
  maxWorkers: 1,
});

module.exports = jestConfig;
