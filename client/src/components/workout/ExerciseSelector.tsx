interface Exercise {
  id: number;
  code: string;
  nameKo: string;
  nameEn: string;
  category: string;
  difficulty: string;
  description: string;
  thumbnailUrl: string;
  bodyPartName: string;
}

interface ExerciseSelectorProps {
  exercises: Exercise[];
  selectedExerciseId: number | null;
  onSelect: (exerciseId: number) => void;
  isLoading?: boolean;
}

const difficultyColors: Record<string, { bg: string; text: string; label: string }> = {
  beginner: { bg: 'bg-green-500/20', text: 'text-green-400', label: '초급' },
  intermediate: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: '중급' },
  advanced: { bg: 'bg-red-500/20', text: 'text-red-400', label: '고급' },
};

const categoryLabels: Record<string, string> = {
  compound: '복합 운동',
  isolation: '고립 운동',
  core: '코어 운동',
};

const ExerciseSelector = ({
  exercises,
  selectedExerciseId,
  onSelect,
  isLoading = false,
}: ExerciseSelectorProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">이 부위에 등록된 운동이 없습니다.</p>
        <p className="text-sm text-gray-500 mt-2">다른 부위를 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-4">
        운동 선택
        <span className="text-sm text-gray-400 ml-2">({exercises.length}개)</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {exercises.map((exercise) => {
          const selected = exercise.id === selectedExerciseId;
          const difficultyColor = difficultyColors[exercise.difficulty] || difficultyColors.beginner;

          return (
            <button
              key={exercise.id}
              onClick={() => onSelect(exercise.id)}
              className={`
                group relative overflow-hidden rounded-xl transition-all duration-300
                ${
                  selected
                    ? 'bg-gradient-to-br from-primary-500/30 to-purple-500/30 ring-2 ring-primary-500 shadow-xl shadow-primary-500/50'
                    : 'bg-gray-700/30 hover:bg-gray-700/50 hover:shadow-lg'
                }
              `}
            >
              {/* 선택 표시 */}
              {selected && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-primary-500 rounded-full p-1">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}

              <div className="p-5">
                {/* 썸네일 영역 (임시 아이콘) */}
                <div
                  className={`
                  w-full h-32 rounded-lg mb-3 flex items-center justify-center
                  ${selected ? 'bg-primary-500/20' : 'bg-gray-600/30'}
                  group-hover:bg-primary-500/20 transition-colors
                `}
                >
                  <svg
                    className={`w-16 h-16 ${selected ? 'text-primary-400' : 'text-gray-500'} group-hover:text-primary-400 transition-colors`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  </svg>
                </div>

                {/* 운동 이름 */}
                <h4 className="text-lg font-bold text-white mb-2 text-left">{exercise.nameKo}</h4>
                <p className="text-xs text-gray-400 mb-3 text-left">{exercise.nameEn}</p>

                {/* 메타 정보 */}
                <div className="flex items-center gap-2 mb-3">
                  {/* 난이도 */}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${difficultyColor.bg} ${difficultyColor.text}`}
                  >
                    {difficultyColor.label}
                  </span>

                  {/* 카테고리 */}
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-600/50 text-gray-300">
                    {categoryLabels[exercise.category] || exercise.category}
                  </span>
                </div>

                {/* 설명 (첫 줄만) */}
                <p className="text-sm text-gray-400 line-clamp-2 text-left">
                  {exercise.description.split('\n')[0].replace(/\*\*/g, '')}
                </p>
              </div>

              {/* 호버 시 그라데이션 효과 */}
              <div
                className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
                bg-gradient-to-t from-primary-500/10 to-transparent pointer-events-none
              `}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseSelector;
