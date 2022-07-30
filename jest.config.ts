import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  modulePathIgnorePatterns: [
    '<rootDir>/.tmp',
    '<rootDir>/examples',
    '<rootDir>/templates',
    '<rootDir>/packages/.+/compiled',
    '<rootDir>/packages/.+/fixtures',
  ],
  testMatch: ['**/*.test.(t|j)s(x)?'],
  testTimeout: 30000,
  transform: {
    '^.+\\.tsx?$': require.resolve('esbuild-jest'),
  },
};

export default config;
