import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  total: number;
  completed: boolean;
  icon: string;
}

interface QuestPanelProps {
  quests: Quest[];
  title: string;
}

export default function QuestPanel({ quests, title }: QuestPanelProps) {
  return (
    <div>
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">{title}</h3>
      <div className="space-y-3">
        {quests.map((quest) => (
          <motion.div
            key={quest.id}
            className={`p-3 rounded-lg border ${
              quest.completed
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-gray-800/30 border-gray-700/50'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{quest.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {quest.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm font-semibold ${quest.completed ? 'text-green-400' : 'text-white'}`}>
                    {quest.title}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{quest.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(quest.progress / quest.total) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="ml-2 text-xs text-yellow-400 font-bold">+{quest.reward} EXP</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

