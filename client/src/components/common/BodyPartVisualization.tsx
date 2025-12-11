import React from 'react';
import { motion } from 'framer-motion';

interface BodyPartVisualizationProps {
  bodyFatPercentage?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  bodyParts?: Array<{
    id: string;
    name: string;
    level: number;
    exp: number;
    maxExp: number;
    icon: string;
  }>;
}

export default function BodyPartVisualization({
  bodyFatPercentage = 15,
  size = 'md',
  interactive = false,
  bodyParts,
}: BodyPartVisualizationProps) {
  // bodyParts가 있으면 그리드 형태로 표시
  if (bodyParts) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {bodyParts.map((part) => {
          const expPercentage = (part.exp / part.maxExp) * 100;
          return (
            <motion.div
              key={part.id}
              className="p-3 rounded-lg border border-gray-700 bg-gray-800/30 hover:border-purple-500/50 transition-all"
              whileHover={{ scale: interactive ? 1.05 : 1 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{part.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{part.name}</div>
                  <div className="text-xs text-gray-400">Lv.{part.level}</div>
                </div>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${expPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // bodyFatPercentage가 있으면 체지방률 시각화
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <motion.div
        className="w-full h-full rounded-full border-4 border-gray-700 bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden"
        whileHover={interactive ? { scale: 1.05 } : {}}
      >
        {/* 체지방률 표시 (원형 차트) */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-700"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-orange-500"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: bodyFatPercentage / 100 }}
            transition={{ duration: 1 }}
            strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{bodyFatPercentage}%</div>
            <div className="text-xs text-gray-400">체지방률</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

