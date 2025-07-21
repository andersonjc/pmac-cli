import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    svelte({
      configFile: resolve(__dirname, '../../svelte.config.js'),
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom', // Browser environment for Svelte components
    include: ['src/**/*.test.ts'], // Only viewer tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts', 'src/components/**/*.svelte', 'src/App.svelte'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'node_modules/**/*'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib'),
      $components: resolve(__dirname, 'src/components'),
    },
  },
});
