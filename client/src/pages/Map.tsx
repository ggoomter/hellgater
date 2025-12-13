import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import IsometricGameMap from '../components/map/IsometricGameMap';
import NeutralContinentMap from '../components/map/NeutralContinentMap';
import { Search, BookOpen, Trophy, MapPin, CheckCircle2, Lock } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  // 로컬 스토리지에서 완료된 스테이지 불러오기
  const getCompletedStages = (): Set<string> => {
    const saved = localStorage.getItem('completedStages');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  };

  const completedStages = getCompletedStages();

  // 맵 데이터에 완료 상태와 잠금 상태 적용
  const currentMap = useMemo(() => {
    const baseMap = mapData[selectedAttribute] || { chapters: [] };

    return {
      ...baseMap,
      chapters: baseMap.chapters.map((chapter: any) => ({
        ...chapter,
        stages: chapter.stages.map((stage: any, stageIdx: number) => {
          const stageKey = `${selectedAttribute}-${chapter.chapterId}-${stage.stageId}`;
          const isCompleted = completedStages.has(stageKey);

          // 첫 번째 스테이지는 항상 해금
          if (chapter.chapterId === 1 && stage.stageId === 1) {
            return { ...stage, locked: false, completed: isCompleted };
          }

          // 이전 스테이지가 완료되었는지 확인
          let isUnlocked = false;

          // 같은 챕터 내에서 이전 스테이지 확인
          if (stage.stageId > 1) {
            const prevStageKey = `${selectedAttribute}-${chapter.chapterId}-${stage.stageId - 1}`;
            isUnlocked = completedStages.has(prevStageKey);
          } else if (chapter.chapterId > 1) {
            // 이전 챕터의 마지막 스테이지가 완료되었는지 확인
            const prevChapter = baseMap.chapters.find((c: any) => c.chapterId === chapter.chapterId - 1);
            if (prevChapter) {
              const lastStageId = prevChapter.stages.length;
              const prevChapterLastStageKey = `${selectedAttribute}-${prevChapter.chapterId}-${lastStageId}`;
              isUnlocked = completedStages.has(prevChapterLastStageKey);
            }
          }

          return { ...stage, locked: !isUnlocked, completed: isCompleted };
        }),
      })),
    };
  }, [selectedAttribute, completedStages]);

  const selectedAttr = attributes.find((a) => a.id === selectedAttribute);

  // 맵 노드 생성 (ExplorationMap용)
  const mapNodes = useMemo(() => {
    const nodes: any[] = [];
    let nodeIndex = 0;

    currentMap.chapters.forEach((chapter: any) => {
      chapter.stages.forEach((stage: any, stageIdx: number) => {
        // 노드 위치 계산 (챕터별로 그룹화, 경로 형태)
        const chapterOffsetX = (chapter.chapterId - 1) * 30;
        const stageSpacing = 15;
        const x = 20 + chapterOffsetX + (stageIdx % 4) * stageSpacing;
        const y = 30 + Math.floor(stageIdx / 4) * 20 + (chapter.chapterId - 1) * 25;

        nodes.push({
          id: `${chapter.chapterId}-${stage.stageId}`,
          chapterId: chapter.chapterId,
          stageId: stage.stageId,
          x: Math.min(90, x),
          y: Math.min(85, y),
          title: stage.title,
          completed: stage.completed,
          locked: stage.locked,
          expReward: 250,
        });
        nodeIndex++;
      });
    });

    return nodes;
  }, [currentMap]);

  // 현재 위치 계산 (첫 번째 완료되지 않은 스테이지)
  const currentPosition = useMemo(() => {
    for (const chapter of currentMap.chapters) {
      for (const stage of chapter.stages) {
        if (!stage.locked && !stage.completed) {
          return { chapterId: chapter.chapterId, stageId: stage.stageId };
        }
      }
    }
    // 모두 완료했으면 마지막 스테이지
    const lastChapter = currentMap.chapters[currentMap.chapters.length - 1];
    if (lastChapter && lastChapter.stages.length > 0) {
      const lastStage = lastChapter.stages[lastChapter.stages.length - 1];
      return { chapterId: lastChapter.chapterId, stageId: lastStage.stageId };
    }
    return undefined;
  }, [currentMap]);

  const handleStageClick = (chapterId: number, stageId: number) => {
    navigate(`/map/${selectedAttribute}/${chapterId}/${stageId}`);
  };

  // 필터링된 챕터
  const filteredChapters = useMemo(() => {
    return currentMap.chapters.filter((chapter: any) => {
      if (selectedChapter !== null && chapter.chapterId !== selectedChapter) return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        chapter.title.toLowerCase().includes(query) ||
        chapter.stages.some((s: any) => s.title.toLowerCase().includes(query))
      );
    });
  }, [currentMap.chapters, searchQuery, selectedChapter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* 배경 애니메이션 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
      </div>

      {/* 콘텐츠 컨테이너 */}
      <div className="relative z-10 min-h-screen flex">

        {/* 왼쪽 사이드바 - 챕터 목록 */}
        <motion.div
          className="w-80 bg-gray-900/80 backdrop-blur-lg border-r border-purple-500/20 flex flex-col"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* 헤더 */}
          <div className="p-6 border-b border-purple-500/20">
            <motion.div
              className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2"
              animate={{ textShadow: ['0 0 20px rgba(168,85,247,0.5)', '0 0 40px rgba(168,85,247,0.8)', '0 0 20px rgba(168,85,247,0.5)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🗺️ 헬스 대륙
            </motion.div>
            <p className="text-sm text-gray-400">
              {selectedAttr?.name} 과정 탐험
            </p>
          </div>

          {/* 검색 */}
          <div className="p-4 border-b border-purple-500/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="스테이지 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* 속성 선택 (작은 버튼들) */}
          <div className="p-4 border-b border-purple-500/20">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">속성 선택</p>
            <div className="grid grid-cols-3 gap-2">
              {attributes.map((attr) => (
                <motion.button
                  key={attr.id}
                  onClick={() => setSelectedAttribute(attr.id)}
                  className={`p-2 rounded-lg border-2 transition-all text-xs ${
                    selectedAttribute === attr.id
                      ? `${attr.borderColor} ${attr.bgColor} shadow-lg`
                      : 'border-gray-700 bg-gray-800/30 hover:border-purple-500/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-xl mb-1">{attr.icon}</div>
                  <div className="text-white font-bold truncate">{attr.name}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* 챕터 목록 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredChapters.map((chapter: any) => (
              <motion.div
                key={chapter.chapterId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: chapter.chapterId * 0.1 }}
                className={`bg-gray-800/30 rounded-lg border p-3 cursor-pointer transition-all ${
                  selectedChapter === chapter.chapterId
                    ? 'border-purple-500 bg-purple-900/20 shadow-lg shadow-purple-500/20'
                    : 'border-purple-500/20 hover:border-purple-500/50'
                }`}
                onClick={() => {
                  setSelectedChapter(selectedChapter === chapter.chapterId ? null : chapter.chapterId);
                  // 해당 챕터의 첫 번째 노드로 맵 이동
                  const firstStage = chapter.stages.find((s: any) => !s.locked);
                  if (firstStage) {
                    const node = mapNodes.find((n) => n.chapterId === chapter.chapterId && n.stageId === firstStage.stageId);
                    if (node) {
                      // 맵 포커스는 ExplorationMap에서 처리
                    }
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <BookOpen size={14} />
                    {chapter.title}
                  </h3>
                  <span className="text-xs text-purple-400">Ch.{chapter.chapterId}</span>
                </div>
                {chapter.subTitle && (
                  <p className="text-xs text-cyan-400 mb-2">{chapter.subTitle}</p>
                )}
                <div className="space-y-1">
                  {chapter.stages
                    .filter((s: any) => !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((stage: any) => (
                      <motion.button
                        key={stage.stageId}
                        onClick={() => !stage.locked && handleStageClick(chapter.chapterId, stage.stageId)}
                        disabled={stage.locked}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between transition-all ${
                          stage.completed
                            ? 'bg-green-900/20 text-green-300'
                            : stage.locked
                            ? 'bg-gray-800/20 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-900/20 text-white hover:bg-purple-900/40'
                        }`}
                        whileHover={!stage.locked ? { x: 4 } : {}}
                      >
                        <span className="flex items-center gap-2">
                          {stage.completed ? (
                            <CheckCircle2 size={12} className="text-green-400" />
                          ) : stage.locked ? (
                            <Lock size={10} className="text-gray-500" />
                          ) : (
                            <MapPin size={10} className="text-yellow-400" />
                          )}
                          <span className="text-xs text-gray-400">{chapter.chapterId}-{stage.stageId}</span>
                          <span className="truncate">{stage.title}</span>
                        </span>
                        {stage.completed && <Trophy size={10} className="text-yellow-400" />}
                      </motion.button>
                    ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* 진행도 요약 */}
          <div className="p-4 border-t border-purple-500/20 bg-gray-800/30">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">전체 진행도</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-green-400">
                  {mapNodes.filter((n) => n.completed).length}
                </p>
                <p className="text-xs text-gray-400">완료</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">
                  {mapNodes.filter((n) => !n.locked && !n.completed).length}
                </p>
                <p className="text-xs text-gray-400">진행</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-500">
                  {mapNodes.filter((n) => n.locked).length}
                </p>
                <p className="text-xs text-gray-400">잠금</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 오른쪽 메인 - 탐험 맵 */}
        <div className="flex-1 flex flex-col">
          {/* 상단 헤더 */}
          <motion.div
            className="p-6 border-b border-purple-500/20 bg-gray-900/40 backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3">
                  <span className="text-4xl">{selectedAttr?.icon}</span>
                  {selectedAttr?.name} 대륙 탐험
                </h1>
                <p className="text-gray-400">{selectedAttr?.description}</p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-green-500/50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🏠 홈
                </motion.button>
                <motion.button
                  onClick={() => navigate('/workout/record')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💪 운동 기록
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* 맵 영역 */}
          <div className="flex-1 relative bg-gradient-to-br from-emerald-900/30 via-slate-900 to-purple-900/30">
            {mapNodes.length > 0 ? (
              selectedAttribute === 'neutral' ? (
                <NeutralContinentMap
                  nodes={mapNodes}
                  currentPosition={currentPosition}
                  onNodeClick={handleStageClick}
                />
              ) : (
                <IsometricGameMap
                  nodes={mapNodes}
                  currentPosition={currentPosition}
                  onNodeClick={handleStageClick}
                  attribute={selectedAttr}
                />
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔨</div>
                  <h3 className="text-2xl font-bold text-white mb-2">준비 중입니다!</h3>
                  <p className="text-gray-400">
                    {selectedAttr?.name} 대륙은 곧 오픈됩니다
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

