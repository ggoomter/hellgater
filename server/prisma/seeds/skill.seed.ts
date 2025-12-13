import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding skill data...');

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
    console.error('Chest body part not found. Please seed body parts first.');
    return;
  }

  // Define skills
  const skills = [
    {
      code: 'pushup_basic',
      nameKo: '기본 푸시업',
      nameEn: 'Basic Pushup',
      tier: 'BRONZE',
      bodyPartId: chest.id,
      description: '가슴 근육의 기초를 다지는 운동입니다.',
      treePositionX: 150,
      treePositionY: 50,
      requiredLevel: 1,
      prerequisiteSkillIds: [] as number[],
    },
    {
      code: 'pushup_wide',
      nameKo: '와이드 푸시업',
      nameEn: 'Wide Pushup',
      tier: 'BRONZE',
      bodyPartId: chest.id,
      description: '가슴 바깥쪽을 자극합니다.',
      treePositionX: 80,
      treePositionY: 150,
      requiredLevel: 3,
      prerequisites: ['pushup_basic'],
    },
    {
      code: 'pushup_diamond',
      nameKo: '다이아몬드 푸시업',
      nameEn: 'Diamond Pushup',
      tier: 'SILVER',
      bodyPartId: chest.id,
      description: '가슴 안쪽과 삼두근을 집중 공략합니다.',
      treePositionX: 220,
      treePositionY: 150,
      requiredLevel: 5,
      prerequisites: ['pushup_basic'],
    },
    {
      code: 'bench_press',
      nameKo: '벤치프레스',
      nameEn: 'Bench Press',
      tier: 'GOLD',
      bodyPartId: chest.id,
      description: '상체 근력 운동의 꽃, 벤치프레스입니다.',
      treePositionX: 150,
      treePositionY: 250,
      requiredLevel: 10,
      prerequisites: ['pushup_wide', 'pushup_diamond'],
    },
    {
      code: 'bench_incline',
      nameKo: '인클라인 벤치',
      nameEn: 'Incline Bench Press',
      tier: 'PLATINUM',
      bodyPartId: chest.id,
      description: '윗가슴을 채워주는 필수 운동입니다.',
      treePositionX: 80,
      treePositionY: 350,
      requiredLevel: 15,
      prerequisites: ['bench_press'],
    },
    {
      code: 'bench_decline',
      nameKo: '디클라인 벤치',
      nameEn: 'Decline Bench Press',
      tier: 'PLATINUM',
      bodyPartId: chest.id,
      description: '아랫가슴 라인을 잡아줍니다.',
      treePositionX: 220,
      treePositionY: 350,
      requiredLevel: 15,
      prerequisites: ['bench_press'],
    },
    {
        code: 'pec_deck_fly',
        nameKo: '펙덱 플라이',
        nameEn: 'Pec Deck Fly',
        tier: 'DIAMOND',
        bodyPartId: chest.id,
        description: '가슴 근육의 선명도를 높여줍니다.',
        treePositionX: 150,
        treePositionY: 450,
        requiredLevel: 20,
        prerequisites: ['bench_incline', 'bench_decline'],
    }
  ];

  for (const s of skills) {
    const { prerequisites, ...data } = s;
    
    // Find prerequisite IDs
    let prereqIds: number[] = [];
    if (prerequisites && prerequisites.length > 0) {
      const prereqSkills = await prisma.skill.findMany({
        where: { code: { in: prerequisites } }
      });
      prereqIds = prereqSkills.map(ps => ps.id);
    }

    await prisma.skill.upsert({
      where: { code: data.code },
      update: {
        ...data,
        prerequisiteSkillIds: prereqIds,
      },
      create: {
        ...data,
        prerequisiteSkillIds: prereqIds,
      },
    });
  }

  console.log(`Seeded ${skills.length} skills for Chest`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
