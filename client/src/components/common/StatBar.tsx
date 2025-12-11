import React from 'react';
import { motion } from 'framer-motion';

interface StatBarProps {
  label: string;
  icon: string;
  value: number;
  maxValue: number;
  color?: string;
  animated?: boolean;
}

const colorClasses: Record<string, string> = {
  primary: 'from-purple-500 to-pink-500',
  secondary: 'from-blue-500 to-cyan-500',
  accent: 'from-yellow-500 to-orange-500',
  success: 'from-green-500 to-emerald-500',
  warning: 'from-yellow-400 to-orange-500',
  danger: 'from-red-500 to-pink-500',
};

export default function StatBar({ label, icon, value, maxValue, color = 'primary', animated = false }: StatBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const colorClass = colorClasses[color] || colorClasses.primary;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300 flex items-center gap-2">
          <span>{icon}</span>
          {label}
        </span>
        <span className="text-white font-bold">{value} / {maxValue}</span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClass} rounded-full`}
          initial={{ width: animated ? 0 : `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

