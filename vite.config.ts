import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Gestion Budjet',
        short_name: 'Budjet',
        description: 'Planifiez votre mois, épargnez en premier.',
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        background_color: '#0B1220',
        theme_color: '#2563EB',
        icons: [
          { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        // Lecture seule hors-ligne (section 12.1) : on garde les dernières réponses GET.
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && url.pathname.startsWith('/v1/') && !url.pathname.startsWith('/v1/auth'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 3600 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Graphiques et React à part : mis en cache séparément du code de l'application.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router', 'react-redux', '@reduxjs/toolkit', '@tanstack/react-query'],
          charts: ['recharts'],
        },
      },
    },
  },
  server: {
    port: 5173,
    // Même origine que l'API en développement : le cookie de session fonctionne sans CORS.
    proxy: {
      '/v1': 'http://localhost:3333',
      '/health': 'http://localhost:3333',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
