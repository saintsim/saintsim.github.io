import { defineConfig } from 'vite'

export default {
    base: './', // This is important for GitHub Pages
    build: {
      "target": "esnext",
      outDir: 'dist',
    }
  }