import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from "vite-plugin-compression";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => ({
  server: {
    host: "::",
    port: 5173,
    allowedHosts: ["tunnel.schrittmacher.ai"],
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Image-Optimizer und Compression nur beim Client-Build
    !isSsrBuild && ViteImageOptimizer({
      jpg: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      png: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
    }),
    !isSsrBuild && viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    !isSsrBuild && viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  ssr: {
    // CJS-Module die named exports nicht für ESM bereitstellen → bundlen statt externalisieren
    noExternal: ['react-helmet-async'],
  },
  build: {
    minify: isSsrBuild ? false : 'esbuild',
    rollupOptions: isSsrBuild ? {} : {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-toast',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-avatar',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: mode === 'development',
  },
}));
