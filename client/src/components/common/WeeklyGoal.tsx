import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2 } from 'lucide-react';

interface WeeklyGoalProps {
  targetWorkouts: number;
  completedWorkouts: number;
  targetMinutes: number;
  completedMinutes: number;
}

export default function WeeklyGoal({
  targetWorkouts,
  completedWorkouts,
  targetMinutes,
  completedMinutes,
}: WeeklyGoalProps) {
  const workoutPercentage = (completedWorkouts / targetWorkouts) * 100;
  const minutesPercentage = (completedMinutes / targetMinutes) * 100;

  return (
    <div>
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-purple-400" />
        주간 목표
      </h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">운동 횟수</span>
            <span className="text-white font-bold">
              {completedWorkouts} / {targetWorkouts}
            </span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(workoutPercentage, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">운동 시간</span>
            <span className="text-white font-bold">
              {completedMinutes} / {targetMinutes}분
            </span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(minutesPercentage, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

