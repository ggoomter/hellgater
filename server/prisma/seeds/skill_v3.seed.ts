import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start cleaning and seeding v3 skill data...');

  // 1. 기존 데이터 정리 (순서 중요: UserSkill -> Skill)
  // 주의: 운영 환경에서는 함부로 삭제하면 안 됨. 현재는 개발/수정 단계이므로 초기화.
  await prisma.userSkill.deleteMany({});
  
  // bodyPartId가 있는 스킬만 지우거나, 전체를 지우거나. 
  // 여기서는 깔끔하게 전체 재설정
  await prisma.skill.deleteMany({});

  console.log('Cleared existing skills.');

  const chest = await prisma.bodyPart.upsert({
    where: { code: 'chest' },
    update: {},
    create: {
      code: 'chest',
      nameKo: '가슴',
      nameEn: 'Chest',
      displayOrder: 1,
    }
  });

  if (!chest) {
    console.error('Chest body part not found.');
    return;
  }

  // --- 1단계: 맨몸 기초 ---
  const pushup = await prisma.skill.create({
    data: {
      code: 'pushup',
      nameKo: '푸시업',
      nameEn: 'Push Up',
      tier: 'BRONZE',
      bodyPartId: chest.id,
      description: '가슴 운동의 가장 기초가 되는 맨몸 운동입니다.',
      treePositionX: 600,
      treePositionY: 100,
      requiredLevel: 1,
      prerequisiteSkillIds: [],
    }
  });

  // --- 2단계: 머신 및 보조 ---
  const dips = await prisma.skill.create({
    data: {
        code: 'dips',
        nameKo: '딥스',
        nameEn: 'Dips',
        tier: 'BRONZE',
        bodyPartId: chest.id,
        description: '아랫가슴과 삼두를 발달시키는 맨몸 운동입니다.',
        treePositionX: 400,
        treePositionY: 250,
        requiredLevel: 5,
        prerequisiteSkillIds: [pushup.id],
    }
  });

  const pecDeckFly = await prisma.skill.create({
      data: {
          code: 'pec_deck_fly',
          nameKo: '펙덱 플라이',
          nameEn: 'Pec Deck Fly',
          tier: 'BRONZE',
          bodyPartId: chest.id,
          description: '머신을 이용해 가슴 안쪽을 안전하게 자극합니다.',
          treePositionX: 800,
          treePositionY: 250,
          requiredLevel: 5,
          prerequisiteSkillIds: [pushup.id],
      }
  });

  // --- 3단계: 프리웨이트 입문 ---
  const dumbbellFly = await prisma.skill.create({
    data: {
        code: 'dumbbell_fly',
        nameKo: '덤벨 플라이',
        nameEn: 'Dumbbell Fly',
        tier: 'SILVER',
        bodyPartId: chest.id,
        description: '덤벨을 사용하여 가동범위를 넓게 가져가는 가슴 운동입니다.',
        treePositionX: 800,
        treePositionY: 400,
        requiredLevel: 10,
        prerequisiteSkillIds: [pecDeckFly.id],
    }
  });

  // --- 4단계: 프리웨이트 핵심 (3대 운동) ---
  const benchPress = await prisma.skill.create({
      data: {
          code: 'bench_press',
          nameKo: '벤치프레스',
          nameEn: 'Bench Press',
          tier: 'GOLD',
          bodyPartId: chest.id,
          description: '상체 운동의 왕, 3대 운동 중 하나입니다.',
          treePositionX: 600,
          treePositionY: 500,
          requiredLevel: 15,
          prerequisiteSkillIds: [dips.id, dumbbellFly.id], // 딥스와 덤벨 플라이를 거쳐 도달
      }
  });

  // --- 5단계: 응용 및 세분화 ---
  const inclineBench = await prisma.skill.create({
      data: {
          code: 'bench_incline',
          nameKo: '인클라인 벤치',
          nameEn: 'Incline Bench',
          tier: 'PLATINUM',
          bodyPartId: chest.id,
          description: '윗가슴을 타겟하여 볼륨감을 완성합니다.',
          treePositionX: 450,
          treePositionY: 650,
          requiredLevel: 20,
          prerequisiteSkillIds: [benchPress.id],
      }
  });

  const declineBench = await prisma.skill.create({
      data: {
          code: 'bench_decline',
          nameKo: '디클라인 벤치',
          nameEn: 'Decline Bench',
          tier: 'PLATINUM',
          bodyPartId: chest.id,
          description: '아랫가슴 라인을 선명하게 만듭니다.',
          treePositionX: 750,
          treePositionY: 650,
          requiredLevel: 20,
          prerequisiteSkillIds: [benchPress.id],
      }
  });

  // --- 6단계: 완성 ---
  const cableCrossover = await prisma.skill.create({
      data: {
          code: 'cable_crossover',
          nameKo: '케이블 크로스오버',
          nameEn: 'Cable Crossover',
          tier: 'DIAMOND',
          bodyPartId: chest.id,
          description: '지속적인 장력으로 가슴의 디테일을 완성합니다.',
          treePositionX: 600,
          treePositionY: 750,
          requiredLevel: 25,
          prerequisiteSkillIds: [inclineBench.id, declineBench.id],
      }
  });

   console.log('Seeded v3 chest skills tree.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
