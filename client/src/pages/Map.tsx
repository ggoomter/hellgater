import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/common';

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
          <h1 className="text-4xl font-bold text-white mb-2">🗺️ 맵 탐험</h1>
          <p className="text-gray-300">속성을 선택하고 지식을 탐험하세요</p>
        </motion.div>

        {/* 속성 선택 */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass" className="backdrop-blur-xl bg-white/10">
            <h2 className="text-white text-xl font-bold mb-6">속성 선택</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {attributes.map((attr, index) => (
                <motion.button
                  key={attr.id}
                  onClick={() => setSelectedAttribute(attr.id)}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    selectedAttribute === attr.id
                      ? `${attr.borderColor} ${attr.bgColor} shadow-lg`
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{attr.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{attr.shape}</span>
                        <h3 className="text-white font-bold text-sm truncate">{attr.name}</h3>
                      </div>
                      <p className="text-gray-400 text-xs leading-snug">{attr.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </Card>
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
                {currentMap.chapters.map((chapter: any, chapterIndex: number) => (
                  <motion.div
                    key={chapter.chapterId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: chapterIndex * 0.1 }}
                  >
                    <Card variant="glass" className="backdrop-blur-xl bg-white/10">
                      {/* 챕터 헤더 */}
                      <div className="mb-6 pb-4 border-b border-gray-700">
                        <h2 className="text-2xl font-bold text-white mb-1">{chapter.title}</h2>
                        {chapter.subTitle && (
                          <p className="text-gray-400 text-sm">{chapter.subTitle}</p>
                        )}
                      </div>

                      {/* 스테이지 목록 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {chapter.stages.map((stage: any, stageIndex: number) => {
                          const isLocked = stage.locked;
                          const isCompleted = stage.completed;

                          return (
                            <motion.button
                              key={stage.stageId}
                              disabled={isLocked}
                              onClick={() => !isLocked && handleStageClick(chapter.chapterId, stage.stageId)}
                              className={`p-5 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                                isCompleted
                                  ? 'border-green-500 bg-green-900/20'
                                  : isLocked
                                  ? 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                                  : 'border-primary bg-primary/10 hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/30 cursor-pointer'
                              }`}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + stageIndex * 0.05 }}
                              whileHover={!isLocked ? { scale: 1.03, y: -2 } : {}}
                              whileTap={!isLocked ? { scale: 0.98 } : {}}
                            >
                              {/* 잠금/완료 아이콘 */}
                              <div className="absolute top-3 right-3">
                                {isCompleted ? (
                                  <span className="text-2xl">✅</span>
                                ) : isLocked ? (
                                  <span className="text-2xl">🔒</span>
                                ) : (
                                  <span className="text-2xl">⭐</span>
                                )}
                              </div>

                              {/* 스테이지 번호와 제목 */}
                              <div className="pr-8">
                                <div className="text-primary font-bold text-sm mb-2">
                                  {chapter.chapterId}-{stage.stageId}
                                </div>
                                <h3
                                  className={`font-bold leading-snug ${
                                    isLocked ? 'text-gray-500' : 'text-white'
                                  }`}
                                >
                                  {stage.title}
                                </h3>
                              </div>

                              {/* 진행 상태 표시 */}
                              {!isLocked && !isCompleted && (
                                <div className="mt-3 pt-3 border-t border-gray-700">
                                  <span className="text-primary text-xs font-medium">
                                    시작하기 →
                                  </span>
                                </div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              // 아직 구현되지 않은 속성
              <Card variant="glass" className="backdrop-blur-xl bg-white/10">
                <div className="text-center py-16">
                  <div className="text-6xl mb-6">🚧</div>
                  <h3 className="text-2xl font-bold text-white mb-3">준비 중입니다</h3>
                  <p className="text-gray-400">
                    {attributes.find((a) => a.id === selectedAttribute)?.name} 맵은 곧 오픈됩니다!
                  </p>
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
