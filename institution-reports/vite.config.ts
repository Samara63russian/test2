import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Форма Сводки',
        short_name: 'Сводки',
        description: 'Заполнение и анализ сводных справок учреждений',
        theme_color: '#244c86',
        background_color: '#f4f6fa',
        display: 'standalone',
        orientation: 'portrait-primary',
        lang: 'ru',
        icons: [
          { src: '/app-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/app-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 31_536_000 } },
          },
        ],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: { '/api': 'http://localhost:3001' },
  },
})
