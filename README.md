# saintsim.github.io

Weather app using Open Meteo API (https://open-meteo.com/). It uses TypeScript and Vite as the build tool.

It is deployed to GitHub pages using GitHub actions with a custom action to first deploy to gh-pages.

# Build/Run Steps

```
// transpile TS -> JS (to built/)
npx tsc

// build with Vite (to dist/)
npm run build

// run locally
npm run dev
```
