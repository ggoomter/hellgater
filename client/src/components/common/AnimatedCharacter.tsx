import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCharacterProps {
  emoji: string;
  level: number;
  className?: string;
  isLevelUp?: boolean;
}

export default function AnimatedCharacter({ emoji, level, className = '', isLevelUp = false }: AnimatedCharacterProps) {
  return (
    <div className={className}>
      <motion.div
        className="text-8xl"
        animate={isLevelUp ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : { scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {emoji}
      </motion.div>
      <div className="text-center mt-2">
        <span className="text-sm text-gray-400">Lv.{level}</span>
      </div>
    </div>
  );
}

