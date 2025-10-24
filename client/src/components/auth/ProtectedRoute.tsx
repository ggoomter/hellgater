import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import type { RootState } from '../../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 */
export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { tokens } = useSelector((state: RootState) => state.auth);
  const [isReady, setIsReady] = useState(false);
  const isAuthenticated = !!tokens.accessToken;

  // Redux persist rehydration 대기 (충분한 시간)
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  console.log('🔒 ProtectedRoute check:', {
    requireAuth,
    isAuthenticated,
    accessToken: tokens.accessToken ? 'EXISTS' : 'NULL',
    redirectTo,
    isReady,
  });

  // Rehydration 완료 대기
  if (!isReady) {
    return <div>Loading...</div>;
  }

  // 인증이 필요한 페이지인데 로그인하지 않은 경우
  if (requireAuth && !isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // 인증이 필요하지 않은 페이지인데 이미 로그인한 경우 (로그인/회원가입 페이지 등)
  if (!requireAuth && isAuthenticated) {
    console.log('✅ Already authenticated, redirecting to /');
    return <Navigate to="/" replace />;
  }

  console.log('✅ ProtectedRoute passed, rendering children');
  return <>{children}</>;
}
