import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'motion/react',
      'zustand',
      'zustand/middleware',
      'lucide-react',
      'react-i18next',
      'i18next',
      'three',
      '@react-three/fiber'
    ]
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
