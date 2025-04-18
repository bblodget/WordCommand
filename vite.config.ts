import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/WordCommand/', // GitHub repository name
  build: {
    outDir: 'docs'
  },
  plugins: [react()]
});