import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Lock, CheckCircle2, Star, Sparkles } from 'lucide-react';

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

interface ExplorationMapProps {
  nodes: MapNode[];
  currentPosition?: { chapterId: number; stageId: number };
  onNodeClick: (chapterId: number, stageId: number) => void;
  attribute?: {
    name: string;
    color: string;
    icon: string;
  };
}

export default function ExplorationMap({
  nodes,
  currentPosition,
  onNodeClick,
  attribute,
}: ExplorationMapProps) {
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
  const drawPath = (chapterNodes: MapNode[]) => {
    if (chapterNodes.length < 2) return null;

    const sortedNodes = [...chapterNodes].sort((a, b) => {
      if (a.stageId !== b.stageId) return a.stageId - b.stageId;
      return 0;
    });

    return sortedNodes.map((node, index) => {
      if (index === sortedNodes.length - 1) return null;
      const nextNode = sortedNodes[index + 1];
      
      const isCompleted = node.completed && nextNode.completed;
      const isAvailable = !node.locked && !nextNode.locked;

      return (
        <motion.line
          key={`path-${node.id}-${nextNode.id}`}
          x1={`${node.x}%`}
          y1={`${node.y}%`}
          x2={`${nextNode.x}%`}
          y2={`${nextNode.y}%`}
          stroke={isCompleted ? '#10b981' : isAvailable ? '#fbbf24' : '#4b5563'}
          strokeWidth={isCompleted ? 4 : isAvailable ? 3 : 2}
          strokeDasharray={isCompleted ? '0' : '5,5'}
          opacity={isCompleted ? 1 : isAvailable ? 0.7 : 0.3}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        />
      );
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
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

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setMapScale(Math.max(0.5, Math.min(2, mapScale + delta)));
  };

  return (
    <div
      ref={mapRef}
      className="relative w-full h-full overflow-hidden bg-gradient-to-br from-emerald-900/20 via-slate-900 to-purple-900/20"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* 배경 지형 요소들 */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        {/* 산 배경 */}
        <defs>
          <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#374151" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1f2937" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        {/* 산들 */}
        <polygon
          points="0,60 15,40 30,50 45,35 60,45 75,30 90,40 100,50 100,100 0,100"
          fill="url(#mountainGradient)"
        />
        
        {/* 강/호수 */}
        <ellipse cx="70" cy="80" rx="25" ry="15" fill="#1e40af" fillOpacity="0.3" />
        
        {/* 숲 영역 */}
        {[...Array(20)].map((_, i) => (
          <circle
            key={`tree-${i}`}
            cx={`${10 + (i % 5) * 20}%`}
            cy={`${20 + Math.floor(i / 5) * 15}%`}
            r="2"
            fill="#166534"
            fillOpacity="0.4"
          />
        ))}
      </svg>

      {/* 맵 컨테이너 */}
      <motion.div
        className="absolute inset-0"
        style={{
          transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${mapScale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* SVG 맵 */}
        <svg className="w-full h-full" style={{ zIndex: 2 }}>
          {/* 경로 그리기 */}
          {Object.values(nodesByChapter).map((chapterNodes) => drawPath(chapterNodes))}

          {/* 노드들 */}
          {nodes.map((node) => {
            const isCurrent = currentPosition?.chapterId === node.chapterId && 
                            currentPosition?.stageId === node.stageId;
            const isHovered = hoveredNode === node.id;

            return (
              <g key={node.id}>
                {/* 노드 배경 글로우 */}
                {!node.locked && (
                  <motion.circle
                    cx={`${node.x}%`}
                    cy={`${node.y}%`}
                    r="20"
                    fill={node.completed ? '#10b981' : '#fbbf24'}
                    fillOpacity={isHovered ? 0.3 : 0.1}
                    animate={{
                      r: isHovered ? 25 : 20,
                      opacity: isHovered ? 0.4 : 0.1,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* 노드 원 */}
                <motion.circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r="16"
                  fill={node.completed ? '#10b981' : node.locked ? '#4b5563' : '#fbbf24'}
                  stroke={isCurrent ? '#ffffff' : node.completed ? '#34d399' : node.locked ? '#6b7280' : '#fcd34d'}
                  strokeWidth={isCurrent ? 3 : 2}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => !node.locked && onNodeClick(node.chapterId, node.stageId)}
                  animate={{
                    scale: isHovered && !node.locked ? 1.2 : isCurrent ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                />

                {/* 노드 아이콘 */}
                <foreignObject
                  x={`${node.x}%`}
                  y={`${node.y}%`}
                  width="32"
                  height="32"
                  style={{ transform: 'translate(-16px, -16px)' }}
                >
                  <div className="flex items-center justify-center w-full h-full text-white text-xs font-bold">
                    {node.completed ? (
                      <CheckCircle2 size={20} className="text-green-300" />
                    ) : node.locked ? (
                      <Lock size={16} className="text-gray-400" />
                    ) : (
                      <Star size={18} className="text-yellow-300" />
                    )}
                  </div>
                </foreignObject>

                {/* 노드 번호 */}
                <text
                  x={`${node.x}%`}
                  y={`${node.y + 3}%`}
                  textAnchor="middle"
                  className="text-xs font-bold fill-white"
                  style={{ pointerEvents: 'none' }}
                >
                  {node.chapterId}-{node.stageId}
                </text>

                {/* 현재 위치 캐릭터 */}
                {isCurrent && (
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <foreignObject
                      x={`${node.x}%`}
                      y={`${node.y - 2}%`}
                      width="40"
                      height="40"
                      style={{ transform: 'translate(-20px, -40px)' }}
                    >
                      <motion.div
                        className="relative"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
                          🦸
                        </div>
                        <motion.div
                          className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Sparkles size={16} className="text-yellow-400" />
                        </motion.div>
                      </motion.div>
                    </foreignObject>
                  </motion.g>
                )}

                {/* 호버 툴팁 */}
                {isHovered && !node.locked && (
                  <motion.g
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <rect
                      x={`${node.x}%`}
                      y={`${node.y - 6}%`}
                      width="120"
                      height="50"
                      rx="8"
                      fill="#1f2937"
                      fillOpacity="0.95"
                      stroke="#6366f1"
                      strokeWidth="2"
                      style={{ transform: 'translate(-60px, -60px)' }}
                    />
                    <text
                      x={`${node.x}%`}
                      y={`${node.y - 4}%`}
                      textAnchor="middle"
                      className="text-xs font-bold fill-white"
                      style={{ transform: 'translateY(-50px)' }}
                    >
                      {node.title}
                    </text>
                    {node.expReward && (
                      <text
                        x={`${node.x}%`}
                        y={`${node.y - 2}%`}
                        textAnchor="middle"
                        className="text-xs fill-yellow-400"
                        style={{ transform: 'translateY(-50px)' }}
                      >
                        +{node.expReward} EXP
                      </text>
                    )}
                  </motion.g>
                )}
              </g>
            );
          })}
        </svg>
      </motion.div>

      {/* 줌 컨트롤 */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <motion.button
          onClick={() => setMapScale(Math.min(2, mapScale + 0.1))}
          className="w-10 h-10 bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          +
        </motion.button>
        <motion.button
          onClick={() => setMapScale(Math.max(0.5, mapScale - 0.1))}
          className="w-10 h-10 bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
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
          className="w-10 h-10 bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ⌂
        </motion.button>
      </div>

      {/* 범례 */}
      <div className="absolute top-4 left-4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 z-10">
        <div className="text-xs text-white space-y-1">
          <div className="flex items-center gap-2">
            <Star size={12} className="text-yellow-400" />
            <span>진행 가능</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-green-400" />
            <span>완료</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={12} className="text-gray-400" />
            <span>잠금</span>
          </div>
        </div>
      </div>
    </div>
  );
}

