interface Exercise {
  id: number;
  name: string;
  bodyPartId: number;
}

interface ExerciseSelectorProps {
  bodyPartId: number | null;
  selectedExerciseId: number | null;
  onSelectExercise: (exerciseId: number, exerciseName: string) => void;
}

// 임시 운동 데이터 (나중에 API로 교체)
const EXERCISES: Exercise[] = [
  { id: 1, name: '오버헤드 프레스', bodyPartId: 1 }, // 어깨
  { id: 2, name: '벤치프레스', bodyPartId: 2 }, // 가슴
  { id: 3, name: '데드리프트', bodyPartId: 3 }, // 등
  { id: 7, name: '스쿼트', bodyPartId: 7 }, // 다리
];

export default function ExerciseSelector({
  bodyPartId,
  selectedExerciseId,
  onSelectExercise,
}: ExerciseSelectorProps) {
  // 선택된 부위의 운동만 필터링
  const availableExercises = bodyPartId
    ? EXERCISES.filter((ex) => ex.bodyPartId === bodyPartId)
    : [];

  if (!bodyPartId) {
    return (
      <div className="bg-gray-700/30 rounded-lg p-6 text-center">
        <p className="text-gray-400">먼저 운동할 부위를 선택해주세요</p>
      </div>
    );
  }

  if (availableExercises.length === 0) {
    return (
      <div className="bg-gray-700/30 rounded-lg p-6 text-center">
        <p className="text-gray-400">해당 부위의 운동이 아직 등록되지 않았습니다</p>
        <p className="text-xs text-gray-500 mt-2">곧 추가될 예정입니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-base font-semibold text-white">운동 종목</label>
      <div className="grid grid-cols-1 gap-3">
        {availableExercises.map((exercise) => (
          <button
            type="button"
            key={exercise.id}
            onClick={() => onSelectExercise(exercise.id, exercise.name)}
            className={`py-4 px-5 rounded-lg text-base font-semibold text-left transition-all ${
              selectedExerciseId === exercise.id
                ? 'bg-primary-500 text-white ring-2 ring-primary-400 shadow-lg'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {exercise.name}
          </button>
        ))}
      </div>
    </div>
  );
}
