import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      configFile: resolve(__dirname, '../../svelte.config.js'),
    }),
  ],
  root: resolve(__dirname),
  build: {
    outDir: resolve(__dirname, '../../dist/viewer'),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          svelte: ['svelte'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    fs: {
      // Allow serving files from the viewer directory and parent directories
      allow: ['..', '.'],
    },
  },
  publicDir: false, // Disable public directory
  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib'),
      $components: resolve(__dirname, 'src/components'),
    },
  },
});
