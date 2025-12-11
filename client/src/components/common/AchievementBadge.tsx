import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';

interface Achievement {
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}

interface AchievementBadgeProps {
  achievement: Achievement;
}

export default function AchievementBadge({ achievement }: AchievementBadgeProps) {
  return (
    <motion.div
      className={`p-4 rounded-lg border-2 ${
        achievement.unlocked
          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
          : 'bg-gray-800/30 border-gray-700/50 opacity-60'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl">{achievement.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {achievement.unlocked ? (
              <Unlock className="w-4 h-4 text-yellow-400" />
            ) : (
              <Lock className="w-4 h-4 text-gray-500" />
            )}
            <span className={`font-bold ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
              {achievement.title}
            </span>
          </div>
          <p className="text-sm text-gray-400">{achievement.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

