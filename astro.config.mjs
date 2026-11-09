// @ts-check
import { defineConfig } from 'astro/config';
import astroPwa from '@vite-pwa/astro';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://qr.manpuc.me',
  output: 'static',
  vite: {
    server: {
      // ngrok などのトンネル経由で dev サーバーを確認するための許可ホスト
      allowedHosts: ['smashup-retreat-brigade.ngrok-free.dev'],
    },
  },
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en', 'zh', 'es'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/og-image'),
    }),
    astroPwa({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg'],
      manifest: {
        name: 'QRメーカー',
        short_name: 'QR maker',
        description: 'AstroとTypeScriptで構成された高速なQR生成アプリ',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'app.png', sizes: '192x192', type: 'image/png' },
          { src: 'desktop.png', sizes: '512x512', type: 'image/png' },
          { src: 'app.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ]
});
