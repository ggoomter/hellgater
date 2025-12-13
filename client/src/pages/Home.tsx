import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button, Card, GameCard, AnimatedCharacter, LevelBadge, StatBar, QuestPanel, AchievementBadge, StreakCounter, WeeklyGoal, BodyPartVisualization } from '../components/common';
import { useMyCharacter } from '../hooks/useCharacter';
import { useMe } from '../hooks/useAuth';

// 신체 부위 아이콘 매핑
const bodyPartIcons: Record<string, string> = {
  chest: '💪',
  back: '🦸',
  legs: '🦵',
  shoulders: '🏋️',
  arms: '💪',
  abs: '⚡',
  cardio: '❤️',
};

// 캐릭터 모델 이모지
const characterEmojis: Record<string, string> = {
  warrior: '⚔️',
  mage: '🔮',
  rogue: '🗡️',
};

export default function Home() {
  const { data: user, isLoading: userLoading } = useMe();
  const { data: character, isLoading: characterLoading } = useMyCharacter();
  const [expandedStat, setExpandedStat] = useState<string | null>(null);

  if (userLoading || characterLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white text-3xl font-bold"
        >
          🎮 게임 로딩 중...
        </motion.div>
      </div>
    );
  }

  if (!user || !character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <GameCard glowing>
          <p className="text-white mb-4 text-lg">⚠️ 캐릭터 정보를 불러올 수 없습니다.</p>
          <Link to="/character/create">
            <Button variant="primary">🎭 프로필 생성하기</Button>
          </Link>
        </GameCard>
      </div>
    );
  }

  const characterLevel = character.totalLevel ?? 1;
  const nextLevelExp = character.nextLevelExp ?? 1000;
  const currentExp = character.totalExp ?? 0;
  const expPercentage = nextLevelExp > 0 ? (currentExp / nextLevelExp) * 100 : 0;
  
  // 등급 계산 (레벨 기반)
  const getGrade = (level: number): string => {
    if (level >= 50) return 'DIAMOND';
    if (level >= 40) return 'PLATINUM';
    if (level >= 30) return 'GOLD';
    if (level >= 20) return 'SILVER';
    return 'BRONZE';
  };
  const grade = getGrade(characterLevel);

  // Mock 퀘스트 데이터
  const dailyQuests = [
    { id: '1', title: '첫 운동', description: '오늘의 첫 운동을 기록하세요', reward: 100, progress: 0, total: 1, completed: false, icon: '💪' },
    { id: '2', title: '신체 3부위 운동', description: '3개 이상의 신체 부위를 운동하세요', reward: 200, progress: 2, total: 3, completed: false, icon: '🏋️' },
    { id: '3', title: '1000칼로리 소모', description: '1000칼로리 이상 소모하세요', reward: 150, progress: 650, total: 1000, completed: false, icon: '🔥' },
  ];

  // Mock 업적 데이터
  const achievements = [
    { icon: '🥇', title: '첫 운동', description: '첫 운동 완료', unlocked: false },
    { icon: '🏋️', title: '근력의 신', description: '벤치프레스 100kg 달성', unlocked: false },
    { icon: '🔥', title: '불타는 에너지', description: '일주일 연속 운동', unlocked: false },
    { icon: '🚀', title: '상승하는 별', description: '레벨 10 달성', unlocked: false },
    { icon: '👑', title: '챌린저', description: '챌린저 등급 도달', unlocked: false },
    { icon: '💎', title: '완벽한 신체', description: '모든 신체부위 Lv.50 도달', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-6">
      {/* 배경 애니메이션 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* 메인 글로우 */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* 그리드 배경 */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* ===== 헤더 ===== */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <motion.div
                className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2"
                animate={{ textShadow: ['0 0 20px rgba(168,85,247,0.5)', '0 0 40px rgba(168,85,247,0.8)', '0 0 20px rgba(168,85,247,0.5)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ⚔️ 헬게이터
              </motion.div>
              <p className="text-lg text-gray-400">
                {user.username}님, <span className="text-cyan-400 font-bold">오늘의 도전을 시작하세요!</span>
              </p>
            </div>

            {/* 퀵 네비게이션 */}
            <div className="flex flex-wrap gap-2">
              <Link to="/workout/record">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="primary" size="sm">
                    💪 운동 기록
                  </Button>
                </motion.div>
              </Link>
              <Link to="/map">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="secondary" size="sm">
                    🗺️ 맵 탐험
                  </Button>
                </motion.div>
              </Link>
              <Link to="/profile/settings">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm">
                    ⚙️ 설정
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ===== 메인 콘텐츠 ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* 캐릭터 & 레벨 섹션 */}
          <div className="lg:col-span-4 space-y-6">
            {/* 애니메이션 캐릭터 */}
            <GameCard glowing delay={0.1}>
              <div className="text-center py-8">
                <AnimatedCharacter
                  emoji={characterEmojis[character.characterModel || 'warrior'] || '💪'}
                  level={characterLevel}
                  className="flex justify-center mb-4"
                  isLevelUp={false}
                />
              </div>
            </GameCard>

            {/* 레벨 뱃지 */}
            <div className="flex justify-center">
              <LevelBadge grade={grade} level={characterLevel} />
            </div>

            {/* EXP 진행률 */}
            <GameCard delay={0.2}>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                ⚡ 경험치 진행도
              </h3>

              <div className="space-y-4">
                {/* 진행률 표시 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">현재 경험치</span>
                    <span className="text-cyan-400 font-bold">
                      {currentExp.toLocaleString()} / {nextLevelExp.toLocaleString()}
                    </span>
                  </div>

                  {/* 애니메이션 진행률 바 */}
                  <div className="relative h-6 bg-gray-800 rounded-full border-2 border-purple-500/30 overflow-hidden">
                    {/* 배경 이동 효과 */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      style={{ backgroundSize: '200% 100%' }}
                    />

                    {/* 채워지는 바 */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                      animate={{ width: `${expPercentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />

                    {/* 진행률 텍스트 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {Math.round(expPercentage)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 다음 레벨까지 필요 경험치 */}
                <motion.div
                  className="bg-gray-800/50 p-3 rounded-lg text-center"
                  animate={{ boxShadow: ['0 0 10px rgba(168,85,247,0)', '0 0 20px rgba(168,85,247,0.5)', '0 0 10px rgba(168,85,247,0)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <p className="text-xs text-gray-400">다음 레벨까지</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {(nextLevelExp - currentExp).toLocaleString()} EXP 필요
                  </p>
                </motion.div>
              </div>
            </GameCard>

            {/* 연속 추적 & 주간 목표 */}
            <GameCard delay={0.32}>
              <StreakCounter
                currentStreak={0}
                bestStreak={0}
                lastActivityDate="-"
              />
            </GameCard>

            <GameCard delay={0.34}>
              <WeeklyGoal
                targetWorkouts={3}
                completedWorkouts={0}
                targetMinutes={150}
                completedMinutes={0}
              />
            </GameCard>

            {/* 퀵 액션 */}
            <GameCard delay={0.36}>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                🚀 빠른 액션
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <Link to="/workout/record">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="primary" fullWidth className="text-sm">
                      💪 운동 시작하기
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/map">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="secondary" fullWidth className="text-sm">
                      🗺️ 다음 스테이지 확인
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/skills">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="ghost" fullWidth className="text-sm">
                      ⚡ 스킬 트리 보기
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </GameCard>
          </div>

          {/* 스탯 & 신체 부위 섹션 */}
          <div className="lg:col-span-8 space-y-6">
            {/* 스탯 상세 */}
            <GameCard delay={0.25}>
              <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
                📊 캐릭터 스탯
              </h3>

              <div className="space-y-4">
                {[
                  { label: '근지구력', value: character.stats?.muscleEndurance || 10, icon: '💪', color: 'primary' },
                  { label: '근력', value: character.stats?.strength || 10, icon: '🦾', color: 'secondary' },
                  { label: '순발력', value: character.stats?.explosivePower || 10, icon: '⚡', color: 'accent' },
                  { label: '속도', value: character.stats?.speed || 10, icon: '🏃', color: 'success' },
                  { label: '정신력', value: character.stats?.mentalPower || 10, icon: '🧠', color: 'warning' },
                  { label: '유연성', value: character.stats?.flexibility || 10, icon: '🤸', color: 'danger' },
                ].map((stat, index) => (
                  <StatBar
                    key={stat.label}
                    label={stat.label}
                    icon={stat.icon}
                    value={stat.value}
                    maxValue={100}
                    color={stat.color as any}
                    animated={true}
                  />
                ))}
              </div>
            </GameCard>

            {/* 신체 부위 레벨 */}
            {character.bodyParts && character.bodyParts.length > 0 && (
              <GameCard delay={0.35}>
                <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
                  🏋️ 신체 부위 레벨
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {character.bodyParts.map((part, index) => {
                    const expPercentage = part.nextLevelExp > 0 ? (part.currentExp / part.nextLevelExp) * 100 : 0;
                    return (
                      <motion.div
                        key={part.code}
                        className="p-4 rounded-lg border border-gray-700 bg-gray-800/30 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all cursor-pointer group"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        onClick={() => setExpandedStat(expandedStat === part.code ? null : part.code)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl group-hover:scale-125 transition-transform">
                              {bodyPartIcons[part.code] || '💪'}
                            </span>
                            <div>
                              <p className="text-white font-bold text-sm">{part.name}</p>
                              <p className="text-xs text-purple-400 font-bold">Lv. {part.level}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-400 text-xs font-bold">{part.currentExp}</p>
                            <p className="text-gray-500 text-xs">/ {part.nextLevelExp}</p>
                          </div>
                        </div>

                        {/* 진행률 바 */}
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${expPercentage}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </GameCard>
            )}

            {/* 체지방률 시각화 */}
            <GameCard delay={0.4}>
              <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
                👤 신체 구성 분석
              </h3>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* 비주얼라이제이션 */}
                <div className="flex-shrink-0">
                  <BodyPartVisualization
                    bodyParts={character.bodyParts?.map((part) => ({
                      id: part.code,
                      name: part.name,
                      level: part.level,
                      exp: part.currentExp,
                      maxExp: part.nextLevelExp,
                      icon: bodyPartIcons[part.code] || '💪',
                    })) || []}
                  />
                </div>

                {/* 신체 부위 레벨 요약 */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 p-4 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">평균 레벨</p>
                      <p className="text-3xl font-bold text-purple-400">
                        {character.bodyParts && character.bodyParts.length > 0
                          ? Math.round(
                              character.bodyParts.reduce((sum, part) => sum + part.level, 0) /
                                character.bodyParts.length
                            )
                          : 1}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">신체 부위</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 p-4 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">활동 부위</p>
                      <p className="text-3xl font-bold text-blue-400">
                        {character.bodyParts?.length || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">개 부위</p>
                    </div>
                  </div>

                  {/* 추천 */}
                  <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg">
                    <p className="text-purple-300 text-xs font-bold mb-2">💡 추천</p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {character.bodyParts && character.bodyParts.length > 0
                        ? '균형잡힌 운동을 위해 모든 신체 부위를 골고루 단련하세요. 오늘도 화이팅!'
                        : '운동을 시작하여 신체 부위 레벨을 올려보세요!'}
                    </p>
                  </div>
                </div>
              </div>
            </GameCard>
          </div>
        </div>

        {/* ===== 하단 섹션 ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 일일 퀘스트 */}
          <GameCard glowing delay={0.45} className="lg:col-span-1">
            <QuestPanel quests={dailyQuests} title="📜 일일 퀘스트" />
          </GameCard>

          {/* 최근 활동 */}
          <div className="lg:col-span-2">
            <GameCard delay={0.5}>
              <h3 className="text-white text-lg font-bold mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">📝 최근 운동 기록</span>
                <Link to="/history">
                  <Button variant="ghost" size="sm">
                    전체 보기 →
                  </Button>
                </Link>
              </h3>

              <div className="space-y-3">
                {([] as any[]).map((activity, index) => (
                  <motion.div
                    key={index}
                    className="p-4 rounded-lg border border-gray-700/50 bg-gray-800/20 hover:bg-gray-800/40 hover:border-green-500/50 transition-all group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + index * 0.1 }}
                    whileHover={{ x: 10 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-2xl group-hover:scale-125 transition-transform">{activity.icon}</div>
                        <div>
                          <p className="text-white font-bold">{activity.exercise}</p>
                          <p className="text-gray-400 text-sm">{activity.sets}세트 × {activity.weight}kg</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <motion.p
                          className="text-yellow-400 font-bold"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          +{activity.exp}
                        </motion.p>
                        <p className="text-gray-500 text-xs">{activity.date}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GameCard>
          </div>
        </div>

        {/* ===== 업적 섹션 ===== */}
        <GameCard glowing delay={0.6}>
          <h3 className="text-white text-lg font-bold mb-8 flex items-center gap-2">
            🏆 업적 & 뱃지
          </h3>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.65 + index * 0.05 }}
              >
                <AchievementBadge achievement={achievement} />
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-lg border border-purple-500/30 text-center"
            animate={{ borderColor: ['rgba(168,85,247,0.3)', 'rgba(34,211,238,0.5)', 'rgba(168,85,247,0.3)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <p className="text-gray-300 text-sm">
              <span className="text-cyan-400 font-bold">3개</span> 업적 획득 | <span className="text-purple-400 font-bold">3개</span> 진행 중
            </p>
          </motion.div>
        </GameCard>
      </div>
    </div>
  );
}
