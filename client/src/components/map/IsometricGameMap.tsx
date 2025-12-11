import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Lock, CheckCircle2, Star, Sparkles, X } from 'lucide-react';

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

interface IsometricGameMapProps {
  nodes: MapNode[];
  currentPosition?: { chapterId: number; stageId: number };
  onNodeClick: (chapterId: number, stageId: number) => void;
  attribute?: {
    name: string;
    color: string;
    icon: string;
  };
}

export default function IsometricGameMap({
  nodes,
  currentPosition,
  onNodeClick,
  attribute,
}: IsometricGameMapProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [mapScale, setMapScale] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // 노드를 챕터별로 그룹화
  const nodesByChapter = useMemo(() => {
    return nodes.reduce((acc, node) => {
      if (!acc[node.chapterId]) {
        acc[node.chapterId] = [];
      }
      acc[node.chapterId].push(node);
      return acc;
    }, {} as Record<number, MapNode[]>);
  }, [nodes]);

  // 아이소메트릭 변환 함수 (SVG 좌표계용)
  const isoTransform = (x: number, y: number, viewBoxWidth = 1000, viewBoxHeight = 1000) => {
    // x, y는 0-100 퍼센트
    const px = (x / 100) * viewBoxWidth;
    const py = (y / 100) * viewBoxHeight;
    
    // 아이소메트릭 변환
    const isoX = (px - py) * 0.866; // cos(30°) ≈ 0.866
    const isoY = (px + py) * 0.5; // sin(30°) = 0.5
    
    // 다시 퍼센트로 변환
    return { 
      x: (isoX / viewBoxWidth) * 100 + 50, // 중앙 기준
      y: (isoY / viewBoxHeight) * 100 + 20 // 상단 여백
    };
  };

  // 경로 그리기 (연속된 노드들)
  const renderPaths = () => {
    const paths: JSX.Element[] = [];
    
    Object.values(nodesByChapter).forEach((chapterNodes) => {
      const sortedNodes = [...chapterNodes].sort((a, b) => {
        if (a.stageId !== b.stageId) return a.stageId - b.stageId;
        return 0;
      });

      for (let i = 0; i < sortedNodes.length - 1; i++) {
        const startNode = sortedNodes[i];
        const endNode = sortedNodes[i + 1];

        const isPathCompleted = startNode.completed && endNode.completed;
        const isPathAvailable = !startNode.locked && !endNode.locked;
        const isPathCurrent =
          currentPosition &&
          currentPosition.chapterId === startNode.chapterId &&
          currentPosition.stageId === startNode.stageId;

        const startIso = isoTransform(startNode.x, startNode.y, 1000, 1000);
        const endIso = isoTransform(endNode.x, endNode.y, 1000, 1000);
        const startX = (startIso.x / 100) * 1000;
        const startY = (startIso.y / 100) * 1000;
        const endX = (endIso.x / 100) * 1000;
        const endY = (endIso.y / 100) * 1000;

        paths.push(
          <motion.path
            key={`path-${startNode.id}-${endNode.id}`}
            d={`M ${startX} ${startY} L ${endX} ${endY}`}
            stroke={isPathCompleted ? '#10b981' : isPathCurrent ? '#fbbf24' : isPathAvailable ? '#8b5cf6' : '#4b5563'}
            strokeWidth={isPathCompleted ? 6 : isPathAvailable ? 4 : 3}
            strokeDasharray={!isPathAvailable ? '8,8' : '0'}
            fill="none"
            opacity={isPathCompleted ? 1 : isPathAvailable ? 0.8 : 0.4}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
          />
        );
      }
    });

    return paths;
  };

  // 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMapPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 휠 줌 핸들러
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setMapScale(Math.max(0.5, Math.min(2, mapScale + delta)));
  };

  // 현재 위치 노드 찾기
  const currentPosNode = useMemo(() => {
    if (!currentPosition) return null;
    return nodes.find(
      (node) =>
        node.chapterId === currentPosition.chapterId && node.stageId === currentPosition.stageId
    );
  }, [nodes, currentPosition]);

  return (
    <div
      ref={mapRef}
      className="relative w-full h-full overflow-hidden"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* 배경 - 아이소메트릭 지형 */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet" style={{ zIndex: 1 }}>
        <defs>
          {/* 그라데이션 */}
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#15803d" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* 하늘 배경 */}
        <rect width="1000" height="1000" fill="url(#skyGradient)" />

        {/* 아이소메트릭 타일 배경 (육지) */}
        {[...Array(12)].map((_, i) => {
          const x = (i % 4) * 250;
          const y = Math.floor(i / 4) * 300;
          const iso = isoTransform((x / 1000) * 100, (y / 1000) * 100, 1000, 1000);
          const px = (iso.x / 100) * 1000;
          const py = (iso.y / 100) * 1000;
          return (
            <g key={`tile-${i}`} transform={`translate(${px}, ${py})`}>
              <polygon
                points="0,0 100,0 100,50 0,50"
                fill="url(#grassGradient)"
                stroke="#22c55e"
                strokeWidth="2"
                strokeOpacity="0.3"
              />
            </g>
          );
        })}

        {/* 산들 (아이소메트릭) */}
        {[
          { x: 20, y: 30, size: 80 },
          { x: 60, y: 20, size: 100 },
          { x: 80, y: 50, size: 60 },
        ].map((mountain, i) => {
          const iso = isoTransform(mountain.x, mountain.y, 1000, 1000);
          const px = (iso.x / 100) * 1000;
          const py = (iso.y / 100) * 1000;
          return (
            <g key={`mountain-${i}`} transform={`translate(${px}, ${py})`}>
              <polygon
                points={`0,${mountain.size} ${mountain.size * 0.866},0 ${mountain.size * 1.732},${mountain.size}`}
                fill="url(#mountainGradient)"
                stroke="#64748b"
                strokeWidth="2"
                opacity="0.7"
              />
            </g>
          );
        })}

        {/* 강/호수 (아이소메트릭) */}
        {[
          { x: 40, y: 60, width: 150, height: 100 },
          { x: 70, y: 70, width: 120, height: 80 },
        ].map((water, i) => {
          const iso = isoTransform(water.x, water.y, 1000, 1000);
          const px = (iso.x / 100) * 1000;
          const py = (iso.y / 100) * 1000;
          return (
            <g key={`water-${i}`} transform={`translate(${px}, ${py})`}>
              <ellipse
                cx={water.width / 2}
                cy={water.height / 2}
                rx={water.width / 2}
                ry={water.height / 2}
                fill="url(#waterGradient)"
                stroke="#2563eb"
                strokeWidth="2"
                opacity="0.6"
              />
            </g>
          );
        })}

        {/* 숲 (나무들) */}
        {[
          { x: 15, y: 40 },
          { x: 25, y: 45 },
          { x: 35, y: 50 },
          { x: 55, y: 35 },
          { x: 65, y: 40 },
          { x: 75, y: 45 },
          { x: 85, y: 55 },
        ].map((tree, i) => {
          const iso = isoTransform(tree.x, tree.y, 1000, 1000);
          const px = (iso.x / 100) * 1000;
          const py = (iso.y / 100) * 1000;
          return (
            <g key={`tree-${i}`} transform={`translate(${px}, ${py})`}>
              {/* 나무 줄기 */}
              <rect x="-5" y="0" width="10" height="20" fill="#8b4513" opacity="0.6" />
              {/* 나무 잎 */}
              <circle cx="0" cy="0" r="15" fill="#16a34a" opacity="0.5" />
            </g>
          );
        })}

        {/* 집/건물들 */}
        {[
          { x: 30, y: 25, type: 'house' },
          { x: 50, y: 30, type: 'castle' },
        ].map((building, i) => {
          const iso = isoTransform(building.x, building.y, 1000, 1000);
          const px = (iso.x / 100) * 1000;
          const py = (iso.y / 100) * 1000;
          return (
            <g key={`building-${i}`} transform={`translate(${px}, ${py})`}>
              {building.type === 'house' ? (
                <>
                  {/* 집 벽 */}
                  <polygon points="0,25 25,12.5 50,25 50,40 0,40" fill="#c2410c" opacity="0.6" />
                  {/* 집 지붕 */}
                  <polygon points="0,25 25,12.5 50,25" fill="#dc2626" opacity="0.7" />
                </>
              ) : (
                <>
                  {/* 성 벽 */}
                  <rect x="0" y="10" width="40" height="30" fill="#64748b" opacity="0.7" />
                  {/* 성 탑 */}
                  <rect x="10" y="0" width="10" height="10" fill="#475569" opacity="0.8" />
                  <rect x="30" y="0" width="10" height="10" fill="#475569" opacity="0.8" />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* 맵 컨테이너 */}
      <motion.div
        className="absolute inset-0"
        style={{
          transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${mapScale})`,
          transformOrigin: 'center center',
          zIndex: 2,
        }}
      >
        {/* SVG 맵 */}
        <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
          {/* 경로들 */}
          {renderPaths()}

          {/* 노드들 */}
          {nodes.map((node) => {
            const isCurrent =
              currentPosition &&
              node.chapterId === currentPosition.chapterId &&
              node.stageId === currentPosition.stageId;
            const isHovered = hoveredNode === node.id;
            const iso = isoTransform(node.x, node.y, 1000, 1000);
            const px = (iso.x / 100) * 1000;
            const py = (iso.y / 100) * 1000;

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!node.locked) {
                    // 바로 이동
                    onNodeClick(node.chapterId, node.stageId);
                  } else {
                    // 잠금된 노드는 팝업만 표시
                    setSelectedNode(node);
                  }
                }}
                transform={`translate(${px}, ${py})`}
              >
                {/* 노드 배경 글로우 */}
                {!node.locked && (
                  <motion.circle
                    cx="0"
                    cy="0"
                    r={isCurrent ? 35 : isHovered ? 30 : 25}
                    fill={node.completed ? '#10b981' : '#fbbf24'}
                    fillOpacity={isHovered ? 0.4 : isCurrent ? 0.3 : 0.2}
                    animate={{
                      r: isHovered ? 35 : isCurrent ? 30 : 25,
                      opacity: isHovered ? 0.5 : isCurrent ? 0.4 : 0.2,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* 노드 원 (아이소메트릭 스타일) */}
                <motion.circle
                  cx="0"
                  cy="0"
                  r={isCurrent ? 25 : isHovered && !node.locked ? 22 : 18}
                  fill={node.completed ? '#10b981' : node.locked ? '#4b5563' : '#fbbf24'}
                  stroke={isCurrent ? '#ffffff' : node.completed ? '#34d399' : node.locked ? '#6b7280' : '#fcd34d'}
                  strokeWidth={isCurrent ? 4 : 3}
                  animate={{
                    scale: isHovered && !node.locked ? 1.2 : isCurrent ? 1.15 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                />

                {/* 노드 번호 */}
                <text
                  x="0"
                  y="6"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="white"
                  pointerEvents="none"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                >
                  {node.chapterId}-{node.stageId}
                </text>

                {/* 완료 체크 */}
                {node.completed && (
                  <foreignObject x="-10" y="-10" width="20" height="20">
                    <CheckCircle2 size={20} className="text-green-300" />
                  </foreignObject>
                )}

                {/* 잠금 아이콘 */}
                {node.locked && (
                  <foreignObject x="-8" y="-8" width="16" height="16">
                    <Lock size={16} className="text-gray-400" />
                  </foreignObject>
                )}

                {/* 현재 위치 캐릭터 */}
                {isCurrent && (
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <foreignObject x="-20" y="-35" width="40" height="40">
                      <motion.div
                        className="relative"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg border-2 border-white">
                          {attribute?.icon || '🦸'}
                        </div>
                        <motion.div
                          className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Sparkles size={16} className="text-yellow-400" />
                        </motion.div>
                      </motion.div>
                    </foreignObject>
                  </motion.g>
                )}
              </g>
            );
          })}
        </svg>
      </motion.div>

      {/* 노드 정보 팝업 */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-900/95 backdrop-blur-lg rounded-xl border-2 border-purple-500/50 shadow-2xl p-6 max-w-md"
            style={{ zIndex: 100 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedNode.title}</h3>
                <p className="text-sm text-gray-400">
                  Chapter {selectedNode.chapterId} - Stage {selectedNode.stageId}
                </p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {selectedNode.expReward && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star size={16} />
                  <span className="font-bold">+{selectedNode.expReward} EXP 보상</span>
                </div>
              )}

              <div className="flex gap-2">
                <motion.button
                  onClick={() => {
                    onNodeClick(selectedNode.chapterId, selectedNode.stageId);
                    setSelectedNode(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {selectedNode.completed ? '다시 보기' : '시작하기'}
                </motion.button>
                <motion.button
                  onClick={() => setSelectedNode(null)}
                  className="px-4 py-2 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  닫기
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 줌 컨트롤 */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <motion.button
          onClick={() => setMapScale(Math.min(2, mapScale + 0.1))}
          className="w-10 h-10 bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          +
        </motion.button>
        <motion.button
          onClick={() => setMapScale(Math.max(0.5, mapScale - 0.1))}
          className="w-10 h-10 bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          −
        </motion.button>
        <motion.button
          onClick={() => {
            setMapScale(1);
            setMapPosition({ x: 0, y: 0 });
          }}
          className="w-10 h-10 bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MapPin size={16} />
        </motion.button>
      </div>

      {/* 범례 */}
      <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 z-10 border border-purple-500/30 shadow-lg">
        <div className="text-xs text-white space-y-2">
          <div className="flex items-center gap-2">
            <Star size={14} className="text-yellow-400" />
            <span>진행 가능</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-400" />
            <span>완료</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-gray-400" />
            <span>잠금</span>
          </div>
        </div>
      </div>
    </div>
  );
}

