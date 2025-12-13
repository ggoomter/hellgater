import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/common';
import { Link } from 'react-router-dom';
import { skillApi, Skill } from '../services/api/skill.api';
import { useQuery } from '@tanstack/react-query';

// 화살표 그리기 컴포넌트
const TreeConnection = ({ 
  start, 
  end 
}: { 
  start: { x: number; y: number }; 
  end: { x: number; y: number } 
}) => {
  // 노드 크기 보정 (중앙 연결)
  const NODE_OFFSET_X = 32; // w-16 / 2
  const NODE_OFFSET_Y = 32; // h-16 / 2

  const x1 = start.x + NODE_OFFSET_X;
  const y1 = start.y + NODE_OFFSET_Y;
  const x2 = end.x + NODE_OFFSET_X;
  const y2 = end.y + NODE_OFFSET_Y;

  return (
    <motion.path
      d={`M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`}
      stroke="#4b5563"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ strokeDasharray: "0", strokeDashoffset: "0" }} // 점선 방지 강제 설정
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  );
};

export default function Skills() {
  const [selectedBodyPart, setSelectedBodyPart] = useState<number | undefined>(undefined);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // 스킬 데이터 조회
  const { data: skills, isLoading } = useQuery({
    queryKey: ['skills', selectedBodyPart],
    queryFn: () => skillApi.getAll(selectedBodyPart),
  });

  // 화면 중앙 정렬을 위한 컨테이너 오프셋 계산 (간단히 고정값 사용 혹은 동적 계산)
  const containerRef = useRef<HTMLDivElement>(null);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        Loading Skill Tree...
      </div>
    );
  }

  // 연결선 데이터 생성
  const connections = skills?.flatMap((skill: Skill) => 
    skill.prerequisiteSkillIds.map((prereqId: number) => {
      const prereq = skills.find((s: Skill) => s.id === prereqId);
      if (!prereq) return null;
      return { from: prereq, to: skill };
    })
  ).filter(Boolean) as { from: Skill; to: Skill }[] || [];

  return (
    <div className="min-h-screen bg-black overflow-hidden flex flex-col" style={{ backgroundImage: 'none' }}>
      {/* 헤더 */}
      <header className="p-6 flex justify-between items-center z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div>
           <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors mb-2 block">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            SKILL TREE
          </h1>
          <p className="text-gray-400 text-sm">성장의 길을 선택하세요</p>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" size="sm" onClick={() => setSelectedBodyPart(undefined)}>초기화</Button>
           <Button variant="primary" size="sm">저장</Button>
        </div>
      </header>

      {/* 메인 트리 영역 */}
      <div className="flex-1 relative overflow-auto cursor-grab active:cursor-grabbing" ref={containerRef}>
        <div className="absolute inset-0 min-w-[1000px] min-h-[1000px] p-20">
          
          {/* 연결선 레이어 (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
             {connections.map((conn) => (
               <TreeConnection 
                 key={`${conn.from.id}-${conn.to.id}`} 
                 start={{ x: conn.from.treePositionX, y: conn.from.treePositionY }} 
                 end={{ x: conn.to.treePositionX, y: conn.to.treePositionY }} 
               />
             ))}
          </svg>

          {/* 스킬 노드 레이어 */}
          {skills?.map((skill: Skill) => {
             const isUnlocked = skill.isUnlocked;
             // Unlocked if prerequisites are met (simplified logic)
             // In real app, check if all prereq skills are in userSkills
             const isAvailable = true; 

             return (
               <motion.div
                 key={skill.id}
                 className={`absolute w-16 h-16 rounded-full border-4 flex items-center justify-center z-10 cursor-pointer transition-all
                   ${isUnlocked 
                     ? 'bg-yellow-500 border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.5)]' 
                     : isAvailable 
                       ? 'bg-gray-700 border-gray-500 hover:border-yellow-500/50' 
                       : 'bg-gray-800 border-gray-700 opacity-50 grayscale'
                   }
                 `}
                 style={{ 
                   left: skill.treePositionX, 
                   top: skill.treePositionY 
                 }}
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => setSelectedSkill(skill)}
               >
                 {/* 아이콘 (이미지 또는 텍스트) */}
                 <span className="text-2xl">{skill.tier === 'BRONZE' ? '🥉' : skill.tier === 'SILVER' ? '🥈' : '🥇'}</span>
                 
                 {/* 레벨 라벨 */}
                 <div className="absolute -bottom-8 bg-gray-900/80 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                   {skill.nameKo}
                 </div>
               </motion.div>
             );
          })}
        </div>
      </div>

      {/* 스킬 상세 패널 (모달/드로어) */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-gray-900 border-l border-gray-700 p-6 z-50 shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedSkill.nameKo}</h2>
              <button 
                onClick={() => setSelectedSkill(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                스킬 시연 영상/이미지
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">설명</h3>
                <p className="text-gray-300 leading-relaxed">
                  {selectedSkill.description}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">해금 조건</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-300">필요 레벨</span>
                    <span className="text-yellow-400 font-bold">Lv. {selectedSkill.requiredLevel || 1}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-300">필요 포인트</span>
                    <span className="text-yellow-400 font-bold">3 SP</span>
                  </li>
                </ul>
              </div>

              <Button 
                variant="primary" 
                fullWidth 
                size="lg"
                disabled={!selectedSkill.isUnlocked} 
              >
                {selectedSkill.isUnlocked ? '이미 습득함' : '습득하기'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
