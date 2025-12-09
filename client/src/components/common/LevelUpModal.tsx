import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelUp: {
    oldLevel: number;
    newLevel: number;
    levelsGained: number;
    bodyPartName: string;
    rewards?: {
      skillPoints?: number;
      titles?: string[];
    };
  };
}

/**
 * 레벨업 모달 컴포넌트
 * 화려한 애니메이션과 함께 레벨업을 축하합니다.
 */
export default function LevelUpModal({ isOpen, onClose, levelUp }: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      // 효과음 재생 (선택사항)
      // const audio = new Audio('/sounds/level_up.mp3');
      // audio.play().catch(() => {}); // 재생 실패 시 무시

      // 햅틱 피드백 (모바일)
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }

      // 3초 후 자동으로 닫기
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* 레벨업 카드 */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                duration: 0.6,
              }}
              className="relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 파티클 효과 */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    initial={{
                      x: '50%',
                      y: '50%',
                      scale: 0,
                    }}
                    animate={{
                      x: `${50 + (Math.random() - 0.5) * 100}%`,
                      y: `${50 + (Math.random() - 0.5) * 100}%`,
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: Math.random() * 0.5,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </div>

              {/* 내용 */}
              <div className="relative z-10 text-center">
                {/* 레벨업 아이콘 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 10,
                    delay: 0.2,
                  }}
                  className="text-8xl mb-4"
                >
                  🎉
                </motion.div>

                {/* 레벨업 텍스트 */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold text-white mb-2"
                >
                  레벨업!
                </motion.h2>

                {/* 부위명 */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-white/90 mb-4"
                >
                  {levelUp.bodyPartName}
                </motion.p>

                {/* 레벨 표시 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    delay: 0.5,
                  }}
                  className="flex items-center justify-center gap-4 mb-6"
                >
                  <span className="text-5xl font-bold text-white">{levelUp.oldLevel}</span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 1] }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      delay: 0.7,
                    }}
                    className="text-4xl text-white"
                  >
                    →
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 1] }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      delay: 0.8,
                    }}
                    className="text-6xl font-bold text-white"
                  >
                    {levelUp.newLevel}
                  </motion.span>
                </motion.div>

                {/* 여러 레벨 업 시 표시 */}
                {levelUp.levelsGained > 1 && (
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-lg text-white/80 mb-4"
                  >
                    +{levelUp.levelsGained} 레벨!
                  </motion.p>
                )}

                {/* 보상 표시 */}
                {levelUp.rewards && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="mt-6 space-y-2"
                  >
                    {levelUp.rewards.skillPoints && levelUp.rewards.skillPoints > 0 && (
                      <div className="bg-white/20 rounded-lg p-3">
                        <p className="text-white font-semibold">
                          ✨ 스킬 포인트 +{levelUp.rewards.skillPoints}
                        </p>
                      </div>
                    )}
                    {levelUp.rewards.titles && levelUp.rewards.titles.length > 0 && (
                      <div className="bg-white/20 rounded-lg p-3">
                        <p className="text-white font-semibold">
                          🏆 칭호 획득: {levelUp.rewards.titles.join(', ')}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 닫기 버튼 */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  onClick={onClose}
                  className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition-colors"
                >
                  계속하기
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

