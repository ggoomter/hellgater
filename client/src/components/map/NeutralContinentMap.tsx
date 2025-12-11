import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, Star, Sparkles, Zap } from 'lucide-react';

interface MapNode {
  id: string;
  chapterId: number;
  stageId: number;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  title: string;
  completed: boolean;
  locked: boolean;
  expReward?: number;
}

interface NeutralContinentMapProps {
  nodes: MapNode[];
  currentPosition?: { chapterId: number; stageId: number };
  onNodeClick: (chapterId: number, stageId: number) => void;
}

// 구름 데이터
const CLOUDS = [
  { x: 10, y: 5, size: 120, speed: 20 },
  { x: 40, y: 12, size: 80, speed: 35 },
  { x: 70, y: 8, size: 100, speed: 25 },
  { x: 20, y: 25, size: 90, speed: 30 },
  { x: 85, y: 18, size: 70, speed: 40 },
  { x: 55, y: 35, size: 110, speed: 22 },
];

// 나무 데이터
const TREES = [
  { x: 5, y: 40, scale: 1.2 },
  { x: 15, y: 52, scale: 0.9 },
  { x: 25, y: 45, scale: 1.1 },
  { x: 85, y: 48, scale: 1.0 },
  { x: 92, y: 60, scale: 1.3 },
  { x: 10, y: 68, scale: 0.8 },
  { x: 88, y: 72, scale: 1.1 },
  { x: 7, y: 85, scale: 1.2 },
  { x: 90, y: 88, scale: 0.9 },
];

// 파티클 애니메이션
const Particle = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="absolute w-1 h-1 bg-emerald-400 rounded-full"
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
      y: [-10, -30],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

export default function NeutralContinentMap({
  nodes,
  currentPosition,
  onNodeClick,
}: NeutralContinentMapProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 챕터별 노드 그룹화 및 정렬
  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
  }, [nodes]);

  // 경로 생성 (챕터별 연속)
  const paths = useMemo(() => {
    const pathSegments: { start: MapNode; end: MapNode; status: 'completed' | 'active' | 'locked' }[] = [];

    const byChapter = sortedNodes.reduce((acc, node) => {
      if (!acc[node.chapterId]) acc[node.chapterId] = [];
      acc[node.chapterId].push(node);
      return acc;
    }, {} as Record<number, MapNode[]>);

    Object.values(byChapter).forEach((chapterNodes) => {
      const sorted = [...chapterNodes].sort((a, b) => a.stageId - b.stageId);
      for (let i = 0; i < sorted.length - 1; i++) {
        const start = sorted[i];
        const end = sorted[i + 1];
        const status = start.completed && end.completed ? 'completed'
                     : !start.locked && !end.locked ? 'active'
                     : 'locked';
        pathSegments.push({ start, end, status });
      }
    });

    return pathSegments;
  }, [sortedNodes]);

  // 현재 위치 노드
  const currentNode = useMemo(() => {
    if (!currentPosition) return null;
    return nodes.find(n => n.chapterId === currentPosition.chapterId && n.stageId === currentPosition.stageId);
  }, [nodes, currentPosition]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gradient-to-b from-sky-300 via-emerald-200 to-emerald-400"
    >
      {/* 하늘과 구름 레이어 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 구름들 */}
        {CLOUDS.map((cloud, idx) => (
          <motion.div
            key={`cloud-${idx}`}
            className="absolute"
            style={{
              left: `${cloud.x}%`,
              top: `${cloud.y}%`,
            }}
            animate={{
              x: [-50, 50, -50],
            }}
            transition={{
              duration: cloud.speed,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <svg width={cloud.size} height={cloud.size * 0.6} viewBox="0 0 200 120">
              <ellipse cx="60" cy="80" rx="50" ry="40" fill="white" opacity="0.9" />
              <ellipse cx="100" cy="70" rx="60" ry="45" fill="white" opacity="0.9" />
              <ellipse cx="140" cy="80" rx="50" ry="40" fill="white" opacity="0.9" />
              <ellipse cx="100" cy="50" rx="40" ry="35" fill="white" opacity="0.95" />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* 산맥 실루엣 */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: '40%' }}>
        <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {/* 먼 산맥 */}
          <polygon
            points="0,250 150,180 300,220 450,150 600,200 750,160 900,210 1000,190 1000,400 0,400"
            fill="url(#mountainGrad)"
            opacity="0.5"
          />
          {/* 가까운 산맥 */}
          <polygon
            points="0,300 100,240 250,280 400,220 550,260 700,230 850,270 1000,250 1000,400 0,400"
            fill="url(#mountainGrad)"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* 메인 맵 컨테이너 */}
      <div className="relative h-full w-full px-8 py-8 flex items-center justify-center" style={{ zIndex: 10 }}>

        {/* 장식 나무들 */}
        {TREES.map((tree, idx) => (
          <motion.div
            key={`tree-${idx}`}
            className="absolute pointer-events-none"
            style={{
              left: `${tree.x}%`,
              top: `${tree.y}%`,
              transform: `scale(${tree.scale})`,
            }}
            animate={{
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: 3 + idx * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* 나무 몸통 */}
            <div className="relative">
              <div className="w-4 h-16 bg-gradient-to-b from-amber-800 to-amber-900 rounded-b-lg mx-auto" />
              {/* 나무 잎 */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full" />
                  <div className="absolute top-2 left-2 w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full opacity-80" />
                  <div className="absolute top-4 left-4 w-8 h-8 bg-emerald-300 rounded-full opacity-60" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* 맵 콘텐츠 래퍼 */}
        <div className="relative w-full h-full max-w-6xl mx-auto">

        {/* SVG 경로 및 노드들 */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* 경로 그라데이션 */}
            <linearGradient id="pathCompleted" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="pathActive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78E6C8" />
              <stop offset="50%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#78E6C8" />
            </linearGradient>
            {/* 빛나는 필터 */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* 경로 그리기 */}
          {paths.map(({ start, end, status }, idx) => {
            // 곡선 경로 (Bezier) - viewBox 좌표계 사용
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            const offsetX = (end.x - start.x) * 0.2;

            const pathD = `M ${start.x} ${start.y} Q ${midX + offsetX} ${midY - 5} ${end.x} ${end.y}`;

            return (
              <motion.g key={`path-${idx}`}>
                {/* 경로 배경 (그림자) */}
                <motion.path
                  d={pathD}
                  stroke="#00000033"
                  strokeWidth="0.8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                />
                {/* 경로 메인 */}
                <motion.path
                  d={pathD}
                  stroke={status === 'completed' ? 'url(#pathCompleted)' : status === 'active' ? 'url(#pathActive)' : '#6b7280'}
                  strokeWidth="0.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={status === 'locked' ? '1,1' : '0'}
                  opacity={status === 'locked' ? 0.4 : 1}
                  filter={status !== 'locked' ? 'url(#glow)' : undefined}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                />
                {/* 파티클 효과 (완료된 경로) */}
                {status === 'completed' && (
                  <motion.circle
                    r="0.3"
                    fill="#34d399"
                    filter="url(#glow)"
                  >
                    <animateMotion
                      dur="3s"
                      repeatCount="indefinite"
                      path={pathD}
                    />
                  </motion.circle>
                )}
              </motion.g>
            );
          })}
        </svg>

        {/* 노드들 */}
        {sortedNodes.map((node, idx) => {
          const isCurrent = currentNode?.id === node.id;
          const isHovered = hoveredNode === node.id;

          return (
            <motion.div
              key={node.id}
              className="absolute pointer-events-auto"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isCurrent ? 100 : isHovered ? 50 : 20,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: idx * 0.05,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >
              {/* 노드 글로우 */}
              {!node.locked && (
                <motion.div
                  className="absolute inset-0"
                  style={{
                    width: 120,
                    height: 120,
                    marginLeft: -40,
                    marginTop: -40,
                  }}
                  animate={{
                    scale: isHovered ? 1.3 : isCurrent ? 1.2 : 1,
                    opacity: isHovered ? 0.6 : isCurrent ? 0.5 : 0.3,
                  }}
                >
                  <div className={`w-full h-full rounded-full blur-xl ${
                    node.completed ? 'bg-emerald-400' : 'bg-cyan-400'
                  }`} />
                </motion.div>
              )}

              {/* 노드 메인 (육각형 플랫폼) */}
              <motion.button
                className="relative group"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  if (!node.locked) {
                    onNodeClick(node.chapterId, node.stageId);
                  } else {
                    setSelectedNode(node);
                  }
                }}
                disabled={node.locked}
                whileHover={!node.locked ? { scale: 1.1 } : {}}
                whileTap={!node.locked ? { scale: 0.95 } : {}}
                animate={isCurrent ? {
                  y: [0, -8, 0],
                } : {}}
                transition={isCurrent ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                } : {}}
              >
                {/* 육각형 플랫폼 */}
                <div className="relative w-20 h-20">
                  {/* 그림자 */}
                  <div className="absolute inset-0 translate-y-2">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <polygon
                        points="50,5 90,27 90,73 50,95 10,73 10,27"
                        fill="#00000033"
                        filter="blur(4px)"
                      />
                    </svg>
                  </div>

                  {/* 메인 육각형 */}
                  <svg viewBox="0 0 100 100" className="w-full h-full relative">
                    <defs>
                      <linearGradient id={`hexGrad-${node.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={
                          node.completed ? '#10b981' : node.locked ? '#4b5563' : '#78E6C8'
                        } />
                        <stop offset="100%" stopColor={
                          node.completed ? '#059669' : node.locked ? '#374151' : '#34d399'
                        } />
                      </linearGradient>
                    </defs>

                    {/* 육각형 배경 */}
                    <polygon
                      points="50,5 90,27 90,73 50,95 10,73 10,27"
                      fill={`url(#hexGrad-${node.id})`}
                      stroke={isCurrent ? '#ffffff' : node.completed ? '#34d399' : node.locked ? '#6b7280' : '#a7f3d0'}
                      strokeWidth={isCurrent ? 4 : 3}
                    />

                    {/* 하이라이트 */}
                    <polygon
                      points="50,15 80,32 80,50 50,65 20,50 20,32"
                      fill="white"
                      opacity={node.locked ? 0.05 : 0.15}
                    />
                  </svg>

                  {/* 노드 아이콘 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {node.completed ? (
                      <CheckCircle2 size={28} className="text-white drop-shadow-lg" />
                    ) : node.locked ? (
                      <Lock size={24} className="text-gray-400" />
                    ) : (
                      <Star size={26} className="text-white drop-shadow-lg" />
                    )}
                  </div>

                  {/* 노드 번호 */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="px-3 py-1 bg-gray-900/90 backdrop-blur-sm rounded-full border-2 border-emerald-400">
                      <span className="text-xs font-black text-white tracking-wider">
                        {node.chapterId}-{node.stageId}
                      </span>
                    </div>
                  </div>

                  {/* 현재 위치 캐릭터 */}
                  {isCurrent && (
                    <motion.div
                      className="absolute -top-16 left-1/2 transform -translate-x-1/2"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{
                        scale: 1,
                        rotate: 0,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 10,
                      }}
                    >
                      <motion.div
                        className="relative"
                        animate={{
                          y: [0, -10, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-full flex items-center justify-center text-2xl shadow-2xl border-4 border-white">
                          😈
                        </div>
                        {/* 스파크 효과 */}
                        <motion.div
                          className="absolute -top-2 -right-2"
                          animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, 180, 360],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        >
                          <Sparkles size={20} className="text-yellow-400 drop-shadow-lg" />
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* 파티클 효과 (진행 가능한 노드) */}
                  {!node.locked && !node.completed && (
                    <>
                      {[0, 0.5, 1, 1.5].map((delay) => (
                        <div
                          key={delay}
                          className="absolute left-1/2 bottom-full transform -translate-x-1/2"
                        >
                          <Particle delay={delay} />
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* 호버 툴팁 */}
                {isHovered && (
                  <motion.div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-8 pointer-events-none"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  >
                    <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl px-6 py-4 shadow-2xl border-2 border-emerald-400/50 min-w-[200px]">
                      <h3 className="text-white font-black text-base mb-2 text-center">
                        {node.title}
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
                        <Zap size={14} />
                        <span className="font-bold">+{node.expReward || 250} EXP</span>
                      </div>
                      {node.locked && (
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          이전 스테이지를 완료하세요
                        </p>
                      )}
                    </div>
                    {/* 툴팁 화살표 */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1">
                      <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-emerald-400/50" />
                    </div>
                  </motion.div>
                )}
              </motion.button>
            </motion.div>
          );
        })}

        {/* 챕터 타이틀 표시 */}
        {[1, 2].map((chapterId) => {
          const chapterNodes = sortedNodes.filter(n => n.chapterId === chapterId);
          if (chapterNodes.length === 0) return null;

          const firstNode = chapterNodes[0];
          const chapterTitles: Record<number, string> = {
            1: '🌱 Chapter 1: 기초지식',
            2: '🍎 Chapter 2: 영양 지식',
          };

          return (
            <motion.div
              key={`chapter-${chapterId}`}
              className="absolute"
              style={{
                left: '50%',
                top: `${firstNode.y - 8}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5 + chapterId * 0.2 }}
            >
              <div className="relative">
                {/* 타이틀 배너 */}
                <div className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-emerald-600 rounded-2xl px-8 py-4 shadow-2xl border-4 border-white">
                  <h2 className="text-2xl font-black text-white text-center tracking-wider drop-shadow-lg">
                    {chapterTitles[chapterId]}
                  </h2>
                </div>
                {/* 장식 요소 */}
                <motion.div
                  className="absolute -top-4 -left-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Star size={24} className="text-yellow-400 drop-shadow-lg" fill="currentColor" />
                </motion.div>
                <motion.div
                  className="absolute -top-4 -right-4"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Star size={24} className="text-yellow-400 drop-shadow-lg" fill="currentColor" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}

        </div>
        {/* 맵 콘텐츠 래퍼 끝 */}

      </div>

      {/* 잠긴 노드 팝업 */}
      <AnimatePresence>
        {selectedNode && selectedNode.locked && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-gray-700"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Lock size={40} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">
                  {selectedNode.title}
                </h3>
                <p className="text-gray-400 mb-6">
                  이 스테이지는 아직 잠겨있습니다.
                  <br />
                  이전 스테이지를 먼저 완료하세요!
                </p>
                <motion.button
                  onClick={() => setSelectedNode(null)}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  확인
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 그라데이션 오버레이 */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-600/30 to-transparent pointer-events-none" />
    </div>
  );
}
