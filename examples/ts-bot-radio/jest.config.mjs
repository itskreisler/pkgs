// examples/ts-bot-radio/jest.config.mjs
export default {
  preset: 'ts-jest/presets/default-esm', // Handles ESM
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'mjs', 'json', 'node'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        // tsconfig: 'tsconfig.json', // Explicitly point if needed
      },
    ],
  },
  moduleNameMapper: {
    // For local relative imports: if a test file imports '../services/MyService.js',
    // this maps it to '../services/MyService'. ts-jest (using TypeScript's resolver)
    // should then find '../services/MyService.ts'.
    '^(\\.{1,2}/.*)\\.js$': '$1',

    // For path aliases (e.g., "@/*": ["src/*"] in tsconfig.json)
    // Maps '@/services/MyService.js' to '<rootDir>/src/services/MyService'
    '^@/(.*)\\.js$': '<rootDir>/src/$1',
    // Maps '@/services/MyService' (extensionless) to '<rootDir>/src/services/MyService'
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // verbose: true,
};
