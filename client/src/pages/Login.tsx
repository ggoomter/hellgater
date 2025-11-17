import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, Card, Logo } from '../components/common';
import { useLogin } from '../hooks/useAuth';

export default function Login() {
  console.log('🎯 Login component rendered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailReadonly, setEmailReadonly] = useState(true);
  const [passwordReadonly, setPasswordReadonly] = useState(true);

  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔵 Login form submitted:', { email });
    e.preventDefault();
    console.log('🔵 Event prevented, loginMutation:', loginMutation);
    console.log('🔵 Calling mutate with:', { email, password: '***' });
    loginMutation.mutate({ email, password });
    console.log('🔵 Mutate called');
  };

  console.log('🎯 loginMutation object:', loginMutation);
  console.log('🎯 handleSubmit function:', handleSubmit);

  console.log('🔵 Login mutation state:', {
    isPending: loginMutation.isPending,
    isSuccess: loginMutation.isSuccess,
    isError: loginMutation.isError,
    data: loginMutation.data,
    error: loginMutation.error,
    errorMessage: (loginMutation.error as any)?.response?.data?.error?.message,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="glass" className="backdrop-blur-xl bg-white/10">
          {/* 로고 */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* 제목 */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">로그인</h2>
            <p className="text-gray-300">당신의 헬스 여정이 기다립니다</p>
          </div>

          {/* 에러 메시지 */}
          {loginMutation.isError && (
            <motion.div
              className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="text-red-200 text-sm font-semibold">
                ❌ {(loginMutation.error as any)?.response?.data?.error?.message ||
                  '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'}
              </p>
            </motion.div>
          )}

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {/* 더미 필드 - 브라우저 자동완성 방지 */}
            <input type="text" style={{ display: 'none' }} />
            <input type="password" style={{ display: 'none' }} />

            <Input
              type="email"
              label="이메일"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailReadonly(false)}
              required
              autoComplete="new-password"
              name="email-hidden"
              readOnly={emailReadonly}
              leftIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              }
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="비밀번호"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordReadonly(false)}
                required
                autoComplete="new-password"
                name="password-hidden"
                readOnly={passwordReadonly}
                leftIcon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[42px] text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loginMutation.isPending}
            >
              로그인
            </Button>
          </form>

          {/* 구분선 */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900/50 text-gray-400">또는</span>
            </div>
          </div>

          {/* 회원가입 링크 */}
          <div className="text-center">
            <p className="text-gray-300">
              아직 계정이 없으신가요?{' '}
              <Link
                to="/register"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                회원가입
              </Link>
            </p>
          </div>
        </Card>

        {/* 하단 텍스트 */}
        <motion.p
          className="text-center text-gray-400 text-sm mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          헬스를 RPG처럼! 운동할수록 강해지세요 💪
        </motion.p>
      </motion.div>
    </div>
  );
}
