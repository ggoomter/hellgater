import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Trophy } from 'lucide-react';

interface QuizQuestion {
  id: number;
  text: string;
  type: 'single_choice' | 'multiple_choice';
  options: string[];
  correctAnswer: number | number[];
  explanation?: string;
}

interface QuizModuleProps {
  moduleId: string;
  questions: QuizQuestion[];
  onComplete: (score: number, answers: any[]) => void;
}

const QuizModule: React.FC<QuizModuleProps> = ({
  moduleId,
  questions,
  onComplete,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleSelectAnswer = (optionIndex: number) => {
    if (question.type === 'single_choice') {
      setSelectedAnswers([optionIndex]);
    } else {
      // 다중 선택
      if (selectedAnswers.includes(optionIndex)) {
        setSelectedAnswers(selectedAnswers.filter((i) => i !== optionIndex));
      } else {
        setSelectedAnswers([...selectedAnswers, optionIndex]);
      }
    }
  };

  const checkAnswer = () => {
    const correct =
      question.type === 'single_choice'
        ? selectedAnswers[0] === question.correctAnswer
        : JSON.stringify(selectedAnswers.sort()) ===
          JSON.stringify((question.correctAnswer as number[]).sort());

    setUserAnswers([
      ...userAnswers,
      {
        questionId: question.id,
        selected: selectedAnswers,
        correct,
      },
    ]);

    setShowResult(true);

    if (correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (isLastQuestion) {
      // 퀴즈 완료
      const finalScore = Math.round((score / questions.length) * 100);
      setQuizCompleted(true);
      onComplete(finalScore, userAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswers([]);
      setShowResult(false);
    }
  };

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-8"
      >
        <div
          className={`bg-gradient-to-br ${
            passed
              ? 'from-green-500/20 to-emerald-500/20 border-green-500/50'
              : 'from-orange-500/20 to-red-500/20 border-orange-500/50'
          } border rounded-2xl p-8 text-center`}
        >
          <div className="text-6xl mb-4">
            {passed ? <Trophy className="mx-auto text-yellow-400" size={80} /> : '📚'}
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {passed ? '축하합니다! 🎉' : '조금 더 공부해보세요!'}
          </h2>
          <div className="text-5xl font-bold mb-4 text-purple-400">
            {percentage}점
          </div>
          <p className="text-xl text-gray-300 mb-6">
            {score} / {questions.length} 문제 정답
          </p>
          {passed ? (
            <p className="text-green-400 mb-6">
              퀴즈를 통과했습니다! 경험치를 획득했어요.
            </p>
          ) : (
            <p className="text-orange-400 mb-6">
              70점 이상이면 통과입니다. 다시 도전해보세요!
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* 진행 상황 */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>
            문제 {currentQuestion + 1} / {questions.length}
          </span>
          <span>점수: {score}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
            }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          />
        </div>
      </div>

      {/* 질문 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30"
        >
          <h3 className="text-2xl font-bold mb-6">{question.text}</h3>

          {/* 선택지 */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswers.includes(index);
              const isCorrect =
                question.type === 'single_choice'
                  ? index === question.correctAnswer
                  : (question.correctAnswer as number[]).includes(index);

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: showResult ? 1 : 1.02 }}
                  whileTap={{ scale: showResult ? 1 : 0.98 }}
                  onClick={() => !showResult && handleSelectAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-500/30 border-green-500'
                        : isSelected
                        ? 'bg-red-500/30 border-red-500'
                        : 'bg-gray-700/50 border-gray-600'
                      : isSelected
                      ? 'bg-purple-500/30 border-purple-500'
                      : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-purple-500/50'
                  } border-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{option}</span>
                    {showResult && isCorrect && (
                      <CheckCircle className="text-green-400" size={24} />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="text-red-400" size={24} />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* 설명 (정답 확인 후) */}
          {showResult && question.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 mb-6"
            >
              <p className="text-sm text-gray-300">
                <strong className="text-blue-400">💡 설명:</strong>{' '}
                {question.explanation}
              </p>
            </motion.div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end gap-3">
            {!showResult ? (
              <button
                onClick={checkAnswer}
                disabled={selectedAnswers.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                정답 확인
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
              >
                {isLastQuestion ? '완료' : '다음 문제'}
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizModule;
