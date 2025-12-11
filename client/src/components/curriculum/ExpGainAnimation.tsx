import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';

interface ExpGainAnimationProps {
  exp: number;
  onComplete: () => void;
}

const ExpGainAnimation: React.FC<ExpGainAnimationProps> = ({ exp, onComplete }) => {
  const [show, setShow] = useState(true);
  const [displayExp, setDisplayExp] = useState(0);

  useEffect(() => {
    // 숫자 카운트업 애니메이션
    const duration = 1500; // 1.5초
    const steps = 30;
    const increment = exp / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const newValue = Math.min(Math.floor(increment * currentStep), exp);
      setDisplayExp(newValue);

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayExp(exp);
      }
    }, stepDuration);

    // 애니메이션 완료 후 자동으로 닫기
    const closeTimer = setTimeout(() => {
      setShow(false);
      setTimeout(() => {
        onComplete();
      }, 300); // fade out 애니메이션 시간
    }, duration + 500);

    return () => {
      clearInterval(timer);
      clearTimeout(closeTimer);
    };
  }, [exp, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 배경 오버레이 */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 메인 콘텐츠 */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -50 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
          >
            {/* 반짝이는 효과 */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Sparkles className="w-32 h-32 text-yellow-400/30" />
            </motion.div>

            {/* 별 효과들 */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: '50%',
                  left: '50%',
                  x: '-50%',
                  y: '-50%',
                }}
                initial={{
                  x: '-50%',
                  y: '-50%',
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  x: `calc(-50% + ${Math.cos((i * Math.PI * 2) / 8) * 100}px)`,
                  y: `calc(-50% + ${Math.sin((i * Math.PI * 2) / 8) * 100}px)`,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
              >
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}

            {/* EXP 획득 텍스트 */}
            <motion.div
              className="relative z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              <motion.div
                className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                style={{
                  backgroundSize: '200%',
                }}
              >
                +{displayExp.toLocaleString()}
              </motion.div>
              <motion.div
                className="text-2xl font-semibold text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                EXP 획득!
              </motion.div>
            </motion.div>

            {/* 파티클 효과 */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                initial={{
                  x: '-50%',
                  y: '-50%',
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: `calc(-50% + ${(Math.random() - 0.5) * 300}px)`,
                  y: `calc(-50% + ${(Math.random() - 0.5) * 300}px)`,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExpGainAnimation;

