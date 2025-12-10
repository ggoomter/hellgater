import { useState, useCallback } from 'react';
import { curriculumApi } from '../services/api/curriculum.api';

// Define types locally or import if available
interface ContentModule {
  id: string;
  weekId: number;
  displayOrder: number;
  moduleType: string;
  titleKo: string;
  titleEn: string;
  description?: string;
  contentData: any;
  videoUrl?: string;
  thumbnailUrl?: string;
  imageUrls: string[];
  audioUrl?: string;
  isInteractive: boolean;
  hasQuiz: boolean;
  requiresCompletion: boolean;
  expReward: number;
  estimatedTime?: number;
  isCompleted?: boolean; // Front-end helper
}

interface WeekProgress {
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  totalModules: number;
  completedModules: number;
  progressPercent: number;
  totalScore: number;
  maxScore: number;
}

export const useCurriculum = (weekNumber: number) => {
  const [modules, setModules] = useState<ContentModule[]>([]);
  const [weekProgress, setWeekProgress] = useState<WeekProgress>({
    status: 'locked',
    totalModules: 0,
    completedModules: 0,
    progressPercent: 0,
    totalScore: 0,
    maxScore: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeekData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const weekRes = await curriculumApi.getWeekByNumber(weekNumber);
      if (weekRes.success) {
        // We might get modules in weekRes or separate call
        // The API getWeekByNumber includes contentModules
        const weekData = weekRes.data;
        let fetchedModules = weekData.contentModules || [];

        // Also fetch progress to check completion status
        const progressRes = await curriculumApi.getWeekProgress(weekNumber);
        if (progressRes.success) {
           const progress = progressRes.data;
           setWeekProgress(progress);
           
           // We need to know which modules are completed.
           // The API might not return user-specific completion in module list unless tailored.
           // Or we fetch completions?
           // The current API design in controller:
           // `getWeekProgress` returns `UserCurriculumProgress`.
           // `getWeekByNumber` returns `CurriculumWeek` with modules.
           // Neither seems to return "isCompleted" per module for the user.
           // We might need to fetch `getAllWeeks` style or maybe `UserContentCompletion` records?
           // Or maybe `getWeekProgress` should include module completion status?
           // The `getUserProgress` returns list of weeks.
           
           // If the backend doesn't support "isCompleted" on modules list, we might have an issue.
           // Let's assume for now we might need to update backend or hack it.
           // But since I verified backend controller `curriculumController`, let's double check `getWeekByNumber`.
           
           // It returns `await prisma.curriculumWeek.findUnique({ include: { contentModules: ... } })`.
           // It does NOT include user-specific completion data.
           // This is a common issue.
           // The `getWeekProgress` includes `week` but not module completions.
           
           // Wait, `UserContentCompletion` tracks module completions.
           // There is no endpoint to get "all completions for a week".
           // But `completeModule` returns completion.
           
           // I should probably add an endpoint or fetch completions separately.
           // Or update `getWeekByNumber` to take userId and include completions.
           // But `getWeekByNumber` is generic.
           
           // For now, I will keep `isCompleted` false or try to fetch it if possible.
           // Wait, `getUserProgress`? No.
           
           // I'll proceed without `isCompleted` marked for now, or maybe the `progress.completedModules` count allows us to assume first N are completed if sequential?
           // Yes, `Week0Page` logic: `locked: weekProgress.status === 'locked' || index > weekProgress.completedModules`.
           // And `completed: module.isCompleted`.
           
           // If the modules must be completed in order, then `index < completedModules` implies completed.
           // `index === completedModules` implies current.
           // So I can simulate `isCompleted`.
           
           fetchedModules = fetchedModules.map((m: any, idx: number) => ({
             ...m,
             isCompleted: idx < progress.completedModules
           }));
        }
        
        setModules(fetchedModules);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || '데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [weekNumber]);

  const startWeek = useCallback(async () => {
    setLoading(true);
    try {
      const res = await curriculumApi.startWeek(weekNumber);
      if (res.success) {
        setWeekProgress(res.data);
         // Refresh data
        await fetchWeekData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '주차 시작에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [weekNumber, fetchWeekData]);

  return {
    modules,
    weekProgress,
    loading,
    error,
    fetchWeekData,
    startWeek,
  };
};
