import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main_window: 'index.html', // Specify the entry point for the renderer process (HTML file)
      },
    },
  },
});