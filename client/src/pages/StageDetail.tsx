import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '../components/common';
import { transformContent, transformQuizText, speechStyles, type SpeechStyle } from '../utils/contentTransformer';
import { mapApi } from '../services/api/map.api';

// 스테이지 컨텐츠 데이터 (MVP: 무속성 1-1만 구현)
const stageContent: Record<string, any> = {
  'neutral-1-1': {
    title: '1-1. 근성장의 원리',
    attribute: 'neutral',
    chapter: 1,
    stage: 1,
    content: `
## 💪 야, 너 근육이 어떻게 크는지 알아?

> "운동만 열심히 하면 근육 커지겠지?"

ㅋㅋㅋㅋㅋ 아니야. 근육은 **마법**으로 안 커. 과학이야, 과학!

근육이 커지는 건 딱 **3단계**야. 외우면 너도 마동석 될 수 있어:

---

## 🔥 1단계: 자극 (Stimulus) - "부숴!"

헬스장에서 **중량을 들면** 근육에 미세한 균열이 생겨.
생각해봐. 너가 벽돌을 반복해서 치면 손에 금이 가잖아?
근육도 똑같아!

**자극 주는 방법:**
- 🏋️ 무거운 바벨 들기 (손이 떨릴 때까지)
- 💥 같은 동작 반복 (근육이 "아악!" 할 때까지)
- ⚡ 평소보다 더 강한 부하 (몸이 "이건 뭐야?!" 할 정도)

> 💡 **TIP**: 근육에게 "야 너 오늘 죽는다" 라고 말해줘야 해

---

## 😴 2단계: 회복 (Recovery) - "자라나라 얍!"

자극 받은 근육은 이렇게 생각해:
> "아... 이게 뭐야... 다음엔 이런 일 없게 더 강해져야겠어!"

그래서 **휴식 중에** 근육이 회복되면서 더 강해져!

**회복 필수 3종 세트:**
- 💤 **꿀잠** (최소 7-8시간, 안 자면 근손실)
- 🍗 **단백질 폭탄** (체중 kg당 1.6~2.2g 먹어치워)
- 🛌 **쉼** (같은 부위는 48-72시간 쉬게 해줘)

> ⚠️ **주의**: 매일 가슴만 하면? → 가슴 근육 "형 그만... 죽어..."

---

## 🚀 3단계: 성장 (Growth) - "레벨업!"

회복이 끝나면 근육이 **이전보다 더 크고 강하게** 재생돼!
이걸 **과보상(Supercompensation)**이라고 해.

RPG 게임으로 치면:
- 1단계 자극 = 몬스터한테 맞음
- 2단계 회복 = HP 회복 물약 먹음
- 3단계 성장 = **레벨업!** 스탯 올랐다!

---

## 🎯 핵심: 점진적 과부하 (Progressive Overload)

근육은 **익숙해지면 안 커져**. 계속 더 강한 자극을 줘야 해!

> 예를 들어볼까?

**Week 1:** 벤치프레스 30kg × 10회 → 근육 "우와 힘들다!"
**Week 2:** 벤치프레스 30kg × 10회 → 근육 "어? 할만한데?"
**Week 3:** 벤치프레스 30kg × 10회 → 근육 "ㅋㅋ 쉽네"
**Week 4:** 벤치프레스 30kg × 10회 → 근육 "자는 중..."

❌ **이러면 안 돼!**

**올바른 방법:**
1. 💪 **무게 올리기**: 30kg → 32.5kg → 35kg...
2. 🔢 **횟수 늘리기**: 8회 → 10회 → 12회
3. 📊 **세트 추가**: 3세트 → 4세트 → 5세트
4. ⏱️ **휴식 줄이기**: 90초 → 75초 → 60초

---

## 💎 근비대(Hypertrophy) 치트키

근육 키우고 싶으면 이 공식 외워:

- **무게**: 1RM의 60-80% (안 무겁지도 않고 안 가볍지도 않게)
- **반복 횟수**: 8-12회 (정확히 이 구간!)
- **세트**: 3-5세트 (적당히)
- **휴식**: 60-90초 (너무 길면 안 돼)
- **빈도**: 주 2-3회 (같은 부위 기준)

---

## ❌ 헬린이들이 착각하는 3가지

### 🚫 오해 1: "매일 운동하면 빨리 커져!"

**X틀렸어X**

근육은 **쉬는 동안** 커져. 매일 하면?
→ 근육 "야 쉬게 좀 해줘... 😭"
→ **과훈련** = 근손실 + 부상

올바른 루틴:
- 월: 가슴
- 화: 등
- 수: 휴식
- 목: 하체
- 금: 어깨
- 토일: 휴식

### 🚫 오해 2: "가벼운 무게로 100번 하면 탄탄해져!"

**반만 맞음**

가벼운 무게 × 많은 횟수 = 근지구력 ↑
근육 크기 ↑? → 별로...

근육 키우려면: **적당히 무거운 무게 × 8-12회**

### 🚫 오해 3: "보충제 없으면 근육 안 커져!"

**X완전 거짓X**

닭가슴살, 계란, 두부, 콩... 먹으면 돼!
보충제는 그냥 **편하게 단백질 먹는 방법**일 뿐이야.

---

## 📚 정리: 3줄 요약

1. 💥 **부수고** (자극)
2. 😴 **쉬고** (회복)
3. 💪 **커진다** (성장)

**+ 계속 더 무겁게 들어야 계속 커져!**

---

## 🎉 축하해! 이제 근육 박사야!

이제 너는:
- ✅ 근육이 어떻게 크는지 알았어
- ✅ 점진적 과부하가 뭔지 알았어
- ✅ 헬린이 실수를 피할 수 있어

다음 스테이지에서는 **먹는 게 반이다**를 배워볼 거야!
(살 안 찌면서 근육만 키우는 법 ㄹㅇ 꿀팁)
    `,
    quiz: [
      {
        question: '근육 성장의 3단계를 순서대로 고르면?',
        options: [
          '자극 → 회복 → 성장',
          '회복 → 자극 → 성장',
          '성장 → 자극 → 회복',
          '자극 → 성장 → 회복'
        ],
        answer: 0,
        explanation: '정답! 💪 운동으로 자극 → 쉬면서 회복 → 더 강하게 성장!',
      },
      {
        question: '근비대(근육 키우기)에 최적인 반복 횟수는?',
        options: [
          '3-5회 (파워리프팅)',
          '8-12회 (근비대)',
          '15-20회 (근지구력)',
          '50회 이상 (유산소)'
        ],
        answer: 1,
        explanation: '정답! 🎯 8-12회가 근육 키우기 골든존이야!',
      },
      {
        question: '점진적 과부하(Progressive Overload)란?',
        options: [
          '매일 똑같은 무게로 운동하기',
          '계속 무게/횟수/세트를 늘리기',
          '가벼운 무게로 많이 하기',
          '하루에 10시간 운동하기'
        ],
        answer: 1,
        explanation: '정답! 📈 계속 더 강한 자극을 줘야 근육이 계속 커져!',
      },
    ],
    rewards: {
      exp: 100,
      unlockNext: true,
    },
  },
};

export default function StageDetail() {
  const { attribute, chapterId, stageId } = useParams();
  const navigate = useNavigate();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [speechStyle, setSpeechStyle] = useState<SpeechStyle>('casual'); // 기본값: 편한 반말
  const [showStyleSelector, setShowStyleSelector] = useState(false);

  const stageKey = `${attribute}-${chapterId}-${stageId}`;
  const stage = stageContent[stageKey];

  const handleAnswerClick = (questionIndex: number, optionIndex: number) => {
    if (showResults) return; // 결과 보여주는 중이면 변경 불가
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const getScore = () => {
    if (!stage.quiz) return 0;
    let correct = 0;
    stage.quiz.forEach((q: any, index: number) => {
      if (selectedAnswers[index] === q.answer) {
        correct++;
      }
    });
    return correct;
  };

  if (!stage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
        <Card variant="glass">
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🚧</div>
            <h2 className="text-2xl font-bold text-white mb-3">준비 중입니다</h2>
            <p className="text-gray-400 mb-6">이 스테이지의 컨텐츠는 곧 오픈됩니다!</p>
            <Button variant="primary" onClick={() => navigate('/map')}>
              맵으로 돌아가기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* 헤더 */}
        <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => navigate('/map')} className="mb-4">
            ← 맵으로 돌아가기
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-primary font-bold text-lg">
              Chapter {stage.chapter} - Stage {stage.stage}
            </div>
            <div className="h-1 flex-1 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">{stage.title}</h1>
        </motion.div>

        {/* 말투 선택 */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <button
            onClick={() => setShowStyleSelector(!showStyleSelector)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/70 hover:bg-gray-700/70 border-2 border-gray-600 hover:border-primary rounded-xl transition-all"
          >
            <span className="text-2xl">{speechStyles.find(s => s.id === speechStyle)?.emoji}</span>
            <span className="text-white font-medium">{speechStyles.find(s => s.id === speechStyle)?.name}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {showStyleSelector && (
              <motion.div
                className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {speechStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setSpeechStyle(style.id);
                      setShowStyleSelector(false);
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      speechStyle === style.id
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/30'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{style.emoji}</span>
                      <h3 className="text-white font-bold">{style.name}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{style.description}</p>
                    <p className="text-gray-300 text-xs italic">"{style.example}"</p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 컨텐츠 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card variant="glass" className="backdrop-blur-xl bg-white/10 mb-8">
            <div
              className="text-gray-200 leading-relaxed text-lg"
              dangerouslySetInnerHTML={{
                __html: transformContent(stage.content, speechStyle)
                  .split('\n')
                  .map((line: string) => {
                    // 헤딩 변환
                    if (line.startsWith('###')) {
                      return `<h3 class="text-2xl font-bold text-white mt-8 mb-4 flex items-center gap-2">${line.replace('###', '').trim()}</h3>`;
                    }
                    if (line.startsWith('##')) {
                      return `<h2 class="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mt-10 mb-6">${line.replace('##', '').trim()}</h2>`;
                    }
                    // 인용구
                    if (line.startsWith('>')) {
                      return `<blockquote class="border-l-4 border-secondary bg-secondary/10 pl-6 py-4 italic text-gray-100 text-xl my-6 rounded-r">${line.replace('>', '').trim()}</blockquote>`;
                    }
                    // 구분선
                    if (line.trim() === '---') {
                      return '<hr class="border-gradient-to-r from-transparent via-primary to-transparent border-t-2 my-10" />';
                    }
                    // 리스트 아이템
                    if (line.trim().startsWith('-')) {
                      return `<li class="ml-10 my-3 text-gray-200 text-lg list-disc marker:text-primary">${line.replace(/^-\s*/, '').trim()}</li>`;
                    }
                    // 번호 리스트
                    if (line.trim().match(/^\d+\./)) {
                      return `<li class="ml-10 my-3 text-gray-200 text-lg list-decimal marker:text-primary marker:font-bold">${line.replace(/^\d+\.\s*/, '').trim()}</li>`;
                    }
                    // 일반 텍스트
                    if (line.trim() === '') return '<br/>';
                    // Bold 처리
                    const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-secondary font-bold text-xl">$1</strong>');
                    return `<p class="my-4 leading-relaxed text-gray-200">${boldProcessed}</p>`;
                  })
                  .join(''),
              }}
            />

            {/* 퀴즈 섹션 */}
            {stage.quiz && (
              <div className="mt-12 pt-8 border-t-2 border-gray-700">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-8 flex items-center gap-3">
                  📝 이해도 체크 퀴즈!
                </h2>

                <div className="space-y-8">
                  {stage.quiz.map((q: any, questionIndex: number) => {
                    const isAnswered = selectedAnswers[questionIndex] !== undefined;
                    const isCorrect = selectedAnswers[questionIndex] === q.answer;

                    return (
                      <motion.div
                        key={questionIndex}
                        className="bg-gray-800/70 p-6 rounded-2xl border-2 border-gray-700"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: questionIndex * 0.1 }}
                      >
                        <p className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                          <span className="bg-primary text-gray-900 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                            {questionIndex + 1}
                          </span>
                          {transformQuizText(q.question, speechStyle)}
                        </p>

                        <div className="space-y-3">
                          {q.options.map((option: string, optIndex: number) => {
                            const isSelected = selectedAnswers[questionIndex] === optIndex;
                            const isThisCorrect = optIndex === q.answer;

                            let buttonClass = 'w-full text-left p-5 rounded-xl border-2 transition-all text-lg font-medium';

                            if (showResults) {
                              if (isThisCorrect) {
                                buttonClass += ' border-green-500 bg-green-900/30 text-green-200';
                              } else if (isSelected && !isThisCorrect) {
                                buttonClass += ' border-red-500 bg-red-900/30 text-red-200';
                              } else {
                                buttonClass += ' border-gray-600 bg-gray-800/30 text-gray-400';
                              }
                            } else {
                              if (isSelected) {
                                buttonClass += ' border-primary bg-primary/20 text-white shadow-lg shadow-primary/30';
                              } else {
                                buttonClass += ' border-gray-600 bg-gray-800/30 text-gray-300 hover:border-primary hover:bg-primary/10';
                              }
                            }

                            return (
                              <button
                                key={optIndex}
                                onClick={() => handleAnswerClick(questionIndex, optIndex)}
                                disabled={showResults}
                                className={buttonClass}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-primary bg-primary' : 'border-gray-500'
                                  }`}>
                                    {isSelected && (
                                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="flex-1">{option}</span>
                                  {showResults && isThisCorrect && <span className="text-2xl">✅</span>}
                                  {showResults && isSelected && !isThisCorrect && <span className="text-2xl">❌</span>}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* 정답 설명 */}
                        <AnimatePresence>
                          {showResults && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 p-4 bg-primary/10 border-l-4 border-primary rounded-r-xl"
                            >
                              <p className="text-primary font-bold text-lg">{transformQuizText(q.explanation, speechStyle)}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                {/* 퀴즈 제출/결과 */}
                {!showResults && Object.keys(selectedAnswers).length === stage.quiz.length && (
                  <motion.div
                    className="mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button variant="primary" size="lg" fullWidth onClick={handleSubmitQuiz}>
                      정답 확인하기! 🎯
                    </Button>
                  </motion.div>
                )}

                {showResults && (
                  <motion.div
                    className="mt-8 p-6 bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary rounded-2xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {getScore() === stage.quiz.length ? '🎉 완벽해!' : '💪 좋았어!'}
                    </h3>
                    <p className="text-gray-200 text-xl">
                      {getScore()} / {stage.quiz.length} 정답!
                      {getScore() === stage.quiz.length
                        ? transformQuizText(' 너 진짜 천재야 ㄹㅇㅋㅋ', speechStyle)
                        : transformQuizText(' 다시 읽고 복습하자!', speechStyle)}
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </Card>

          {/* 완료 버튼 */}
          {(!stage.quiz || showResults) && (
            <div className="flex gap-4">
              <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/map')}>
                나중에 다시 볼게
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={async () => {
                  try {
                    const score = stage.quiz ? getScore() : 0;
                    const maxScore = stage.quiz ? stage.quiz.length : 0;
                    const bonus = score === maxScore && maxScore > 0 ? 50 : 0;

                    // 로컬 스토리지에 완료 상태 저장
                    const stageCode = `${attribute}-${chapterId}-${stageId}`;
                    const completedStagesStr = localStorage.getItem('completedStages');
                    const completedStages = completedStagesStr ? new Set(JSON.parse(completedStagesStr)) : new Set();
                    completedStages.add(stageCode);
                    localStorage.setItem('completedStages', JSON.stringify([...completedStages]));

                    // 스테이지 완료 API 호출 (백엔드 구현 시)
                    try {
                      await mapApi.completeStage({
                        stageCode,
                        score: maxScore > 0 ? score : undefined,
                      });
                    } catch (apiError) {
                      console.log('API not available yet, using local storage');
                    }

                    const totalExp = stage.rewards.exp + bonus;
                    alert(`🎉 +${totalExp} EXP 획득!\n다음 스테이지가 해금되었습니다!`);
                    navigate('/map');
                  } catch (error: any) {
                    console.error('Failed to complete stage:', error);
                    alert(`오류가 발생했습니다. 다시 시도해주세요.`);
                  }
                }}
                disabled={stage.quiz && !showResults}
              >
                완료하고 다음으로! (+{stage.rewards.exp} EXP) 🚀
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
