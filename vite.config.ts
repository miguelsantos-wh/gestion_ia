import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Evita que el perfil normal del navegador sirva un bundle antiguo (incógnito suele ir sin caché).
  server: {
    headers: noCacheHeaders,
  },
  preview: {
    headers: noCacheHeaders,
  },
});
