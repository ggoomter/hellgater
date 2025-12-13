import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding simplified skill data...');

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

  // Clear existing skills for clean slate (optional, be careful in prod)
  // await prisma.userSkill.deleteMany({});
  // await prisma.skill.deleteMany({ where: { bodyPartId: chest.id } });

  // 1. 맨몸 운동 (Level 1~5)
  // 푸시업 -> 니 푸시업(삭제) / 인클라인 푸시업
  // 여기서는 '푸시업'을 루트로 잡습니다.
  
  const skillPushUp = await prisma.skill.upsert({
    where: { code: 'pushup_normal' },
    update: {
      treePositionX: 600, // 중앙 상단
      treePositionY: 100,
    },
    create: {
      code: 'pushup_normal',
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

  // 2. 머신/변형 운동 (Level 5~10)
  // 푸시업 -> 딥스 
  const skillDips = await prisma.skill.upsert({
    where: { code: 'dips' },
    update: {
        treePositionX: 450,
        treePositionY: 250,
        prerequisiteSkillIds: [skillPushUp.id]
    },
    create: {
        code: 'dips',
        nameKo: '딥스',
        nameEn: 'Dips',
        tier: 'BRONZE',
        bodyPartId: chest.id,
        description: '아랫가슴과 삼두를 발달시키는 맨몸 운동입니다.',
        treePositionX: 450,
        treePositionY: 250,
        requiredLevel: 5,
        prerequisiteSkillIds: [skillPushUp.id],
    }
  });

  // 푸시업 -> 펙덱 플라이 (머신)
  const skillPecDeck = await prisma.skill.upsert({
      where: { code: 'pec_deck_fly' },
      update: {
          treePositionX: 750,
          treePositionY: 250,
          prerequisiteSkillIds: [skillPushUp.id]
      },
      create: {
          code: 'pec_deck_fly',
          nameKo: '펙덱 플라이',
          nameEn: 'Pec Deck Fly',
          tier: 'BRONZE',
          bodyPartId: chest.id,
          description: '머신을 이용해 가슴 안쪽을 안전하게 자극합니다.',
          treePositionX: 750,
          treePositionY: 250,
          requiredLevel: 5,
          prerequisiteSkillIds: [skillPushUp.id],
      }
  });

  // 3. 프리웨이트 기초 (Level 10~20)
  // 펙덱 플라이 -> 덤벨 플라이
  const skillDumbbellFly = await prisma.skill.upsert({
    where: { code: 'dumbbell_fly' },
    update: {
        treePositionX: 750,
        treePositionY: 400,
        prerequisiteSkillIds: [skillPecDeck.id]
    },
    create: {
        code: 'dumbbell_fly',
        nameKo: '덤벨 플라이',
        nameEn: 'Dumbbell Fly',
        tier: 'SILVER',
        bodyPartId: chest.id,
        description: '덤벨을 사용하여 가동범위를 넓게 가져가는 가슴 운동입니다.',
        treePositionX: 750,
        treePositionY: 400,
        requiredLevel: 10,
        prerequisiteSkillIds: [skillPecDeck.id],
    }
  });

  // 4. 프리웨이트 핵심 (Level 15~)
  // 딥스 + 덤벨 플라이 -> 벤치프레스 
  // (실제로는 푸시업만 해도 넘어가지만 게임적 허용으로 조건을 강화)
  const skillBenchPress = await prisma.skill.upsert({
      where: { code: 'bench_press' },
      update: {
          treePositionX: 600,
          treePositionY: 550,
          prerequisiteSkillIds: [skillDips.id, skillDumbbellFly.id]
      },
      create: {
          code: 'bench_press',
          nameKo: '벤치프레스',
          nameEn: 'Bench Press',
          tier: 'GOLD',
          bodyPartId: chest.id,
          description: '상체 운동의 왕, 3대 운동 중 하나입니다.',
          treePositionX: 600,
          treePositionY: 550,
          requiredLevel: 15,
          prerequisiteSkillIds: [skillDips.id, skillDumbbellFly.id],
      }
  });

  // 5. 상급자용 (Level 25~)
  // 벤치프레스 -> 인클라인 벤치프레스
  const skillInclineBench = await prisma.skill.upsert({
      where: { code: 'bench_incline' },
      update: {
          treePositionX: 500,
          treePositionY: 700,
          prerequisiteSkillIds: [skillBenchPress.id]
      },
      create: {
          code: 'bench_incline',
          nameKo: '인클라인 벤치',
          nameEn: 'Incline Bench',
          tier: 'DIAMOND',
          bodyPartId: chest.id,
          description: '윗가슴을 타겟하여 볼륨감을 완성합니다.',
          treePositionX: 500,
          treePositionY: 700,
          requiredLevel: 25,
          prerequisiteSkillIds: [skillBenchPress.id],
      }
  });

  // 벤치프레스 -> 케이블 크로스 오버
  const skillCableCross = await prisma.skill.upsert({
      where: { code: 'cable_crossover' },
      update: {
          treePositionX: 700,
          treePositionY: 700,
          prerequisiteSkillIds: [skillBenchPress.id]
      },
      create: {
          code: 'cable_crossover',
          nameKo: '케이블 크로스오버',
          nameEn: 'Cable Crossover',
          tier: 'DIAMOND',
          bodyPartId: chest.id,
          description: '케이블의 지속적인 장력을 이용해 가슴 하부와 중앙을 타격합니다.',
          treePositionX: 700,
          treePositionY: 700,
          requiredLevel: 25,
          prerequisiteSkillIds: [skillBenchPress.id],
      }
  });

   console.log('Seeded simplified chest skills tree.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
