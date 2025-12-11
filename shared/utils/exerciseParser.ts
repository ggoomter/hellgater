/**
 * 마크다운 운동 파일 파서
 * docs/exercises/*.md 파일을 읽어 구조화된 데이터로 변환
 */

export interface Exercise {
  name: string; // 한글 이름
  englishName: string; // 영문 이름
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // 난이도
  view: 'front' | 'back' | 'both'; // 앞면/뒷면/양쪽
  primaryMuscles: string; // 주요 근육
  secondaryMuscles: string; // 보조 근육
  description: string; // 설명
  cautions: string; // 주의사항
  recommendedSets: string; // 추천 세트/횟수
  baseWeight: string; // 기준 무게
}

export interface BodyPartExercises {
  bodyPartId: number;
  bodyPartName: string;
  koreanName: string;
  primaryMuscles: string;
  exercises: {
    beginner: Exercise[];
    intermediate: Exercise[];
    advanced: Exercise[];
  };
}

/**
 * 마크다운 텍스트를 파싱하여 운동 데이터로 변환
 */
export function parseExerciseMarkdown(markdown: string): BodyPartExercises {
  const lines = markdown.split('\n');

  // 메타 정보 추출
  let bodyPartId = 0;
  let bodyPartName = '';
  let koreanName = '';
  let primaryMuscles = '';

  // 운동 데이터
  const exercises: BodyPartExercises['exercises'] = {
    beginner: [],
    intermediate: [],
    advanced: [],
  };

  let currentDifficulty: 'beginner' | 'intermediate' | 'advanced' | null = null;
  let currentExercise: Partial<Exercise> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // H1: 부위명
    if (line.startsWith('# ')) {
      const match = line.match(/# (.+) \((.+)\)/);
      if (match) {
        koreanName = match[1];
        bodyPartName = match[2];
      }
      continue;
    }

    // 부위 ID
    if (line.startsWith('부위 ID:')) {
      bodyPartId = parseInt(line.replace('부위 ID:', '').trim());
      continue;
    }

    // 주요 근육
    if (line.startsWith('주요 근육:')) {
      primaryMuscles = line.replace('주요 근육:', '').trim();
      continue;
    }

    // H2: 난이도
    if (line.startsWith('## 난이도:')) {
      const difficultyText = line.replace('## 난이도:', '').trim();
      // 괄호가 있으면 괄호 앞부분만 추출 (예: "초급 (앞면 - 이두근)" → "초급")
      const difficulty = difficultyText.split('(')[0].trim();
      if (difficulty === '초급') currentDifficulty = 'beginner';
      else if (difficulty === '중급') currentDifficulty = 'intermediate';
      else if (difficulty === '고급') currentDifficulty = 'advanced';
      continue;
    }

    // H3: 운동명
    if (line.startsWith('### ')) {
      // 이전 운동 저장
      if (currentExercise && currentDifficulty && currentExercise.name) {
        exercises[currentDifficulty].push(currentExercise as Exercise);
      }

      // 새 운동 시작
      const match = line.match(/### (.+) \((.+)\)/);
      if (match) {
        currentExercise = {
          name: match[1],
          englishName: match[2],
          difficulty: currentDifficulty || 'beginner',
          view: 'both', // 기본값
          primaryMuscles: '',
          secondaryMuscles: '',
          description: '',
          cautions: '',
          recommendedSets: '',
          baseWeight: '',
        };
      }
      continue;
    }

    // 운동 상세 정보
    if (currentExercise && line.startsWith('- **')) {
      if (line.includes('**view**:')) {
        const viewValue = line.replace(/- \*\*view\*\*:/, '').trim();
        if (viewValue === 'front' || viewValue === 'back' || viewValue === 'both') {
          currentExercise.view = viewValue;
        }
      } else if (line.includes('**주요 근육**:')) {
        currentExercise.primaryMuscles = line.replace(/- \*\*주요 근육\*\*:/, '').trim();
      } else if (line.includes('**보조 근육**:')) {
        currentExercise.secondaryMuscles = line.replace(/- \*\*보조 근육\*\*:/, '').trim();
      } else if (line.includes('**설명**:')) {
        currentExercise.description = line.replace(/- \*\*설명\*\*:/, '').trim();
      } else if (line.includes('**주의사항**:')) {
        currentExercise.cautions = line.replace(/- \*\*주의사항\*\*:/, '').trim();
      } else if (line.includes('**추천 세트/횟수**:')) {
        currentExercise.recommendedSets = line.replace(/- \*\*추천 세트\/횟수\*\*:/, '').trim();
      } else if (line.includes('**기준 무게')) {
        currentExercise.baseWeight = line.replace(/- \*\*기준 무게[^:]*\*\*:/, '').trim();
      }
    }
  }

  // 마지막 운동 저장
  if (currentExercise && currentDifficulty && currentExercise.name) {
    exercises[currentDifficulty].push(currentExercise as Exercise);
  }

  return {
    bodyPartId,
    bodyPartName,
    koreanName,
    primaryMuscles,
    exercises,
  };
}

/**
 * 난이도를 한글로 변환
 */
export function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급',
  };
  return labels[difficulty] || difficulty;
}

/**
 * 난이도 색상 반환
 */
export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    beginner: 'text-green-400',
    intermediate: 'text-yellow-400',
    advanced: 'text-red-400',
  };
  return colors[difficulty] || 'text-gray-400';
}
