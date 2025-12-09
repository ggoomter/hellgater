import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, GameCard } from '../components/common';

// 5속성 정의
const attributes = [
  {
    id: 'neutral',
    name: '무속성',
    nameEn: 'Neutral',
    color: 'from-green-600 to-emerald-500',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-500',
    description: '기초 지식과 영양 관리',
    icon: '🌱',
    shape: '●',
  },
  {
    id: 'earth',
    name: '땅 (근육)',
    nameEn: 'Earth',
    color: 'from-yellow-600 to-amber-500',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-500',
    description: '보디빌딩, 부위별 분할 운동',
    icon: '🏔️',
    shape: '■',
  },
  {
    id: 'fire',
    name: '불 (체력)',
    nameEn: 'Fire',
    color: 'from-red-600 to-orange-500',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-500',
    description: '크로스핏, 고강도 전신 운동',
    icon: '🔥',
    shape: '▲',
  },
  {
    id: 'wind',
    name: '바람 (심폐)',
    nameEn: 'Wind',
    color: 'from-cyan-600 to-teal-500',
    bgColor: 'bg-cyan-900/20',
    borderColor: 'border-cyan-500',
    description: '맨몸운동, 고강도 리듬, 사이클',
    icon: '💨',
    shape: '◆',
  },
  {
    id: 'water',
    name: '물 (지방)',
    nameEn: 'Water',
    color: 'from-blue-600 to-indigo-500',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500',
    description: '저강도 장시간 유산소',
    icon: '💧',
    shape: '◉',
  },
  {
    id: 'mind',
    name: '마음 (근성)',
    nameEn: 'Mind',
    color: 'from-purple-600 to-violet-500',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-500',
    description: '정신력 훈련, 월벤 놀지 않는다',
    icon: '🧠',
    shape: '◈',
  },
];

// 맵 데이터 (MVP: 무속성과 불속성만 구현)
const mapData: Record<string, any> = {
  neutral: {
    chapters: [
      {
        chapterId: 1,
        title: 'Chapter 1: 기초지식',
        stages: [
          { stageId: 1, title: '근성장의 원리', locked: false, completed: false },
          { stageId: 2, title: '살이 찌지지 않는 오해', locked: true, completed: false },
          { stageId: 3, title: '운동과 횟수 vs 세트별', locked: true, completed: false },
          { stageId: 4, title: '무슨 운동을 해야할까?', locked: true, completed: false },
          { stageId: 5, title: '피곤해보이지만 원리', locked: true, completed: false },
        ],
      },
      {
        chapterId: 2,
        title: 'Chapter 2: 영양 지식',
        stages: [
          { stageId: 1, title: '칼로리란?', locked: true, completed: false },
          { stageId: 2, title: '기초대사량이란?', locked: true, completed: false },
          { stageId: 3, title: '탄수화물', locked: true, completed: false },
          { stageId: 4, title: '단백질과 권장', locked: true, completed: false },
          { stageId: 5, title: '탄수화물', locked: true, completed: false },
          { stageId: 6, title: '단백질', locked: true, completed: false },
          { stageId: 7, title: '지방', locked: true, completed: false },
          { stageId: 8, title: '탄단지의 비율', locked: true, completed: false },
          { stageId: 9, title: '이 지식', locked: true, completed: false },
        ],
      },
    ],
  },
  fire: {
    chapters: [
      {
        chapterId: 1,
        title: 'Chapter 1: 기초지식',
        stages: [
          { stageId: 1, title: '불속성 편생', locked: false, completed: false },
          { stageId: 2, title: '크로스핏 철학', locked: true, completed: false },
          { stageId: 3, title: '식단은 어떻게?', locked: true, completed: false },
          { stageId: 4, title: '무슨 운동을 해야하나?', locked: true, completed: false },
          { stageId: 5, title: '어느정도의 고강도?', locked: true, completed: false },
          { stageId: 6, title: '지치면다 농력', locked: true, completed: false },
        ],
      },
      {
        chapterId: 2,
        title: 'Chapter 2: 운동',
        subTitle: '<초급>',
        stages: [
          { stageId: 1, title: '푸쉬업 연속 40개', locked: true, completed: false },
          { stageId: 2, title: '스쿼트 연속 40개', locked: true, completed: false },
          { stageId: 3, title: '버피 연속 6개', locked: true, completed: false },
          { stageId: 4, title: '버피 연속 20개', locked: true, completed: false },
        ],
      },
      {
        chapterId: 3,
        title: 'Chapter 2: 운동',
        subTitle: '<중급>',
        stages: [
          { stageId: 1, title: '푸쉬업 연속 50개', locked: true, completed: false },
          { stageId: 2, title: '스쿼트 연속 50개', locked: true, completed: false },
        ],
      },
    ],
  },
};

export default function Map() {
  const navigate = useNavigate();
  const [selectedAttribute, setSelectedAttribute] = useState<string>('neutral');

  const currentMap = mapData[selectedAttribute] || { chapters: [] };

  const handleStageClick = (chapterId: number, stageId: number) => {
    navigate(`/map/${selectedAttribute}/${chapterId}/${stageId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* 헬스맵 배경 이미지 */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/health-map.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.25,
          zIndex: 0
        }}
      />
      
      {/* 콘텐츠 컨테이너 */}
      <div className="relative z-10 min-h-screen">

      {/* 배경 애니메이션 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* 메인 글로우 */}
        <motion.div
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto p-4 md:p-6">
        {/* 헤더 */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
            <div className="flex-1">
              <motion.div
                className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2"
                animate={{ textShadow: ['0 0 20px rgba(168,85,247,0.5)', '0 0 40px rgba(168,85,247,0.8)', '0 0 20px rgba(168,85,247,0.5)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🗺️ 던전 탐험
              </motion.div>
              <p className="text-lg text-gray-400">
                각 <span className="text-cyan-400 font-bold">속성 라인</span>을 선택해 나만의 운동 여정을 시작하세요
              </p>
            </div>

            {/* 네비게이션 버튼 */}
            <div className="flex gap-2 flex-shrink-0">
              <motion.button
                onClick={() => navigate('/')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-green-500/50 transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                🏠 홈
              </motion.button>
              <motion.button
                onClick={() => navigate('/workout/record')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                💪 운동 기록
              </motion.button>
            </div>

            {/* 진행도 요약 */}
            <motion.div
              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm"
              animate={{ borderColor: ['rgba(168,85,247,0.3)', 'rgba(34,211,238,0.5)', 'rgba(168,85,247,0.3)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-2">전체 진행도</p>
                <div className="flex gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">12</p>
                    <p className="text-xs text-gray-400">완료</p>
                  </div>
                  <div className="text-gray-600">|</div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">18</p>
                    <p className="text-xs text-gray-400">진행 중</p>
                  </div>
                  <div className="text-gray-600">|</div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-500">25</p>
                    <p className="text-xs text-gray-400">잠금</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* 속성 선택 - 더 큰 카드 */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-2">
            ⚡ 속성 라인 선택
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {attributes.map((attr, index) => (
              <motion.button
                key={attr.id}
                onClick={() => setSelectedAttribute(attr.id)}
                className={`relative p-4 rounded-xl border-2 transition-all overflow-hidden group ${
                  selectedAttribute === attr.id
                    ? `${attr.borderColor} ${attr.bgColor} shadow-lg shadow-purple-500/50`
                    : 'border-gray-700 bg-gray-800/30 hover:border-purple-500/50 hover:bg-gray-800/50'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* 글로우 배경 */}
                {selectedAttribute === attr.id && (
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r rounded-xl blur opacity-50"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${attr.color})`
                    }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* 콘텐츠 */}
                <div className="relative flex flex-col items-center text-center gap-2">
                  <div className="text-3xl">{attr.icon}</div>
                  <div>
                    <h3 className="text-white font-bold text-xs leading-tight">{attr.name}</h3>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">{attr.description}</p>
                  </div>
                  {selectedAttribute === attr.id && (
                    <motion.div
                      className="mt-2 text-yellow-400 text-sm font-bold"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      선택됨 ✓
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 선택된 맵 표시 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAttribute}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentMap.chapters.length > 0 ? (
              <div className="space-y-8">
                {/* 라인 요약 */}
                <GameCard glowing delay={0.2}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                      <p className="text-gray-400 text-sm mb-2">👥 라인 선택</p>
                      <p className="text-2xl font-bold text-white">{attributes.find(a => a.id === selectedAttribute)?.name}</p>
                      <p className="text-gray-500 text-xs mt-2">{attributes.find(a => a.id === selectedAttribute)?.description}</p>
                    </div>
                    <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg text-center">
                      <p className="text-gray-400 text-sm mb-2">✅ 완료</p>
                      <p className="text-3xl font-bold text-green-400">4</p>
                      <p className="text-gray-500 text-xs mt-2">스테이지</p>
                    </div>
                    <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg text-center">
                      <p className="text-gray-400 text-sm mb-2">⚡ 진행 중</p>
                      <p className="text-3xl font-bold text-yellow-400">6</p>
                      <p className="text-gray-500 text-xs mt-2">스테이지</p>
                    </div>
                    <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg text-center">
                      <p className="text-gray-400 text-sm mb-2">🔒 잠금</p>
                      <p className="text-3xl font-bold text-purple-400">15</p>
                      <p className="text-gray-500 text-xs mt-2">스테이지</p>
                    </div>
                  </div>
                </GameCard>

                {/* 챕터들 */}
                {currentMap.chapters.map((chapter: any, chapterIndex: number) => (
                  <motion.div
                    key={chapter.chapterId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + chapterIndex * 0.1 }}
                  >
                    <GameCard delay={0.3 + chapterIndex * 0.1}>
                      {/* 챕터 헤더 */}
                      <div className="mb-8 pb-6 border-b border-gradient-to-r from-purple-600 to-transparent">
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="text-4xl">🎯</span>
                            {chapter.title}
                          </h2>
                          <div className="text-right">
                            <p className="text-purple-400 font-bold">{chapter.chapterId}</p>
                            <p className="text-xs text-gray-400">챕터</p>
                          </div>
                        </div>
                        {chapter.subTitle && (
                          <p className="text-cyan-400 font-semibold text-sm flex items-center gap-2">
                            <span>📊</span>
                            {chapter.subTitle}
                          </p>
                        )}
                        {/* 챕터 진행도 바 */}
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>챕터 진행도</span>
                            <span>4 / 6</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              initial={{ width: 0 }}
                              animate={{ width: '66%' }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 스테이지 목록 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {chapter.stages.map((stage: any, stageIndex: number) => {
                          const isLocked = stage.locked;
                          const isCompleted = stage.completed;

                          return (
                            <motion.button
                              key={stage.stageId}
                              disabled={isLocked}
                              onClick={() => !isLocked && handleStageClick(chapter.chapterId, stage.stageId)}
                              className={`relative group overflow-hidden rounded-lg border-2 text-left transition-all p-4 ${
                                isCompleted
                                  ? 'border-green-500/50 bg-green-900/20 hover:bg-green-900/30'
                                  : isLocked
                                  ? 'border-gray-700/50 bg-gray-800/20 opacity-50 cursor-not-allowed'
                                  : 'border-purple-500/50 bg-purple-900/20 hover:bg-purple-900/30 hover:border-purple-400 cursor-pointer'
                              }`}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.35 + stageIndex * 0.05 }}
                              whileHover={!isLocked ? { scale: 1.05, y: -4 } : {}}
                              whileTap={!isLocked ? { scale: 0.95 } : {}}
                            >
                              {/* 배경 글로우 */}
                              {!isLocked && !isCompleted && (
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-purple-600/0"
                                  animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                />
                              )}

                              {/* 상태 아이콘 */}
                              <div className="absolute top-2 right-2 text-2xl">
                                {isCompleted ? '✅' : isLocked ? '🔒' : '⭐'}
                              </div>

                              {/* 콘텐츠 */}
                              <div className="relative pr-8">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-purple-400 font-bold text-xs">
                                    {chapter.chapterId}-{stage.stageId}
                                  </span>
                                  <div className="text-xl">{isCompleted ? '🏆' : isLocked ? '🚫' : '🎮'}</div>
                                </div>
                                <h3 className={`font-bold text-sm leading-tight mb-2 ${
                                  isLocked ? 'text-gray-500' : 'text-white'
                                }`}>
                                  {stage.title}
                                </h3>

                                {/* 난이도 표시 */}
                                <div className="flex gap-1">
                                  {[...Array(stage.stageId % 5)].map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                                  ))}
                                </div>

                                {/* 보상 표시 */}
                                {!isLocked && !isCompleted && (
                                  <div className="mt-2 pt-2 border-t border-gray-700">
                                    <p className="text-cyan-400 text-xs font-bold">
                                      보상: +250 EXP
                                    </p>
                                  </div>
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </GameCard>
                  </motion.div>
                ))}
              </div>
            ) : (
              // 아직 구현되지 않은 속성
              <GameCard glowing>
                <div className="text-center py-20">
                  <motion.div
                    className="text-8xl mb-6"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🔨
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-3">준비 중입니다!</h3>
                  <p className="text-gray-400 mb-6">
                    {attributes.find((a) => a.id === selectedAttribute)?.name} 라인은 곧 오픈됩니다
                  </p>
                  <div className="inline-flex gap-2">
                    <span className="inline-block animate-bounce text-2xl">⏳</span>
                    <span className="inline-block animate-bounce text-2xl" style={{ animationDelay: '0.2s' }}>
                      ⏳
                    </span>
                    <span className="inline-block animate-bounce text-2xl" style={{ animationDelay: '0.4s' }}>
                      ⏳
                    </span>
                  </div>
                </div>
              </GameCard>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 하단 네비게이션 */}
        <motion.div
          className="mt-12 flex flex-col sm:flex-row gap-3 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            ← 홈으로 돌아가기
          </motion.button>
          <motion.button
            onClick={() => navigate('/workout/record')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            운동 기록하기 →
          </motion.button>
        </motion.div>
      </div>
      </div>
    </div>
  );
}

