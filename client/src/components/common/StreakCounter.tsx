import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string;
}

export default function StreakCounter({ currentStreak, bestStreak, lastActivityDate }: StreakCounterProps) {
  return (
    <div>
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        🔥 연속 운동일
      </h3>
      <div className="space-y-4">
        <div className="text-center">
          <motion.div
            className="text-5xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {currentStreak}
          </motion.div>
          <p className="text-sm text-gray-400 mt-1">일 연속</p>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">최고 기록</span>
          <span className="text-yellow-400 font-bold">{bestStreak}일</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">마지막 활동</span>
          <span className="text-gray-300">{lastActivityDate}</span>
        </div>
      </div>
    </div>
  );
}

