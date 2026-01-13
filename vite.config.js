import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
});
