import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// L'interface vit dans ui/. Tauri charge le build depuis app/dist.
export default defineConfig({
  root: 'ui',
  // Logos, photos, icônes de champions et aperçu JSON produits par `just seed`.
  publicDir: '../../data/seed/public',
  plugins: [react()],
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  build: { outDir: '../dist', emptyOutDir: true, target: 'es2022' },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: false,
  },
});
