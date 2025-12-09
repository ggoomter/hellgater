import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    watch: {
      usePolling: true,  // Docker/Windows에서 파일 변경 감지를 위해 필수
      interval: 1000,    // 1초마다 체크
    },
    proxy: {
      '/api': {
        // Docker 환경에서는 server 컨테이너 이름 사용, 로컬에서는 localhost 사용
        target: process.env.VITE_API_URL?.replace('/api/v1', '') || 'http://server:4000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
