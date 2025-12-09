import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, CheckCircle, Lock, Clock } from 'lucide-react';

interface ContentModule {
  id: string;
  moduleType: string;
  titleKo: string;
  description: string;
  estimatedTime: number;
  expReward: number;
  isCompleted: boolean;
  displayOrder: number;
}

const Week0Page: React.FC = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<ContentModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekProgress, setWeekProgress] = useState({
    status: 'locked',
    progressPercent: 0,
    completedModules: 0,
    totalModules: 0,
  });

  useEffect(() => {
    fetchWeekData();
  }, []);

  const fetchWeekData = async () => {
    try {
      // 주차 정보 조회
      const weekResponse = await fetch('/api/curriculum/weeks/0');
      const weekData = await weekResponse.json();

      // 진행 상황 조회
      const progressResponse = await fetch('/api/curriculum/progress/0', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const progressData = await progressResponse.json();

      setModules(weekData.data.contentModules || []);
      setWeekProgress(progressData.data || weekProgress);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching week data:', error);
      setLoading(false);
    }
  };

  const startWeek = async () => {
    try {
      await fetch('/api/curriculum/weeks/0/start', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      fetchWeekData();
    } catch (error) {
      console.error('Error starting week:', error);
    }
  };

  const openModule = (module: ContentModule) => {
    navigate(`/curriculum/week/0/module/${module.id}`);
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'cinematic_video':
        return '🎬';
      case 'quiz':
        return '📝';
      case 'assignment':
        return '✍️';
      case 'lecture_video':
        return '🎓';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-white text-2xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* 헤더 */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            0주차: 운명의 시작
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            바알시불과의 만남
          </p>
          <p className="text-gray-400">
            왜 운동을 해야 하는가?
          </p>
        </motion.div>

        {/* 진행 상황 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-purple-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">진행 상황</h3>
              <p className="text-sm text-gray-400">
                {weekProgress.completedModules} / {weekProgress.totalModules} 완료
              </p>
            </div>
            <div className="text-3xl font-bold text-purple-400">
              {weekProgress.progressPercent}%
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weekProgress.progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        </motion.div>

        {/* 시작 버튼 (아직 시작 안 했을 때) */}
        {weekProgress.status === 'locked' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <button
              onClick={startWeek}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Play className="inline-block mr-2" size={24} />
              여정 시작하기
            </button>
          </motion.div>
        )}

        {/* 콘텐츠 모듈 목록 */}
        <div className="grid gap-4">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border ${
                module.isCompleted
                  ? 'border-green-500/50'
                  : weekProgress.status === 'locked'
                  ? 'border-gray-700/50 opacity-60'
                  : 'border-purple-500/30 hover:border-purple-500/60'
              } transition-all cursor-pointer group`}
              onClick={() =>
                weekProgress.status !== 'locked' && openModule(module)
              }
            >
              <div className="flex items-start gap-4">
                {/* 아이콘 */}
                <div
                  className={`text-4xl ${
                    module.isCompleted
                      ? 'opacity-100'
                      : weekProgress.status === 'locked'
                      ? 'opacity-40'
                      : 'opacity-80 group-hover:opacity-100'
                  } transition-opacity`}
                >
                  {getModuleIcon(module.moduleType)}
                </div>

                {/* 콘텐츠 정보 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">
                      {module.titleKo}
                    </h3>
                    {module.isCompleted && (
                      <CheckCircle className="text-green-500" size={20} />
                    )}
                    {weekProgress.status === 'locked' && (
                      <Lock className="text-gray-500" size={20} />
                    )}
                  </div>
                  <p className="text-gray-400 mb-3">{module.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Clock size={16} />
                      {module.estimatedTime}분
                    </span>
                    <span className="text-purple-400 font-semibold">
                      +{module.expReward} XP
                    </span>
                  </div>
                </div>

                {/* 상태 표시 */}
                <div className="flex items-center">
                  {module.isCompleted ? (
                    <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-semibold">
                      완료
                    </div>
                  ) : weekProgress.status === 'locked' ? (
                    <div className="px-4 py-2 bg-gray-700/50 text-gray-500 rounded-lg">
                      잠김
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg font-semibold group-hover:bg-purple-500/30 transition-colors">
                      시작
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 완료 시 축하 메시지 */}
        {weekProgress.progressPercent === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl p-8 text-center"
          >
            <h2 className="text-3xl font-bold mb-4">🎉 축하합니다!</h2>
            <p className="text-xl text-gray-300 mb-6">
              0주차를 완료했습니다!
            </p>
            <button
              onClick={() => navigate('/curriculum/week/1')}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105"
            >
              1주차로 이동
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Week0Page;
