import { defineConfig } from 'vite'

export default defineConfig({
    base: './', // relative asset paths, so the site works when served from GitHub Pages
    build: {
      minify: false, // left unminified for now so the deployed bundle is readable while debugging
      target: 'esnext',
      outDir: 'dist',
      rolldownOptions: {
        output: {
          assetFileNames: ({ name }) => {
            // Keep images organised in their own folder in dist
            if (/\.(png|jpg|jpeg|gif|svg)$/.test(name ?? '')) {
              return 'assets/images/[name][extname]';
            }
            return 'assets/[name][extname]';
          },
        },
      },
    },
    assetsInclude: ['**/*.png'],
  })
