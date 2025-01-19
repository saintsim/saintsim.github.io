import { defineConfig } from 'vite'

export default {
    base: './', // This is important for GitHub Pages
    build: {
      "target": "esnext",
      outDir: 'dist',
      rollupOptions: {
        // Ensure proper handling of assets
        output: {
          assetFileNames: ({ name }) => {
            // Keep images organized in the dist folder
            if (/\.(png|jpg|jpeg|gif|svg)$/.test(name ?? '')) {
              return 'assets/images/[name][extname]';
            }
            return 'assets/[name][extname]';
          },
        },
      },
    },
    assetsInclude: ['**/*.png'],
  }