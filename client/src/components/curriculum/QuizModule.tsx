import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Trophy, Sparkles, Star } from 'lucide-react';
import { curriculumAPI } from '../../services/api';
import type { ContentModule } from '../../services/api/curriculum.api';
import BaalSibulCharacter from './BaalSibulCharacter';

interface QuizModuleProps {
  module: ContentModule;
  onComplete: () => void;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'single_choice' | 'text';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

interface QuizData {
  questions: QuizQuestion[];
  passingScore: number;
}

const QuizModule: React.FC<QuizModuleProps> = ({ module, onComplete }) => {
  const quizData = module.contentData as QuizData;
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterEmotion, setCharacterEmotion] = useState<'thinking' | 'excited' | 'happy' | 'sad'>('thinking');

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const calculateScore = (): number => {
    let correctCount = 0;
    quizData.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const correctAnswer = question.correctAnswer;

      if (Array.isArray(correctAnswer)) {
        // 다중 선택
        if (
          Array.isArray(userAnswer) &&
          userAnswer.length === correctAnswer.length &&
          userAnswer.every((ans) => correctAnswer.includes(ans))
        ) {
          correctCount++;
        }
      } else {
        // 단일 선택 또는 텍스트
        if (userAnswer === correctAnswer) {
          correctCount++;
        }
      }
    });

    return Math.round((correctCount / quizData.questions.length) * 100);
  };

  const handleSubmit = async () => {
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setSubmitted(true);

    // 점수에 따라 캐릭터 감정 변경
    if (calculatedScore >= quizData.passingScore) {
      setCharacterEmotion('excited');
    } else {
      setCharacterEmotion('sad');
    }

    setIsSubmitting(true);
    try {
      await curriculumAPI.submitQuiz(module.id, {
        answers,
        score: calculatedScore,
      });

      // 합격 여부에 관계없이 완료 처리
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('퀴즈 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPassed = score !== null && score >= quizData.passingScore;
  const allAnswered = quizData.questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-purple-900/30 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-500/30 shadow-xl shadow-purple-500/20 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent opacity-50" />

      {!submitted ? (
        <>
          <div className="mb-6 relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <BaalSibulCharacter level={1} emotion={characterEmotion} size="small" />
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="text-yellow-400" size={24} />
                  퀴즈 도전!
                </h2>
                <p className="text-gray-300">
                  {quizData.questions.length}개의 문제 | 합격 점수: {quizData.passingScore}점
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            {quizData.questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-gray-700/60 to-gray-800/60 rounded-xl p-6 border border-purple-500/20 shadow-lg"
              >
                <div className="mb-4">
                  <span className="text-purple-400 font-semibold">문제 {index + 1}</span>
                  <h3 className="text-xl font-semibold mt-2">{question.question}</h3>
                </div>

                {question.type === 'multiple_choice' || question.type === 'single_choice' ? (
                  <div className="space-y-2">
                    {question.options?.map((option, optIndex) => {
                      const isSelected =
                        question.type === 'single_choice'
                          ? answers[question.id] === option
                          : answers[question.id]?.includes(option);

                      return (
                        <label
                          key={optIndex}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-purple-600/30 border border-purple-500'
                              : 'bg-gray-800/50 hover:bg-gray-800'
                          }`}
                        >
                          <input
                            type={question.type === 'single_choice' ? 'radio' : 'checkbox'}
                            name={question.id}
                            value={option}
                            checked={isSelected}
                            onChange={() => {
                              if (question.type === 'single_choice') {
                                handleAnswerChange(question.id, option);
                              } else {
                                const current = answers[question.id] || [];
                                if (current.includes(option)) {
                                  handleAnswerChange(
                                    question.id,
                                    current.filter((a: string) => a !== option)
                                  );
                                } else {
                                  handleAnswerChange(question.id, [...current, option]);
                                }
                              }
                            }}
                            className="w-5 h-5 text-purple-600"
                          />
                          <span className="flex-1">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                    placeholder="답을 입력하세요"
                  />
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                allAnswered && !isSubmitting
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>제출 중...</span>
                </>
              ) : (
                <span>제출하기</span>
              )}
            </button>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 relative z-10"
        >
          {/* 바알시불 캐릭터 */}
          <div className="flex justify-center mb-6">
            <BaalSibulCharacter
              level={1}
              emotion={isPassed ? 'excited' : 'sad'}
              size="large"
            />
          </div>

          {isPassed ? (
            <>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="mb-4"
              >
                <Trophy className="mx-auto text-yellow-400 mb-4" size={64} />
              </motion.div>
              <motion.h2
                className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                합격! 🎉
              </motion.h2>
              <p className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
                <Star className="text-yellow-400 fill-yellow-400" size={24} />
                점수: {score}점
                <Star className="text-yellow-400 fill-yellow-400" size={24} />
              </p>
              <motion.p
                className="text-gray-300 mb-6 text-lg flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Sparkles className="text-purple-400" size={20} />
                축하합니다! {module.expReward} XP를 획득했습니다!
                <Sparkles className="text-purple-400" size={20} />
              </motion.p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <XCircle className="mx-auto text-red-400 mb-4" size={64} />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4 text-red-400">불합격</h2>
              <p className="text-2xl font-semibold mb-2">점수: {score}점</p>
              <p className="text-gray-300 mb-2">
                합격 점수는 {quizData.passingScore}점입니다.
              </p>
              <p className="text-gray-400 text-sm">
                다시 시도해보세요! (경험치는 획득하지 못합니다)
              </p>
            </>
          )}

          {/* 정답 확인 */}
          <div className="mt-8 space-y-4 text-left">
            <h3 className="text-xl font-semibold mb-4">정답 확인</h3>
            {quizData.questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect =
                Array.isArray(question.correctAnswer)
                  ? Array.isArray(userAnswer) &&
                    userAnswer.length === question.correctAnswer.length &&
                    userAnswer.every((ans) => question.correctAnswer.includes(ans))
                  : userAnswer === question.correctAnswer;

              return (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg ${
                    isCorrect ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="text-green-400 mt-1" size={20} />
                    ) : (
                      <XCircle className="text-red-400 mt-1" size={20} />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">문제 {index + 1}: {question.question}</p>
                      <p className="text-sm text-gray-300 mt-1">
                        내 답: {Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer || '(미답)'}
                      </p>
                      <p className="text-sm text-green-300 mt-1">
                        정답: {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
                      </p>
                      {question.explanation && (
                        <p className="text-sm text-gray-400 mt-2 italic">
                          설명: {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuizModule;
