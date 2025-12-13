import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 개발 중 localStorage 정리 (한 번만 실행)
if (import.meta.env.DEV) {
  try {
    const cleaned = sessionStorage.getItem('localStorage-cleaned');
    if (!cleaned) {
      console.log('🧹 Cleaning old localStorage data...');
      // 구버전 키 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('persist:root');
      sessionStorage.setItem('localStorage-cleaned', 'true');
      console.log('✅ localStorage cleaned');
    }
  } catch (e) {
    console.warn('⚠️ Storage access blocked or restricted:', e);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode 임시 제거 (개발 중 이중 렌더링 문제)
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
