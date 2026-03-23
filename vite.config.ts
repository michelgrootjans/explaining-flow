import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/explaining-flow/' : '/',
  build: {
    outDir: 'dist',
  },
}));
