import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        { find: /^@\/registry\/(.*)/, replacement: path.resolve(__dirname, 'src/registry/$1') },
        { find: /^@\/components\/(.*)/, replacement: path.resolve(__dirname, 'src/components/$1') },
        { find: /^@\/lib\/(.*)/, replacement: path.resolve(__dirname, 'src/lib/$1') },
        { find: /^@\/utils\/(.*)/, replacement: path.resolve(__dirname, 'src/utils/$1') },
        { find: /^@\/store\/(.*)/, replacement: path.resolve(__dirname, 'src/store/$1') },
        { find: /^@\/(.*)/, replacement: path.resolve(__dirname, '$1') },
      ],
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('three') || id.includes('@react-three')) {
                return 'vendor-three';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'vendor-pdf';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
