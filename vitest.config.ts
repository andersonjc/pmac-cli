import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tools/*.test.ts'], // Only CLI tests at root level
    exclude: ['tools/viewer/**/*'], // Exclude viewer tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['tools/pmac.ts'], // Only CLI source code
      exclude: [
        'tools/*.test.ts', 
        'tools/*.config.ts',
        'tools/viewer/**/*', // Exclude all viewer code
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