import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateWorkoutRecord, useCalculate1RM, useEstimateExp } from '../hooks/useWorkout';
import { useAvailableLevelTests } from '../hooks/useLevelTest';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

const WorkoutRecord = () => {
  const navigate = useNavigate();
  const createWorkout = useCreateWorkoutRecord();
  const { calculate } = useCalculate1RM();
  const { estimate } = useEstimateExp();
  const { data: availableLevelTests } = useAvailableLevelTests();

  // Form state
  const [formData, setFormData] = useState({
    exerciseId: 2, // 벤치프레스 (임시)
    sets: 3,
    reps: 10,
    weight: 60,
    notes: '',
  });

  // Preview state
  const [preview, setPreview] = useState({
    oneRM: 0,
    estimatedExp: 0,
  });

  // Calculate preview whenever form data changes
  useEffect(() => {
    const oneRM = calculate(formData.weight, formData.reps);
    const estimatedExp = estimate(formData.sets, formData.reps, formData.weight, 5);

    setPreview({
      oneRM,
      estimatedExp,
    });
  }, [formData.weight, formData.reps, formData.sets, calculate, estimate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createWorkout.mutateAsync({
        exerciseId: formData.exerciseId,
        bodyPart: '가슴', // 임시
        sets: formData.sets,
        reps: formData.reps,
        weight: formData.weight,
        workoutDate: new Date().toISOString().split('T')[0],
        notes: formData.notes || undefined,
      });

      console.log('✅ Workout created:', result);

      // 레벨테스트 가능 알림
      if (result.levelTestAvailable) {
        alert(
          `🎉 ${result.levelTestAvailable.bodyPartName} 레벨 ${result.levelTestAvailable.currentLevel} → ${result.levelTestAvailable.targetLevel} 레벨테스트 도전 가능!`
        );
      }

      // 성공 후 홈으로 이동
      navigate('/');
    } catch (error: any) {
      console.error('❌ Failed to create workout:', error);
      alert(error.response?.data?.message || '운동 기록 생성에 실패했습니다.');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">운동 기록</h1>
          <p className="text-gray-400">오늘의 운동을 기록하고 경험치를 획득하세요!</p>
        </div>

        {/* Level Test Available Alert */}
        {availableLevelTests && availableLevelTests.available.length > 0 && (
          <Card variant="glass" className="mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <div className="p-4">
              <h3 className="text-lg font-bold text-yellow-300 mb-2">🔔 레벨테스트 가능!</h3>
              {availableLevelTests.available.map((test) => (
                <div key={test.bodyPartId} className="text-white">
                  <span className="font-semibold">{test.bodyPartName}</span>: Lv.{test.currentLevel} → Lv.
                  {test.targetLevel}
                  <span className="text-sm text-gray-300 ml-2">
                    ({test.currentExp}/{test.requiredExp} EXP)
                  </span>
                </div>
              ))}
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={() => navigate('/level-test')}
              >
                레벨테스트 하러 가기 →
              </Button>
            </div>
          </Card>
        )}

        {/* Workout Form */}
        <Card variant="glass" className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">운동 정보 입력</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Exercise Selection (임시로 고정) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">운동 종목</label>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-white">벤치프레스 (가슴)</p>
                  <p className="text-xs text-gray-400 mt-1">
                    * 실제 앱에서는 부위와 운동을 선택할 수 있습니다
                  </p>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">무게 (kg)</label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', Number(e.target.value))}
                  min="0"
                  step="0.5"
                  required
                  placeholder="60"
                />
              </div>

              {/* Reps */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">반복 횟수</label>
                <Input
                  type="number"
                  value={formData.reps}
                  onChange={(e) => handleChange('reps', Number(e.target.value))}
                  min="1"
                  max="100"
                  required
                  placeholder="10"
                />
              </div>

              {/* Sets */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">세트 수</label>
                <Input
                  type="number"
                  value={formData.sets}
                  onChange={(e) => handleChange('sets', Number(e.target.value))}
                  min="1"
                  max="20"
                  required
                  placeholder="3"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">메모 (선택)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  rows={3}
                  placeholder="오늘의 운동 느낌을 기록해보세요..."
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={createWorkout.isPending}
              >
                {createWorkout.isPending ? '기록 중...' : '운동 기록 저장'}
              </Button>
            </form>
          </div>
        </Card>

        {/* Preview Card */}
        <Card variant="glass" className="bg-gradient-to-br from-primary-500/10 to-purple-500/10">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">📊 예상 결과</h2>

            <div className="grid grid-cols-2 gap-4">
              {/* 1RM */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">예상 1RM</p>
                <p className="text-2xl font-bold text-primary-400">{preview.oneRM.toFixed(1)} kg</p>
              </div>

              {/* Exp */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">예상 경험치</p>
                <p className="text-2xl font-bold text-yellow-400">+{preview.estimatedExp} EXP</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-700/20 rounded-lg">
              <p className="text-xs text-gray-400">
                💡 실제 획득 경험치는 현재 레벨, 등급, PR 여부에 따라 달라질 수 있습니다.
              </p>
            </div>
          </div>
        </Card>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutRecord;
