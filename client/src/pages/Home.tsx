import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button, Card } from '../components/common';
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

// 등급별 색상
const gradeColors: Record<string, { bg: string; text: string; border: string }> = {
  BRONZE: { bg: 'bg-orange-900/30', text: 'text-orange-400', border: 'border-orange-600' },
  SILVER: { bg: 'bg-gray-700/30', text: 'text-gray-300', border: 'border-gray-500' },
  GOLD: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border-yellow-600' },
  PLATINUM: { bg: 'bg-cyan-900/30', text: 'text-cyan-400', border: 'border-cyan-600' },
  DIAMOND: { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border-blue-600' },
  MASTER: { bg: 'bg-purple-900/30', text: 'text-purple-400', border: 'border-purple-600' },
  CHALLENGER: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-600' },
};

export default function Home() {
  const { data: user, isLoading: userLoading } = useMe();
  const { data: character, isLoading: characterLoading } = useMyCharacter();

  if (userLoading || characterLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!user || !character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Card variant="glass">
          <p className="text-white mb-4">캐릭터 정보를 불러올 수 없습니다.</p>
          <Link to="/character/create">
            <Button variant="primary">프로필 생성하기</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // 안전한 등급 처리
  const characterGrade = character.grade || 'BRONZE';
  const gradeStyle = gradeColors[characterGrade] || gradeColors.BRONZE;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* 헤더 */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-white">환영합니다, {user.username}님!</h1>
            <Link to="/profile/settings">
              <Button variant="ghost" size="sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Button>
            </Link>
          </div>
          <p className="text-gray-400">오늘도 함께 성장해봐요!</p>
        </motion.div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 캐릭터 정보 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 캐릭터 카드 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="glass" className="backdrop-blur-xl bg-white/10">
                {/* 캐릭터 아바타 */}
                <div className="text-center mb-6">
                  <div className="text-8xl mb-4">
                    {characterEmojis[character.characterModel || 'warrior'] || '💪'}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Lv. {character.totalLevel || 1}
                  </h2>

                  {/* 등급 배지 */}
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${gradeStyle.bg} ${gradeStyle.border}`}
                  >
                    <span className={`font-bold ${gradeStyle.text}`}>{characterGrade}</span>
                  </div>
                </div>

                {/* 경험치 바 */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>EXP</span>
                    <span>
                      {(character.totalExp || 0).toLocaleString()} / {(character.nextLevelExp || 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-secondary"
                      initial={{ width: 0 }}
                      animate={{ width: `${((character.totalExp || 0) / (character.nextLevelExp || 1000)) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* 스탯 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">근지구력</p>
                    <p className="text-white text-xl font-bold">{character.stats?.muscleEndurance || 10}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">근력</p>
                    <p className="text-white text-xl font-bold">{character.stats?.strength || 10}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">순발력</p>
                    <p className="text-white text-xl font-bold">{character.stats?.explosivePower || 10}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">속도</p>
                    <p className="text-white text-xl font-bold">{character.stats?.speed || 10}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">정신력</p>
                    <p className="text-white text-xl font-bold">{character.stats?.mentalPower || 10}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs mb-1">유연성</p>
                    <p className="text-white text-xl font-bold">{character.stats?.flexibility || 10}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 빠른 액션 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="glass" className="backdrop-blur-xl bg-white/10">
                <h3 className="text-white text-lg font-bold mb-4">빠른 액션</h3>
                <div className="space-y-3">
                  <Link to="/workout/record">
                    <Button variant="primary" fullWidth>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      운동 기록하기
                    </Button>
                  </Link>
                  <Link to="/map">
                    <Button variant="secondary" fullWidth>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      맵 탐험하기
                    </Button>
                  </Link>
                  <Link to="/skills">
                    <Button variant="ghost" fullWidth>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      스킬 트리
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* 오른쪽: 신체 부위 & 활동 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 신체 부위 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card variant="glass" className="backdrop-blur-xl bg-white/10">
                <h3 className="text-white text-xl font-bold mb-6">신체 부위 레벨</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mock data - 실제로는 API에서 가져와야 함 */}
                  {[
                    { id: 'chest', name: '가슴', level: 5, exp: 350, maxExp: 500 },
                    { id: 'back', name: '등', level: 4, exp: 280, maxExp: 400 },
                    { id: 'legs', name: '다리', level: 6, exp: 420, maxExp: 600 },
                    { id: 'shoulders', name: '어깨', level: 3, exp: 150, maxExp: 300 },
                    { id: 'arms', name: '팔', level: 4, exp: 200, maxExp: 400 },
                    { id: 'abs', name: '복근', level: 5, exp: 380, maxExp: 500 },
                    { id: 'cardio', name: '심폐', level: 7, exp: 600, maxExp: 700 },
                  ].map((part, index) => (
                    <motion.div
                      key={part.id}
                      className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-primary/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{bodyPartIcons[part.id]}</span>
                          <div>
                            <p className="text-white font-bold">{part.name}</p>
                            <p className="text-gray-400 text-xs">Lv. {part.level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-primary text-sm font-bold">{part.exp}</p>
                          <p className="text-gray-500 text-xs">/ {part.maxExp}</p>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: 0 }}
                          animate={{ width: `${(part.exp / part.maxExp) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + index * 0.05 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* 최근 활동 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card variant="glass" className="backdrop-blur-xl bg-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-xl font-bold">최근 활동</h3>
                  <Link to="/history">
                    <Button variant="ghost" size="sm">
                      전체 보기
                    </Button>
                  </Link>
                </div>

                {/* Mock data - 실제로는 API에서 가져와야 함 */}
                <div className="space-y-3">
                  {[
                    { date: '2024-01-15', exercise: '벤치프레스', sets: 3, weight: 80, exp: 240 },
                    { date: '2024-01-14', exercise: '스쿼트', sets: 4, weight: 100, exp: 400 },
                    { date: '2024-01-13', exercise: '데드리프트', sets: 3, weight: 120, exp: 360 },
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="flex-1">
                        <p className="text-white font-bold">{activity.exercise}</p>
                        <p className="text-gray-400 text-sm">
                          {activity.sets}세트 × {activity.weight}kg
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-bold">+{activity.exp} EXP</p>
                        <p className="text-gray-500 text-xs">{activity.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 빈 상태 */}
                {/* <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-400 mb-4">아직 운동 기록이 없습니다</p>
                  <Link to="/workout/record">
                    <Button variant="primary">첫 운동 기록하기</Button>
                  </Link>
                </div> */}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
