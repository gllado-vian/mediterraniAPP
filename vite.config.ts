/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/mediterraniAPP/'
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Què sopem',
        short_name: 'Què sopem',
        description: 'Decideix el sopar en segons, amb equilibri mediterrani.',
        lang: 'ca',
        start_url: '/mediterraniAPP/',
        scope: '/mediterraniAPP/', 
        display: 'standalone',
        background_color: '#F2F2F2',
        theme_color: '#F2F2F2',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { srcSí, la configuració està impecable i no cal tocar-hi res més. 

Tens tot l'essencial ben integrat:
* **Tailwind v4** (`@tailwindcss/vite`) funcionant com a plugin de Vite.
* **VitePWA** amb actualització automàtica i el manifest complet (incloent-hi la icona *maskable* per a Android).
* **Vitest** configurat correctament amb `jsdom` i el seu fitxer de *setup*.

Pots tirar cap endavant amb aquesta estructura.
