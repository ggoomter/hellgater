import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Play, CheckCircle, Lock, Clock, Sparkles, Trophy, Star } from 'lucide-react';
import { useCurriculum } from '../../hooks/useCurriculum';
import ExpGainAnimation from '../../components/curriculum/ExpGainAnimation';
import GameMap from '../../components/curriculum/GameMap';

interface MapNode {
  id: string;
  chapterId: number;
  lessonId: number;
  x: number;
  y: number;
  title: string;
  completed: boolean;
  locked: boolean;
  isTest?: boolean;
}

const Week0Page: React.FC = () => {
  const navigate = useNavigate();
  const { modules, weekProgress, loading, error, fetchWeekData, startWeek } = useCurriculum(0);
  const [showExpAnimation, setShowExpAnimation] = useState(false);
  const [gainedExp, setGainedExp] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  useEffect(() => {
    fetchWeekData();
  }, [fetchWeekData]);

  // 모듈을 맵 노드로 변환
  const mapNodes: MapNode[] = modules.map((module, index) => {
    // 경로를 따라 배치 (곡선 경로)
    const totalNodes = modules.length;
    const progress = index / (totalNodes - 1 || 1);
    
    // 곡선 경로 계산 (S자 형태)
    const x = 20 + (progress * 60) + Math.sin(progress * Math.PI * 2) * 10;
    const y = 20 + Math.sin(progress * Math.PI) * 30 + progress * 40;

    return {
      id: module.id,
      chapterId: 0,
      lessonId: index + 1,
      x,
      y,
      title: module.titleKo,
      completed: module.isCompleted,
      locked: weekProgress.status === 'locked' || index > weekProgress.completedModules,
      isTest: module.moduleType === 'quiz' && index === modules.length - 1,
    };
  });

  // 챕터별로 그룹화
  const chapters = [
    {
      id: 0,
      title: '0주차: 운명의 시작',
      lessons: modules.map((module, index) => ({
        id: module.id,
        number: `${0}-${index + 1}`,
        title: module.titleKo,
        completed: module.isCompleted,
        locked: weekProgress.status === 'locked' || index > weekProgress.completedModules,
        type: module.moduleType,
        estimatedTime: module.estimatedTime,
        expReward: module.expReward,
      })),
    },
  ];

  const openModule = (node: MapNode) => {
    navigate(`/curriculum/week/0/module/${node.id}`);
  };

  const handleNodeClick = (node: MapNode) => {
    openModule(node);
  };

  // 현재 위치 계산
  const currentPosition = weekProgress.completedModules > 0
    ? {
        chapterId: 0,
        lessonId: weekProgress.completedModules,
      }
    : { chapterId: 0, lessonId: 1 };

  // 필터링된 챕터
  const filteredChapters = chapters.filter((chapter) => {
    if (selectedChapter !== null && chapter.id !== selectedChapter) return false;
    if (!searchQuery) return true;
    return (
      chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chapter.lessons.some((lesson) =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-white text-2xl">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex flex-col">
      {/* 경험치 획득 애니메이션 */}
      {showExpAnimation && (
        <ExpGainAnimation
          exp={gainedExp}
          onComplete={() => setShowExpAnimation(false)}
        />
      )}

      {/* 헤더 */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-purple-500/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              hellGater
            </h1>
            <div className="h-6 w-px bg-gray-600" />
            <h2 className="text-xl font-semibold">무속성 과정</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-300">ggoomter</div>
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽 사이드바 */}
        <div className="w-80 bg-gray-800/50 backdrop-blur-lg border-r border-purple-500/30 flex flex-col">
          {/* 검색바 */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* 챕터 목록 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredChapters.map((chapter) => (
              <div key={chapter.id} className="space-y-2">
                <h3 className="text-lg font-bold text-purple-400 mb-3">{chapter.title}</h3>
                {chapter.lessons.map((lesson) => {
                  const node = mapNodes.find((n) => n.id === lesson.id);
                  return (
                    <motion.button
                      key={lesson.id}
                      onClick={() => node && !node.locked && handleNodeClick(node)}
                      disabled={lesson.locked}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        lesson.locked
                          ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                          : lesson.completed
                          ? 'bg-green-900/30 text-green-300 hover:bg-green-900/40'
                          : 'bg-gray-700/50 text-white hover:bg-gray-700/70'
                      }`}
                      whileHover={!lesson.locked ? { x: 4 } : {}}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-purple-400">{lesson.number}</span>
                        {lesson.completed && <CheckCircle className="text-green-400" size={16} />}
                        {lesson.locked && <Lock className="text-gray-500" size={16} />}
                      </div>
                      <div className="text-sm font-medium">{lesson.title}</div>
                      {!lesson.locked && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {lesson.estimatedTime}분
                          </span>
                          <span className="flex items-center gap-1 text-purple-400">
                            <Sparkles size={12} />
                            +{lesson.expReward} XP
                          </span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
                
                {/* 챕터 테스트 */}
                <motion.button
                  className="w-full text-left p-3 rounded-lg bg-purple-900/30 text-purple-300 hover:bg-purple-900/40 transition-all border border-purple-500/30"
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <Trophy size={16} />
                    </div>
                    <span className="font-semibold">Chapter 0 - Test</span>
                  </div>
                </motion.button>
              </div>
            ))}
          </div>

          {/* 진행 상황 */}
          <div className="p-4 border-t border-gray-700 bg-gray-800/30">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-400">진행률</span>
              <span className="font-bold text-purple-400">{weekProgress.progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${weekProgress.progressPercent}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {weekProgress.completedModules} / {weekProgress.totalModules} 완료
            </div>
          </div>
        </div>

        {/* 오른쪽 맵 영역 */}
        <div className="flex-1 p-6 overflow-auto">
          {weekProgress.status === 'locked' ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold mb-4">여정을 시작하세요!</h2>
                <p className="text-gray-400 mb-8">맵을 탐험하기 전에 여정을 시작해야 합니다.</p>
                <motion.button
                  onClick={startWeek}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-xl font-bold text-lg text-white shadow-2xl shadow-purple-500/50 flex items-center gap-2"
                >
                  <Play size={24} />
                  여정 시작하기
                </motion.button>
              </motion.div>
            </div>
          ) : (
            <div className="h-full min-h-[600px] bg-white rounded-lg shadow-2xl overflow-hidden">
              <GameMap
                nodes={mapNodes}
                currentPosition={currentPosition}
                onNodeClick={handleNodeClick}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Week0Page;
