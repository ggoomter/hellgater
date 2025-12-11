import React from 'react';
import { motion } from 'framer-motion';

interface LevelBadgeProps {
  grade: string;
  level: number;
}

const gradeColors: Record<string, string> = {
  BRONZE: 'from-amber-600 to-amber-800',
  SILVER: 'from-gray-300 to-gray-500',
  GOLD: 'from-yellow-400 to-yellow-600',
  PLATINUM: 'from-cyan-400 to-cyan-600',
  DIAMOND: 'from-purple-400 to-purple-600',
};

export default function LevelBadge({ grade, level }: LevelBadgeProps) {
  const colorClass = gradeColors[grade] || gradeColors.BRONZE;
  
  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${colorClass} text-white font-bold shadow-lg`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-lg">{grade}</span>
      <span className="text-xl">Lv.{level}</span>
    </motion.div>
  );
}

