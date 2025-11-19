import { useState, useMemo } from 'react';
import { parseExerciseMarkdown, getDifficultyLabel, getDifficultyColor, type Exercise } from '@shared/utils/exerciseParser';

// 마크다운 데이터 import
import { shoulderMd } from '@/data/exercises/01-shoulder';
import { chestMd } from '@/data/exercises/02-chest';
import { backMd } from '@/data/exercises/03-back';
import { armMd } from '@/data/exercises/04-arm';
import { abdominalMd } from '@/data/exercises/05-abdominal';
import { hipMd } from '@/data/exercises/06-hip';
import { legMd } from '@/data/exercises/07-leg';

interface ExerciseSelectorProps {
  bodyPartId: number | null;
  view: 'front' | 'back' | null;
  selectedExerciseId: number | null;
  onSelectExercise: (exerciseId: number, exerciseName: string) => void;
}

// 부위 ID별 마크다운 매핑
const MARKDOWN_MAP: Record<number, string> = {
  1: shoulderMd,
  2: chestMd,
  3: backMd,
  4: armMd,
  5: abdominalMd,
  6: hipMd,
  7: legMd,
};

export default function ExerciseSelector({
  bodyPartId,
  view,
  selectedExerciseId,
  onSelectExercise,
}: ExerciseSelectorProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  // 선택된 부위의 운동 데이터 파싱
  const exerciseData = useMemo(() => {
    if (!bodyPartId || !MARKDOWN_MAP[bodyPartId]) return null;
    return parseExerciseMarkdown(MARKDOWN_MAP[bodyPartId]);
  }, [bodyPartId]);

  // 현재 선택된 난이도의 운동 목록 (view 필터링 적용)
  const currentExercises = useMemo(() => {
    if (!exerciseData) return [];

    const exercises = exerciseData.exercises[selectedDifficulty] || [];

    // view가 없으면 모든 운동 표시
    if (!view) return exercises;

    // view에 맞는 운동만 필터링 (해당 view 또는 'both')
    return exercises.filter(exercise =>
      exercise.view === view || exercise.view === 'both'
    );
  }, [exerciseData, selectedDifficulty, view]);

  // 현재 필터링된 운동들의 주요 근육 추출
  const displayMuscles = useMemo(() => {
    if (!exerciseData) return '';

    // view가 없으면 전체 근육 표시
    if (!view) return exerciseData.primaryMuscles;

    // 현재 선택된 난이도의 운동에서만 근육 추출
    const exercises = exerciseData.exercises[selectedDifficulty] || [];

    const filteredExercises = exercises.filter(
      exercise => exercise.view === view || exercise.view === 'both'
    );

    // 주요 근육들을 중복 제거하여 수집 (기본 근육명으로 정규화)
    const muscleSet = new Set<string>();
    // 단독으로 나타나면 안 되는 부위 수식어들
    const invalidMuscles = ['상부', '중부', '하부', '전면', '중면', '후면', '장두', '단두', '전체'];

    filteredExercises.forEach(exercise => {
      exercise.primaryMuscles.split(',').forEach(muscle => {
        const trimmed = muscle.trim();
        if (!trimmed) return;

        // "이두근 단두" → "이두근", "삼두근 장두" → "삼두근" 등 기본 근육명만 추출
        const baseMuscle = trimmed.split(' ')[0];

        // 부위 수식어는 제외
        if (baseMuscle && !invalidMuscles.includes(baseMuscle)) {
          muscleSet.add(baseMuscle);
        }
      });
    });

    return Array.from(muscleSet).join(', ');
  }, [exerciseData, view, selectedDifficulty]);

  if (!bodyPartId) {
    return (
      <div className="bg-gray-700/30 rounded-lg p-6 text-center">
        <p className="text-gray-400">먼저 운동할 부위를 선택해주세요</p>
      </div>
    );
  }

  if (!exerciseData) {
    return (
      <div className="bg-gray-700/30 rounded-lg p-6 text-center">
        <p className="text-gray-400">해당 부위의 운동 데이터를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 부위 정보 */}
      <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg p-4 border border-primary-500/20">
        <h3 className="text-lg font-bold text-white">{exerciseData.koreanName} ({exerciseData.bodyPartName})</h3>
        <p className="text-sm text-gray-400 mt-1">주요 근육: {displayMuscles}</p>
      </div>

      {/* 난이도 선택 탭 */}
      <div className="flex gap-2 bg-gray-700/30 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setSelectedDifficulty('beginner')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
            selectedDifficulty === 'beginner'
              ? 'bg-green-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          초급
        </button>
        <button
          type="button"
          onClick={() => setSelectedDifficulty('intermediate')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
            selectedDifficulty === 'intermediate'
              ? 'bg-yellow-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          중급
        </button>
        <button
          type="button"
          onClick={() => setSelectedDifficulty('advanced')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
            selectedDifficulty === 'advanced'
              ? 'bg-red-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          고급
        </button>
      </div>

      {/* 운동 목록 */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400">
          💡 운동을 클릭하면 상세 정보를 볼 수 있습니다
        </p>
        {currentExercises.map((exercise, index) => {
          const exerciseId = `${bodyPartId}-${selectedDifficulty}-${index}`;
          const isExpanded = expandedExercise === exerciseId;

          return (
            <div
              key={exerciseId}
              className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden"
            >
              {/* 운동명 헤더 */}
              <button
                type="button"
                onClick={() => {
                  setExpandedExercise(isExpanded ? null : exerciseId);
                  // 운동 선택 (임시 ID 사용)
                  onSelectExercise(index + 1, exercise.name);
                }}
                className={`w-full py-3 px-4 text-left transition-all flex items-center justify-between ${
                  selectedExerciseId === index + 1
                    ? 'bg-primary-500/20 border-l-4 border-primary-500'
                    : 'hover:bg-gray-700/30'
                }`}
              >
                <div>
                  <h4 className="font-bold text-white">{exercise.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{exercise.englishName}</p>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 상세 정보 (확장 시) */}
              {isExpanded && (
                <div className="px-4 py-3 bg-gray-900/30 border-t border-gray-700/50 space-y-2">
                  {/* 주요 근육 */}
                  <div>
                    <span className="text-xs font-semibold text-cyan-400">주요 근육:</span>
                    <p className="text-sm text-gray-300">{exercise.primaryMuscles}</p>
                  </div>

                  {/* 보조 근육 */}
                  {exercise.secondaryMuscles && exercise.secondaryMuscles !== '-' && (
                    <div>
                      <span className="text-xs font-semibold text-cyan-400">보조 근육:</span>
                      <p className="text-sm text-gray-300">{exercise.secondaryMuscles}</p>
                    </div>
                  )}

                  {/* 설명 */}
                  <div>
                    <span className="text-xs font-semibold text-cyan-400">설명:</span>
                    <p className="text-sm text-gray-300">{exercise.description}</p>
                  </div>

                  {/* 주의사항 */}
                  <div>
                    <span className="text-xs font-semibold text-yellow-400">⚠️ 주의사항:</span>
                    <p className="text-sm text-gray-300">{exercise.cautions}</p>
                  </div>

                  {/* 추천 세트/횟수 */}
                  <div className="flex gap-4 pt-2 border-t border-gray-700/50">
                    <div>
                      <span className="text-xs font-semibold text-green-400">추천:</span>
                      <p className="text-sm text-white">{exercise.recommendedSets}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-purple-400">기준 무게:</span>
                      <p className="text-sm text-white">{exercise.baseWeight}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 운동 개수 표시 */}
      <div className="text-center text-xs text-gray-500">
        {getDifficultyLabel(selectedDifficulty)} 운동: {currentExercises.length}개
      </div>
    </div>
  );
}
