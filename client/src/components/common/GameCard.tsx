import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

interface GameCardProps {
  children: React.ReactNode;
  glowing?: boolean;
  delay?: number;
  className?: string;
}

export default function GameCard({ children, glowing = false, delay = 0, className = '' }: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={className}
    >
      <Card
        variant="glass"
        className={`${glowing ? 'ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20' : ''} ${className}`}
      >
        {children}
      </Card>
    </motion.div>
  );
}

