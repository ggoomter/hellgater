import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Lock, CheckCircle2, Star, Sparkles } from 'lucide-react';

interface MapNode {
  id: string;
  chapterId: number;
  lessonId: number;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  title: string;
  completed: boolean;
  locked: boolean;
  isTest?: boolean;
}

interface GameMapProps {
  nodes: MapNode[];
  currentPosition?: { chapterId: number; lessonId: number };
  onNodeClick: (node: MapNode) => void;
}

export default function GameMap({
  nodes,
  currentPosition,
  onNodeClick,
}: GameMapProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [mapScale, setMapScale] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 노드를 챕터별로 그룹화
  const nodesByChapter = nodes.reduce((acc, node) => {
    if (!acc[node.chapterId]) {
      acc[node.chapterId] = [];
    }
    acc[node.chapterId].push(node);
    return acc;
  }, {} as Record<number, MapNode[]>);

  // 경로 그리기 (연속된 노드들)
  const renderPaths = () => {
    const paths: JSX.Element[] = [];
    Object.values(nodesByChapter).forEach((chapterNodes) => {
      // 노드를 lessonId로 정렬
      const sortedNodes = [...chapterNodes].sort((a, b) => a.lessonId - b.lessonId);
      
      for (let i = 0; i < sortedNodes.length - 1; i++) {
        const startNode = sortedNodes[i];
        const endNode = sortedNodes[i + 1];

        const isPathCompleted = startNode.completed && !endNode.locked;
        const isPathCurrent =
          currentPosition &&
          currentPosition.chapterId === startNode.chapterId &&
          currentPosition.lessonId === startNode.lessonId &&
          !endNode.locked;

        paths.push(
          <motion.line
            key={`path-${startNode.id}-${endNode.id}`}
            x1={`${startNode.x}%`}
            y1={`${startNode.y}%`}
            x2={`${endNode.x}%`}
            y2={`${endNode.y}%`}
            stroke={isPathCompleted ? '#10B981' : isPathCurrent ? '#FFD700' : '#6B7280'}
            strokeWidth="3"
            strokeDasharray={endNode.locked ? '5 5' : '0'}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        );
      }
    });
    return paths;
  };

  // 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMapPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 휠 줌 핸들러
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAmount = 0.1;
    const newScale = e.deltaY < 0 ? mapScale * (1 + scaleAmount) : mapScale / (1 + scaleAmount);
    setMapScale(Math.max(0.5, Math.min(2, newScale))); // 0.5배 ~ 2배 제한
  };

  // 현재 위치 노드 찾기
  const currentPosNode = useMemo(() => {
    if (!currentPosition) return null;
    return nodes.find(
      (node) =>
        node.chapterId === currentPosition.chapterId && node.lessonId === currentPosition.lessonId
    );
  }, [nodes, currentPosition]);

  return (
    <div
      ref={mapRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing bg-gradient-to-br from-purple-50 to-pink-50"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <motion.svg
        className="absolute inset-0 w-full h-full"
        style={{
          transformOrigin: '0 0',
          scale: mapScale,
          x: mapPosition.x,
          y: mapPosition.y,
        }}
      >
        {/* 배경 그리드 */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="1" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* 경로 렌더링 */}
        {renderPaths()}

        {/* 노드 렌더링 */}
        {nodes.map((node) => {
          const isCurrent =
            currentPosition &&
            node.chapterId === currentPosition.chapterId &&
            node.lessonId === currentPosition.lessonId;
          const isHovered = hoveredNode === node.id;

          return (
            <motion.g
              key={node.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => !node.locked && onNodeClick(node)}
              style={{
                x: `${node.x}%`,
                y: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + (node.chapterId + node.lessonId) * 0.05 }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* 노드 원 */}
              <motion.circle
                r={isCurrent ? 18 : 14}
                fill={node.completed ? '#10B981' : node.locked ? '#9CA3AF' : '#8B5CF6'}
                stroke={isCurrent ? '#FFD700' : node.completed ? '#059669' : node.locked ? '#6B7280' : '#A78BFA'}
                strokeWidth={isCurrent ? 4 : 2}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              />

              {/* 완료 아이콘 */}
              {node.completed && (
                <CheckCircle2
                  size={20}
                  className="text-white"
                  style={{ x: -10, y: -10 }}
                  strokeWidth={2.5}
                />
              )}

              {/* 잠금 아이콘 */}
              {node.locked && (
                <Lock
                  size={16}
                  className="text-gray-600"
                  style={{ x: -8, y: -8 }}
                  strokeWidth={2}
                />
              )}

              {/* 테스트 노드 표시 */}
              {node.isTest && (
                <Star
                  size={18}
                  className="text-yellow-400"
                  style={{ x: -9, y: -9 }}
                  fill="currentColor"
                />
              )}

              {/* 현재 위치 하이라이트 */}
              {isCurrent && (
                <motion.circle
                  r={22}
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="3"
                  strokeDasharray="5 5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* 호버 툴팁 */}
              <AnimatePresence>
                {isHovered && !node.locked && (
                  <motion.g
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{ x: 25, y: -15 }}
                  >
                    <rect
                      x="-5"
                      y="-15"
                      width="120"
                      height="30"
                      rx="4"
                      fill="rgba(0, 0, 0, 0.8)"
                      className="pointer-events-none"
                    />
                    <text
                      x="55"
                      y="0"
                      textAnchor="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {node.title}
                    </text>
                  </motion.g>
                )}
              </AnimatePresence>
            </motion.g>
          );
        })}

        {/* 현재 위치 캐릭터 */}
        {currentPosNode && (
          <motion.g
            style={{
              x: `${currentPosNode.x}%`,
              y: `${currentPosNode.y}%`,
              transform: 'translate(-50%, -100%)',
            }}
            animate={{ y: [`${currentPosNode.y}%`, `${currentPosNode.y - 3}%`, `${currentPosNode.y}%`] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <text fontSize="32" x="0" y="0" textAnchor="middle" dominantBaseline="central">
              🚶
            </text>
          </motion.g>
        )}
      </motion.svg>

      {/* 맵 컨트롤 */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <motion.button
          onClick={() => setMapScale((prev) => Math.min(2, prev * 1.2))}
          className="p-2 bg-purple-600/80 rounded-full text-white hover:bg-purple-700/90 transition-colors shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          +
        </motion.button>
        <motion.button
          onClick={() => setMapScale((prev) => Math.max(0.5, prev / 1.2))}
          className="p-2 bg-purple-600/80 rounded-full text-white hover:bg-purple-700/90 transition-colors shadow-lg"
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
          className="p-2 bg-purple-600/80 rounded-full text-white hover:bg-purple-700/90 transition-colors shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="리셋"
        >
          <MapPin size={16} />
        </motion.button>
      </div>

      {/* 범례 */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
        <div className="text-xs font-semibold text-gray-700 mb-2">범례</div>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>진행 가능</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>완료</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>잠금</span>
          </div>
        </div>
      </div>
    </div>
  );
}

