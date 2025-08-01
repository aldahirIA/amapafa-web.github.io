import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.', // asegura que busque en la raíz del proyecto
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'public/index.html'),
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});