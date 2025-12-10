import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding curriculum data...');

  // --- Week 0: 운명의 시작 - 바알시불과의 만남 ---
  // Clean up existing Week 0 if needed (optional, or rely on unique constraints/upsert)
  
  const week0 = await prisma.curriculumWeek.upsert({
    where: { weekNumber: 0 },
    update: {
      titleKo: '운명의 시작 - 바알시불과의 만남',
      titleEn: 'Destiny Begins - Meeting Baal-sibul',
      subtitle: '왜 운동을 해야 하는가?',
      description: '운동은 선택이 아닌 생존 전략입니다. 바알시불과 함께 헬게이트 탈출을 위한 여정을 시작하세요.',
      phase: 1,
      chapter: 1,
      attributeType: null, // No specific attribute yet
      learningGoals: [
        '운동을 해야 하는 근본적인 이유 이해',
        '자신의 현재 체력과 상태 파악',
        '25주간의 여정에 대한 동기 부여'
      ],
      estimatedTime: 45,
      difficulty: 'beginner',
      isPublished: true,
      storyScript: '태초, 헬게이트 깊은 곳에서... 한 작은 생명이 태어났다. 그의 이름은 바알시불...',
      characterArcStage: '탄생',
    },
    create: {
      weekNumber: 0,
      titleKo: '운명의 시작 - 바알시불과의 만남',
      titleEn: 'Destiny Begins - Meeting Baal-sibul',
      subtitle: '왜 운동을 해야 하는가?',
      description: '운동은 선택이 아닌 생존 전략입니다. 바알시불과 함께 헬게이트 탈출을 위한 여정을 시작하세요.',
      phase: 1,
      chapter: 1,
      attributeType: null,
      learningGoals: [
        '운동을 해야 하는 근본적인 이유 이해',
        '자신의 현재 체력과 상태 파악',
        '25주간의 여정에 대한 동기 부여'
      ],
      estimatedTime: 45,
      difficulty: 'beginner',
      isPublished: true,
      storyScript: '태초, 헬게이트 깊은 곳에서... 한 작은 생명이 태어났다. 그의 이름은 바알시불...',
      characterArcStage: '탄생',
    },
  });

  console.log(`Created/Updated Week 0: ${week0.titleKo}`);

  // Week 0 Content Modules
  const week0Modules = [
    {
      displayOrder: 1,
      moduleType: 'cinematic_video',
      titleKo: '어둠 속의 탄생',
      titleEn: 'Birth in Darkness',
      description: '바알시불과의 첫 만남과 현자의 조언',
      contentData: {
        duration: 180, // 3 mins
        hasSubtitles: true,
        youtubeId: 'placeholder_w0_m1', // Placeholder
      },
      expReward: 200,
      estimatedTime: 5,
      requiresCompletion: true,
    },
    {
      displayOrder: 2,
      moduleType: 'quiz',
      titleKo: '목표 설정 퀴즈',
      titleEn: 'Goal Setting Quiz',
      description: '당신의 운동 목표와 현재 상태를 알려주세요',
      contentData: {
        questions: [
          {
            id: 'q1',
            text: '당신의 주요 목표는 무엇인가요?',
            options: ['체중 감량', '근육 증가', '체력 향상', '체형 개선'],
            type: 'single_choice'
          },
          {
            id: 'q2',
            text: '현재 운동 경험은?',
            options: ['전혀 없음', '3개월 미만', '3-12개월', '1년 이상'],
            type: 'single_choice'
          }
        ]
      },
      expReward: 300,
      estimatedTime: 5,
      isInteractive: true,
      hasQuiz: true,
      requiresCompletion: true,
    },
    {
      displayOrder: 3,
      moduleType: 'workout_assignment',
      titleKo: '현재 상태 자가 진단',
      titleEn: 'Self-Diagnosis',
      description: '푸시업, 플랭크, 스쿼트로 현재 체력을 측정해보세요',
      contentData: {
        exercises: ['pushup', 'plank', 'squat'],
        guideVideoUrl: 'placeholder_w0_m3_guide',
      },
      expReward: 200,
      estimatedTime: 10,
      requiresCompletion: true,
    },
    {
      displayOrder: 4,
      moduleType: 'lecture_video',
      titleKo: '운동의 필요성: 근감소증의 공포',
      titleEn: 'Why Workout: Fear of Sarcopenia',
      description: '30세부터 시작되는 근육 손실과 그 위험성',
      contentData: {
        duration: 300, // 5 mins
        youtubeId: 'placeholder_w0_m4',
      },
      expReward: 200,
      estimatedTime: 5,
      requiresCompletion: true,
    },
    {
      displayOrder: 5,
      moduleType: 'assignment',
      titleKo: 'Before 사진 촬영 & 인바디',
      titleEn: 'Before Photo & InBody',
      description: '변화의 시작을 기록하세요. 사진과 인바디 데이터는 당신만의 비밀입니다.',
      contentData: {
        requirements: ['photo_front', 'photo_side', 'photo_back', 'inbody_data'],
      },
      expReward: 500 + 300, // Photo + Inbody
      estimatedTime: 15,
      requiresCompletion: true,
    },
  ];

  for (const module of week0Modules) {
    // Delete existing to update strictly by order if needed, but for seed we can upsert by a unique key if we had one.
    // ContentModule doesn't have a unique code, so we might duplicate if we just create.
    // Ideally we clear modules for the week first.
    await prisma.contentModule.deleteMany({
      where: {
        weekId: week0.id,
        displayOrder: module.displayOrder
      }
    });

    await prisma.contentModule.create({
      data: {
        weekId: week0.id,
        ...module
      }
    });
  }
  console.log(`Seeded ${week0Modules.length} modules for Week 0`);


  // --- Week 1: 몸을 알다 - 측정의 중요성 ---
  const week1 = await prisma.curriculumWeek.upsert({
    where: { weekNumber: 1 },
    update: {
      titleKo: '몸을 알다 - 측정의 중요성',
      titleEn: 'Know Your Body - Importance of Measurement',
      subtitle: '측정하지 않으면 개선할 수 없다',
      description: '체중이 아닌 체성분에 집중하세요. 인바디 데이터를 해석하고 현실적인 목표를 세우는 방법을 배웁니다.',
      phase: 1,
      chapter: 1,
      attributeType: 'earth', // Earth attribute for foundation/body
      learningGoals: [
        '인바디 주요 지표 5가지 이해',
        '체중 vs 체성분 차이 인식',
        '기초대사량(BMR) 개념 이해',
        '목표 체중/체지방률 설정'
      ],
      estimatedTime: 50,
      difficulty: 'beginner',
      isPublished: true,
      storyScript: '바알시불: "왜 안 되는 거지? 😢"... 현자: "측정하지 않으면, 개선할 수 없다네."',
      characterArcStage: '성장',
    },
    create: {
      weekNumber: 1,
      titleKo: '몸을 알다 - 측정의 중요성',
      titleEn: 'Know Your Body - Importance of Measurement',
      subtitle: '측정하지 않으면 개선할 수 없다',
      description: '체중이 아닌 체성분에 집중하세요. 인바디 데이터를 해석하고 현실적인 목표를 세우는 방법을 배웁니다.',
      phase: 1,
      chapter: 1,
      attributeType: 'earth',
      learningGoals: [
        '인바디 주요 지표 5가지 이해',
        '체중 vs 체성분 차이 인식',
        '기초대사량(BMR) 개념 이해',
        '목표 체중/체지방률 설정'
      ],
      estimatedTime: 50,
      difficulty: 'beginner',
      isPublished: true,
      storyScript: '바알시불: "왜 안 되는 거지? 😢"... 현자: "측정하지 않으면, 개선할 수 없다네."',
      characterArcStage: '성장',
    },
  });

  console.log(`Created/Updated Week 1: ${week1.titleKo}`);

  const week1Modules = [
    {
      displayOrder: 1,
      moduleType: 'cinematic_video',
      titleKo: '무작정 운동하는 바알시불',
      titleEn: 'Baal-sibul Training Blindly',
      description: '측정 없이 노력만 하는 바알시불의 좌절',
      contentData: {
        duration: 120, // 2 min
        youtubeId: 'placeholder_w1_m1',
      },
      expReward: 100,
      estimatedTime: 3,
      requiresCompletion: true,
    },
    {
      displayOrder: 2,
      moduleType: 'lecture_video',
      titleKo: '인바디 지표 완벽 해석',
      titleEn: 'InBody Analysis 101',
      description: '체중, 체지방률, 골격근량, 기초대사량의 의미',
      contentData: {
        duration: 480, // 8 mins
        youtubeId: 'placeholder_w1_m2',
      },
      expReward: 400,
      estimatedTime: 10,
      requiresCompletion: true,
    },
    {
      displayOrder: 3,
      moduleType: 'simulation',
      titleKo: '인터랙티브 인바디 시뮬레이터',
      titleEn: 'InBody Simulator',
      description: '나의 체성분 상태를 시각적으로 확인해보세요',
      contentData: {
        type: 'inbody_sim',
        interactive: true
      },
      expReward: 200,
      estimatedTime: 5,
      isInteractive: true,
      requiresCompletion: true,
    },
     {
      displayOrder: 4,
      moduleType: 'lecture_video',
      titleKo: 'Before 사진 촬영 완벽 가이드',
      titleEn: 'Perfect Before Photo Guide',
      description: '정확한 비교를 위한 사진 촬영 방법',
      contentData: {
        duration: 300, // 5 mins
        youtubeId: 'placeholder_w1_m4',
      },
      expReward: 100,
      estimatedTime: 5,
      requiresCompletion: true,
    },
    {
      displayOrder: 5,
      moduleType: 'assignment',
      titleKo: '실습: 인바디 및 사진 업로드',
      titleEn: 'Assignment: Upload Data',
      description: '0주차에 하지 못했다면 지금 완료하세요! (이미 했다면 패스)',
      contentData: {
        check: ['inbody', 'photo']
      },
      expReward: 500, // Already rewarded in week 0, but maybe bonus or recap
      estimatedTime: 5,
      requiresCompletion: true,
    },
    {
      displayOrder: 6,
      moduleType: 'assignment',
      titleKo: '목표 체성분 설정',
      titleEn: 'Set Body Composition Goals',
      description: '3개월 후 도달하고 싶은 구체적인 수치를 정합니다',
      contentData: {
        goalType: 'body_composition'
      },
      expReward: 300,
      estimatedTime: 10,
      requiresCompletion: true,
    }
  ];

  for (const module of week1Modules) {
    await prisma.contentModule.deleteMany({
      where: {
        weekId: week1.id,
        displayOrder: module.displayOrder
      }
    });

    await prisma.contentModule.create({
      data: {
        weekId: week1.id,
        ...module
      }
    });
  }
  console.log(`Seeded ${week1Modules.length} modules for Week 1`);

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
