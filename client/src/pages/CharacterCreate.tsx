import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Card } from '../components/common';
import { useCreateCharacter } from '../hooks/useCharacter';

// 체지방률 범위별 설명 (남성)
const maleBodyFatRanges = [
  { range: '5-9%', label: '필수 지방', description: '보디빌더 수준, 매우 낮음', emoji: '💪' },
  { range: '10-14%', label: '운동선수', description: '식스팩 명확, 혈관 잘 보임', emoji: '🏋️' },
  { range: '15-19%', label: '피트니스', description: '복근 보임, 건강한 체형', emoji: '🎯' },
  { range: '20-24%', label: '평균', description: '일반적인 건강 체형', emoji: '👤' },
  { range: '25-30%', label: '과체중', description: '배에 지방 축적', emoji: '🔵' },
  { range: '30%+', label: '비만', description: '체중 관리 필요', emoji: '🔴' },
];

// 체지방률 범위별 설명 (여성)
const femaleBodyFatRanges = [
  { range: '10-13%', label: '필수 지방', description: '보디빌더 수준, 매우 낮음', emoji: '💪' },
  { range: '14-20%', label: '운동선수', description: '복근 보임, 탄탄한 체형', emoji: '🏋️' },
  { range: '21-24%', label: '피트니스', description: '건강하고 날씬한 체형', emoji: '🎯' },
  { range: '25-31%', label: '평균', description: '일반적인 건강 체형', emoji: '👤' },
  { range: '32-38%', label: '과체중', description: '지방 축적 시작', emoji: '🔵' },
  { range: '38%+', label: '비만', description: '체중 관리 필요', emoji: '🔴' },
];

export default function CharacterCreate() {
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
  const [showBodyFatGuide, setShowBodyFatGuide] = useState(false);

  // 생년월일 입력 필드 ref
  const yearInputRef = useRef<HTMLInputElement>(null);
  const monthInputRef = useRef<HTMLInputElement>(null);
  const dayInputRef = useRef<HTMLInputElement>(null);

  const createCharacterMutation = useCreateCharacter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!gender) {
      alert('성별을 선택해주세요.');
      return;
    }

    // 생년월일을 YYYY-MM-DD 형식으로 조합
    const birthdate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;

    createCharacterMutation.mutate({
      gender,
      birthdate,
      height: parseFloat(height),
      weight: parseFloat(weight),
      bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : undefined,
      characterModel: 'default',
    });
  };

  // 년도 입력 시 자동으로 월로 이동 (4자리 입력 시)
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 4) {
      setBirthYear(value);
      if (value.length === 4) {
        monthInputRef.current?.focus();
      }
    }
  };

  // 월 입력 시 자동으로 일로 이동 (2자리 입력 시)
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 2) {
      setBirthMonth(value);
      if (value.length === 2) {
        dayInputRef.current?.focus();
      }
    }
  };

  // 일 입력 (2자리까지만)
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 2) {
      setBirthDay(value);
    }
  };

  // 레이블 클릭 시 년도 필드로 포커스
  const handleBirthdateLabelClick = () => {
    yearInputRef.current?.focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <motion.div
        className="relative w-full max-w-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="glass" className="backdrop-blur-xl bg-white/10">
          {/* 헤더 */}
          <div className="text-center mb-10">
            <motion.h1
              className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              💪 프로필 생성
            </motion.h1>
            <motion.p
              className="text-gray-300"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              당신의 신체 정보를 기반으로 맞춤형 운동 프로그램을 제공합니다
            </motion.p>
          </div>

          {/* 에러 메시지 */}
          {createCharacterMutation.isError && (
            <motion.div
              className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="text-red-200 text-sm">
                {(createCharacterMutation.error as any)?.response?.data?.error?.message ||
                  '캐릭터 생성에 실패했습니다. 다시 시도해주세요.'}
              </p>
            </motion.div>
          )}

          {/* 인바디 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 성별 선택 */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                성별 <span className="text-secondary">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    gender === 'male'
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/50'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-4xl mb-2">👨</div>
                  <div className="text-white font-medium">남성</div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    gender === 'female'
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/50'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-4xl mb-2">👩</div>
                  <div className="text-white font-medium">여성</div>
                </motion.button>
              </div>
            </div>

            {/* 생년월일 */}
            <div>
              <label
                className="block text-sm font-medium text-white mb-3 cursor-pointer"
                onClick={handleBirthdateLabelClick}
              >
                생년월일 <span className="text-secondary">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <input
                    ref={yearInputRef}
                    type="number"
                    placeholder="1987"
                    value={birthYear}
                    onChange={handleYearChange}
                    required
                    min="1900"
                    max="2024"
                    className="block w-full rounded-lg border-2 px-4 py-3 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300 focus:border-primary focus:ring-primary text-center text-lg font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 text-sm">
                    년
                  </div>
                </div>
                <div className="relative">
                  <input
                    ref={monthInputRef}
                    type="number"
                    placeholder="01"
                    value={birthMonth}
                    onChange={handleMonthChange}
                    required
                    min="1"
                    max="12"
                    className="block w-full rounded-lg border-2 px-4 py-3 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300 focus:border-primary focus:ring-primary text-center text-lg font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 text-sm">
                    월
                  </div>
                </div>
                <div className="relative">
                  <input
                    ref={dayInputRef}
                    type="number"
                    placeholder="01"
                    value={birthDay}
                    onChange={handleDayChange}
                    required
                    min="1"
                    max="31"
                    className="block w-full rounded-lg border-2 px-4 py-3 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-gray-300 focus:border-primary focus:ring-primary text-center text-lg font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 text-sm">
                    일
                  </div>
                </div>
              </div>
            </div>

            {/* 키, 몸무게, 체지방률 */}
            <div className="grid grid-cols-3 gap-4">
              <Input
                type="number"
                label="키 (cm)"
                placeholder="170"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
                min="100"
                max="250"
                step="0.1"
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
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                }
              />

              <Input
                type="number"
                label="몸무게 (kg)"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                min="30"
                max="200"
                step="0.1"
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
                      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                    />
                  </svg>
                }
              />

            </div>

            {/* 체지방률 선택 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-white">
                  체지방률 <span className="text-gray-400 text-xs">(선택사항)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowBodyFatGuide(!showBodyFatGuide)}
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                >
                  {showBodyFatGuide ? '직접 입력 ▴' : '가이드 보기 ▾'}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {!showBodyFatGuide ? (
                  // 직접 입력 모드
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Input
                      type="number"
                      placeholder="체지방률을 모르시면 '가이드 보기'를 클릭하세요"
                      value={bodyFatPercentage}
                      onChange={(e) => setBodyFatPercentage(e.target.value)}
                      min="3"
                      max="50"
                      step="0.1"
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      }
                    />
                  </motion.div>
                ) : (
                  // 시각적 가이드 모드
                  <motion.div
                    key="guide"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-200 text-sm">
                        💡 자신의 체형과 가장 비슷한 항목을 선택하세요
                      </p>
                    </div>

                    {gender === 'male' &&
                      maleBodyFatRanges.map((range, index) => (
                        <motion.button
                          key={range.range}
                          type="button"
                          onClick={() => {
                            // 범위 중간값 설정
                            const midValue =
                              range.range === '30%+'
                                ? '32'
                                : range.range === '5-9%'
                                ? '7'
                                : String((parseInt(range.range.split('-')[0]) + parseInt(range.range.split('-')[1])) / 2);
                            setBodyFatPercentage(midValue);
                            setShowBodyFatGuide(false);
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            bodyFatPercentage &&
                            Math.abs(parseFloat(bodyFatPercentage) - parseFloat(range.range.split('-')[0])) < 5
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">{range.emoji}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-bold">{range.label}</span>
                                <span className="text-primary text-sm">({range.range})</span>
                              </div>
                              <p className="text-gray-400 text-sm">{range.description}</p>
                            </div>
                          </div>
                        </motion.button>
                      ))}

                    {gender === 'female' &&
                      femaleBodyFatRanges.map((range, index) => (
                        <motion.button
                          key={range.range}
                          type="button"
                          onClick={() => {
                            const midValue =
                              range.range === '38%+'
                                ? '40'
                                : range.range === '10-13%'
                                ? '11'
                                : String((parseInt(range.range.split('-')[0]) + parseInt(range.range.split('-')[1])) / 2);
                            setBodyFatPercentage(midValue);
                            setShowBodyFatGuide(false);
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            bodyFatPercentage &&
                            Math.abs(parseFloat(bodyFatPercentage) - parseFloat(range.range.split('-')[0])) < 5
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">{range.emoji}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-bold">{range.label}</span>
                                <span className="text-primary text-sm">({range.range})</span>
                              </div>
                              <p className="text-gray-400 text-sm">{range.description}</p>
                            </div>
                          </div>
                        </motion.button>
                      ))}

                    {!gender && (
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600 text-center">
                        <p className="text-gray-400 text-sm">먼저 성별을 선택해주세요</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* BMI 계산 표시 */}
            {height && weight && (
              <motion.div
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">BMI 지수:</span>
                  <span className="text-white font-bold text-lg">
                    {(
                      parseFloat(weight) /
                      Math.pow(parseFloat(height) / 100, 2)
                    ).toFixed(1)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {(() => {
                    const bmi =
                      parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2);
                    if (bmi < 18.5) return '저체중 - 체중 증가가 필요합니다';
                    if (bmi < 23) return '정상 체중 - 좋은 컨디션입니다!';
                    if (bmi < 25) return '과체중 - 운동을 시작하세요!';
                    if (bmi < 30) return '경도 비만 - 체중 관리가 필요합니다';
                    return '중등도 비만 이상 - 적극적인 관리가 필요합니다';
                  })()}
                </div>
              </motion.div>
            )}

            {/* 제출 버튼 */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={createCharacterMutation.isPending}
            >
              캐릭터 생성 🚀
            </Button>
          </form>

          {/* 안내 메시지 */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-200 text-sm leading-relaxed">
              💡 <strong>TIP:</strong> 입력하신 신체 정보는 운동 기록 분석과 맞춤형 추천에
              활용됩니다. 정확한 정보를 입력할수록 더 나은 경험을 제공받을 수 있습니다.
            </p>
          </div>
        </Card>

        {/* 하단 텍스트 */}
        <motion.p
          className="text-center text-gray-400 text-sm mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          헬스를 RPG처럼! 운동할수록 강해지세요 💪
        </motion.p>
      </motion.div>
    </div>
  );
}
