import { defineConfig } from 'vite'

export default {
    base: './', // This is important for GitHub Pages
    build: {
      minify: false, // remove after debug complete 
      "target": "esnext",
      outDir: 'dist',
      rollupOptions: {
        // Ensure proper handling of assets
        output: {
          compact: false,  // remove after debug complete
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