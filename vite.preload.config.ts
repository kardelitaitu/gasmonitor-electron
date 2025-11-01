import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/preload.ts', // Specify the entry point for the preload script
      formats: ['cjs'], // Preload scripts typically use CommonJS modules
    },
    rollupOptions: {
      external: require('./package.json').dependencies, // Exclude Electron and Node.js modules
    },
  },
});