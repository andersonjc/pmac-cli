import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/*.test.ts'], // Only CLI tests at root level
    exclude: ['viewer/**/*'], // Exclude viewer tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/pmac.ts'], // Only CLI source code
      exclude: [
        'tests/*.test.ts', 
        'tests/*.config.ts',
        'viewer/**/*', // Exclude all viewer code
        'node_modules/**/*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  }
});