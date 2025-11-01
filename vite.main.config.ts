import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '.vite/build',
    rollupOptions: {
      input: {
        main: 'src/main.ts',
        gasTracker: 'src/gasTracker.ts', // Explicitly include gasTracker.ts
      },
      output: {
        format: 'cjs',
        entryFileNames: '[name].js', // Use [name].js to output main.js and gasTracker.js
      },
    },
  },
});