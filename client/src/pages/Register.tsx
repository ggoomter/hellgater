import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, Card, Logo } from '../components/common';
import { useRegister } from '../hooks/useAuth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailReadonly, setEmailReadonly] = useState(true);
  const [usernameReadonly, setUsernameReadonly] = useState(true);
  const [passwordReadonly, setPasswordReadonly] = useState(true);
  const [confirmPasswordReadonly, setConfirmPasswordReadonly] = useState(true);

  const registerMutation = useRegister();

  const validatePassword = (pwd: string) => {
    if (pwd.length < 4) {
      return '비밀번호는 최소 4자 이상이어야 합니다.';
    }
    return '';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 비밀번호 유효성 검사
    const error = validatePassword(password);
    if (error) {
      setPasswordError(error);
      return;
    }

    // 비밀번호 일치 확인
    if (password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }

    registerMutation.mutate({ email, password, username });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
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
            <h2 className="text-3xl font-bold text-white mb-2">회원가입</h2>
            <p className="text-gray-300">헬스 RPG의 영웅이 되어보세요</p>
          </div>

          {/* 에러 메시지 */}
          {registerMutation.isError && (() => {
            const error = registerMutation.error as any;
            let errorMessage = '회원가입에 실패했습니다. 다시 시도해주세요.';
            
            // 백엔드에서 온 에러 메시지 추출
            if (error?.response?.data?.error?.message) {
              errorMessage = error.response.data.error.message;
            } else if (error?.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error?.message) {
              errorMessage = error.message;
            } else if (error?.response?.status === 409) {
              errorMessage = '이미 사용 중인 이메일 또는 사용자명입니다.';
            } else if (error?.response?.status === 400) {
              errorMessage = '입력한 정보를 확인해주세요.';
            } else if (error?.response?.status === 500) {
              errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            } else if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
              errorMessage = '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.';
            } else if (error?.code === 'ERR_NETWORK' || !error?.response) {
              errorMessage = '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.';
            }
            
            return (
              <motion.div
                className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <p className="text-red-200 text-sm font-medium">{errorMessage}</p>
                {import.meta.env.DEV && error?.response?.data?.error?.code && (
                  <p className="text-red-300/60 text-xs mt-1">
                    에러 코드: {error.response.data.error.code}
                  </p>
                )}
              </motion.div>
            );
          })()}

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
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

            <Input
              type="text"
              label="사용자 이름"
              placeholder="영웅의 이름을 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setUsernameReadonly(false)}
              required
              autoComplete="new-password"
              name="username-hidden"
              readOnly={usernameReadonly}
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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
                onChange={handlePasswordChange}
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

            {/* 비밀번호 요구사항 표시 */}
            {password && passwordError && (
              <motion.p
                className="text-red-300 text-xs mt-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {passwordError}
              </motion.p>
            )}

            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                label="비밀번호 확인"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setConfirmPasswordReadonly(false)}
                required
                autoComplete="new-password"
                name="confirm-password-hidden"
                readOnly={confirmPasswordReadonly}
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[42px] text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? (
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

            {/* 비밀번호 일치 여부 */}
            {confirmPassword && password !== confirmPassword && (
              <motion.p
                className="text-red-300 text-xs mt-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                비밀번호가 일치하지 않습니다.
              </motion.p>
            )}

            {/* 비밀번호 일치 */}
            {confirmPassword && password === confirmPassword && !passwordError && (
              <motion.p
                className="text-green-300 text-xs mt-1 flex items-center gap-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                비밀번호가 일치합니다.
              </motion.p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={registerMutation.isPending}
            >
              회원가입
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

          {/* 로그인 링크 */}
          <div className="text-center">
            <p className="text-gray-300">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                로그인
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
          운동할수록 강해지는 RPG 세계로 떠나세요!
        </motion.p>
      </motion.div>
    </div>
  );
}
