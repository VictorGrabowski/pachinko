import { defineConfig } from "vite";

export default defineConfig({
  // Use repository subdirectory path for GitHub Pages, relative path for local/Electron
  base: process.env.GITHUB_PAGES ? "/pachinko/" : "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    minify: "terser",
    sourcemap: false, // Disable sourcemaps for production
  },
  server: {
    port: 3000,
    open: true,
  },
});
