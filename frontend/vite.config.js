import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  const isSSR = process.env.BUILD_SSR === 'true';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true
        }
      }
    },
    build: isSSR ? {
      ssr: 'src/entry-server.jsx',
      outDir: 'dist-server',
    } : {
      outDir: 'dist',
      sourcemap: false
    },
    ...(isSSR && {
      ssr: {
        // Bundle CJS packages instead of externalizing them so Node ESM import works
        noExternal: ['react-helmet-async'],
      }
    })
  };
});
