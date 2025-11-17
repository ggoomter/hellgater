# HELLGATER - Development Plan

**Version**: 1.0
**Last Updated**: 2025-01-17
**Follows**: TDD & Tidy First Principles
**Based on**: PRD v1.0

---

## Table of Contents

1. [Development Strategy](#1-development-strategy)
2. [Phase 1: MVP - Workout Recording Core](#2-phase-1-mvp---workout-recording-core)
3. [TDD Implementation Order](#3-tdd-implementation-order)
4. [Current Sprint: Anaerobic Workout Recording](#4-current-sprint-anaerobic-workout-recording)
5. [Definition of Done](#5-definition-of-done)
6. [Next Phases Overview](#6-next-phases-overview)

---

## 1. Development Strategy

### 1.1 Core Principles

**TDD First**
- ✅ Write failing test (Red)
- ✅ Write minimal code to pass (Green)
- ✅ Refactor for quality (Refactor)
- ✅ Commit after each cycle

**Tidy First**
- ✅ Structural changes before behavioral changes
- ✅ Never mix refactoring with new features
- ✅ Clear commit messages indicating change type

**Vertical Slicing**
- Build one feature end-to-end before moving to next
- Each slice: DB → Service → Controller → API → Frontend
- Each slice is deployable and testable

### 1.2 Priority Order

**P0 (Critical - Current Sprint)**:
1. **Anaerobic Workout Recording** - 무산소 운동 기록
   - 1RM calculation
   - Grade evaluation
   - EXP calculation
   - Level-up system
   - Workout API

**P1 (High - Week 2-3)**:
2. Authentication & User Management
3. Character Creation
4. Workout History & Stats

**P2 (Medium - Week 4-6)**:
5. Skill Tree System
6. Map Exploration
7. Daily Quests

**P3 (Low - Phase 2+)**:
8. Community Features
9. Leaderboards
10. Premium Features

### 1.3 Tech Stack Confirmation

**Backend**:
- Node.js 20 + TypeScript
- Express.js
- Prisma ORM + PostgreSQL
- Jest for testing

**Frontend**:
- React 18 + TypeScript
- Vite
- Redux Toolkit + React Query
- Vitest for testing

**Development**:
- Docker Compose (primary)
- ESLint + Prettier
- Git conventional commits

---

## 2. Phase 1: MVP - Workout Recording Core

**Duration**: 6 weeks
**Goal**: Launch core anaerobic workout tracking with gamification

### Week 1-2: Anaerobic Workout Recording (CURRENT)

**Sprint Goal**: User can record workout and gain EXP/level-up

#### Day 1-2: Game Engine - Calculation Logic
- ✅ 1RM calculation (Epley formula)
- ✅ RM percentage table
- ✅ Grade evaluation (bodyweight-based)
- ✅ EXP calculation (base + multiplier)
- ✅ Calorie calculation

#### Day 3-4: Game Engine - Leveling System
- ✅ Level-up threshold calculation
- ✅ EXP distribution (80% body part, 20% total)
- ✅ Multiple level-up handling
- ✅ Overflow EXP carry-over

#### Day 5-6: Database Schema
- ✅ Prisma schema for workout recording
- ✅ Migration scripts
- ✅ Seed data (exercises, body parts)

#### Day 7-8: API Implementation
- ✅ POST /workouts endpoint
- ✅ GET /workouts endpoint
- ✅ GET /exercises endpoint
- ✅ Integration tests

#### Day 9-10: Frontend Components
- ✅ Workout recorder UI
- ✅ Exercise selector
- ✅ Weight/reps/sets input
- ✅ Result display (EXP, level-up)

---

### Week 3-4: Authentication & User System

#### Day 1-3: Auth Backend
- ✅ User registration (email + password)
- ✅ Login with JWT
- ✅ Refresh token flow
- ✅ Auth middleware

#### Day 4-5: Character System
- ✅ Character creation
- ✅ Body parts initialization
- ✅ Stats tracking
- ✅ Profile API

#### Day 6-7: Frontend Auth
- ✅ Login/Register pages
- ✅ Character creation flow
- ✅ Protected routes
- ✅ Token management

---

### Week 5-6: Polish & Deploy

#### Day 1-3: Workout History
- ✅ Workout list view
- ✅ Workout detail view
- ✅ Delete workout
- ✅ Stats summary

#### Day 4-5: Testing & Bug Fixes
- ✅ E2E test: Complete onboarding flow
- ✅ E2E test: Record workout → Level up
- ✅ Performance testing
- ✅ Bug fixes

#### Day 6-7: Deployment
- ✅ Docker production config
- ✅ Environment setup
- ✅ CI/CD pipeline
- ✅ Beta deployment

---

## 3. TDD Implementation Order

### Layer-by-Layer TDD

**Bottom-Up Approach** (most stable → least stable):

```
1. Pure Functions (Utils)
   ├── 1RM calculation
   ├── RM percentage lookup
   ├── Grade evaluation
   └── EXP formula

2. Business Logic (Services)
   ├── Game Engine
   ├── RM Analysis
   └── Level System

3. Data Layer (Repositories)
   ├── Prisma queries
   └── Transaction handling

4. API Layer (Controllers)
   ├── Request validation
   ├── Response formatting
   └── Error handling

5. Integration Layer (Routes)
   └── End-to-end API tests

6. UI Layer (Components)
   └── Component tests
```

### TDD Cycle Example

**Feature**: 1RM Calculation

**Red Phase**:
```typescript
// server/src/services/rmAnalysis/__tests__/RMCalculator.test.ts
describe('RMCalculator', () => {
  describe('calculate1RM', () => {
    test('should calculate 1RM using Epley formula', () => {
      const calculator = new RMCalculator();
      const result = calculator.calculate1RM(60, 10);
      expect(result).toBeCloseTo(75, 1);
    });
  });
});
```
❌ Test fails: `RMCalculator is not defined`

**Green Phase**:
```typescript
// server/src/services/rmAnalysis/RMCalculator.ts
export class RMCalculator {
  calculate1RM(weight: number, reps: number): number {
    return weight + (weight * 0.025 * reps);
  }
}
```
✅ Test passes

**Refactor Phase**:
```typescript
// server/src/services/rmAnalysis/RMCalculator.ts
export class RMCalculator {
  private static readonly EPLEY_MULTIPLIER = 0.025;

  calculate1RM(weight: number, reps: number): number {
    const additionalWeight = weight * RMCalculator.EPLEY_MULTIPLIER * reps;
    return weight + additionalWeight;
  }
}
```
✅ Test still passes, code is cleaner

**Commit**:
```bash
git add .
git commit -m "[Refactor] Extract Epley multiplier to constant

- Moved magic number 0.025 to named constant
- Improved code readability
- No behavior changes"
```

---

## 4. Current Sprint: Anaerobic Workout Recording

**Sprint Duration**: 10 days
**Sprint Goal**: Complete anaerobic workout recording with TDD

### 4.1 Task Breakdown (TDD Order)

#### Task 1: 1RM Calculation (Day 1 - 4 hours)

**Red**:
```typescript
// Test: calculate 1RM for various weight/rep combinations
test('60kg × 10 reps = 75kg 1RM', () => {
  expect(calculate1RM(60, 10)).toBeCloseTo(75, 1);
});
```

**Green**:
```typescript
function calculate1RM(weight: number, reps: number): number {
  return weight + (weight * 0.025 * reps);
}
```

**Refactor**:
```typescript
const EPLEY_MULTIPLIER = 0.025;

function calculate1RM(weight: number, reps: number): number {
  return weight * (1 + EPLEY_MULTIPLIER * reps);
}
```

**Acceptance Criteria**:
- ✅ Calculates 1RM accurately (within 0.1kg)
- ✅ Handles edge cases (reps = 1, weight = 0)
- ✅ Test coverage > 90%

---

#### Task 2: RM Percentage Table (Day 1 - 2 hours)

**Red**:
```typescript
test('should return 75% for 10 reps', () => {
  expect(getRMPercentage(10)).toBe(75);
});

test('should interpolate for reps > 20', () => {
  expect(getRMPercentage(25)).toBe(54.5);
});
```

**Green**:
```typescript
const RM_TABLE: Record<number, number> = {
  1: 100, 2: 95, 3: 90, /* ... */ 20: 57
};

function getRMPercentage(reps: number): number {
  if (reps <= 20) return RM_TABLE[reps];
  return Math.max(50, 57 - (reps - 20) * 0.5);
}
```

**Acceptance Criteria**:
- ✅ Returns correct percentage for reps 1-20
- ✅ Interpolates for reps > 20
- ✅ Never returns < 50%

---

#### Task 3: Grade Evaluation (Day 1 - 6 hours)

**Red**:
```typescript
test('70kg user, 60kg bench × 10 = Gold grade', () => {
  const evaluator = new GradeEvaluator();
  const grade = evaluator.evaluateGrade({
    bodyWeight: 70,
    weight: 60,
    exercise: 'bench_press',
    reps: 10
  });
  expect(grade).toBe('gold');
});
```

**Green**:
```typescript
class GradeEvaluator {
  evaluateGrade(input: GradeInput): Grade {
    const table = this.getGradeTable(input.exercise, input.reps);
    const thresholds = this.findThresholds(table, input.bodyWeight);

    if (input.weight >= thresholds.challenger) return 'challenger';
    if (input.weight >= thresholds.master) return 'master';
    // ... rest of grades
    return 'bronze';
  }
}
```

**Refactor**:
```typescript
// Extract grade tables to separate JSON files
// Add type safety with Zod validation
// Optimize lookup with binary search
```

**Acceptance Criteria**:
- ✅ Correctly evaluates all 7 grade tiers
- ✅ Handles bodyweight interpolation
- ✅ Supports all major exercises
- ✅ Performance < 10ms per evaluation

---

#### Task 4: EXP Calculation (Day 2 - 4 hours)

**Red**:
```typescript
test('should calculate base EXP from workout data', () => {
  const exp = calculateWorkoutExp({
    weight: 60,
    reps: 10,
    sets: 3
  });
  expect(exp.baseExp).toBe(1800); // 60 × 10 × 3
});

test('should apply grade multiplier', () => {
  const goldExp = calculateWorkoutExp({ grade: 'gold' });
  const silverExp = calculateWorkoutExp({ grade: 'silver' });
  expect(goldExp.totalExp).toBeGreaterThan(silverExp.totalExp);
});
```

**Green**:
```typescript
const GRADE_MULTIPLIERS = {
  bronze: 1.0,
  silver: 1.2,
  gold: 1.5,
  platinum: 2.0,
  diamond: 2.5,
  master: 3.0,
  challenger: 4.0
};

function calculateWorkoutExp(input: WorkoutInput): ExpResult {
  const baseExp = input.weight * input.reps * input.sets;
  const multiplier = GRADE_MULTIPLIERS[input.grade];
  const totalExp = Math.round(baseExp * multiplier);

  return { baseExp, totalExp, multiplier };
}
```

**Acceptance Criteria**:
- ✅ Base EXP = weight × reps × sets
- ✅ Grade multiplier applied correctly
- ✅ Returns integer values (rounded)

---

#### Task 5: EXP Distribution (Day 2 - 2 hours)

**Red**:
```typescript
test('should distribute 80% to body part, 20% to total', () => {
  const dist = distributeExp(1000);
  expect(dist.bodyPartExp).toBe(800);
  expect(dist.totalExp).toBe(200);
});

test('should add attribute bonus when active', () => {
  const dist = distributeExp(1000, 'earth');
  expect(dist.attributeExp).toBe(300); // 30% bonus
});
```

**Green**:
```typescript
function distributeExp(totalExp: number, activeAttribute?: string) {
  const bodyPartExp = Math.round(totalExp * 0.8);
  const characterExp = Math.round(totalExp * 0.2);
  const attributeExp = activeAttribute
    ? Math.round(totalExp * 0.3)
    : 0;

  return { bodyPartExp, totalExp: characterExp, attributeExp };
}
```

**Acceptance Criteria**:
- ✅ 80/20 split is exact
- ✅ Attribute bonus applies correctly
- ✅ No EXP is lost in rounding

---

#### Task 6: Level-Up Logic (Day 2-3 - 6 hours)

**Red**:
```typescript
test('should level up when EXP exceeds threshold', () => {
  const result = checkLevelUp({
    currentLevel: 5,
    currentExp: 1500,
    expGained: 1000
  });

  expect(result.didLevelUp).toBe(true);
  expect(result.newLevel).toBe(6);
  expect(result.overflow).toBeGreaterThan(0);
});

test('should handle multiple level-ups', () => {
  const result = checkLevelUp({
    currentLevel: 1,
    currentExp: 0,
    expGained: 5000 // Enough for multiple levels
  });

  expect(result.newLevel).toBeGreaterThan(3);
});
```

**Green**:
```typescript
function getRequiredExp(level: number): number {
  return Math.round(1000 * Math.pow(1.15, level - 1));
}

function checkLevelUp(input: LevelUpInput): LevelUpResult {
  let level = input.currentLevel;
  let exp = input.currentExp + input.expGained;
  let didLevelUp = false;

  while (exp >= getRequiredExp(level)) {
    exp -= getRequiredExp(level);
    level++;
    didLevelUp = true;
  }

  return {
    didLevelUp,
    newLevel: level,
    overflow: exp
  };
}
```

**Acceptance Criteria**:
- ✅ Levels up at correct thresholds
- ✅ Handles multiple level-ups
- ✅ Preserves overflow EXP
- ✅ Never loses EXP

---

#### Task 7: Prisma Schema (Day 3 - 4 hours)

**Red**:
```typescript
test('should create workout record', async () => {
  const workout = await prisma.workoutRecord.create({
    data: {
      userId: testUser.id,
      exerciseId: 101,
      bodyPartId: 2,
      sets: 3,
      reps: 10,
      weight: 60,
      calculated1RM: 75,
      grade: 'gold',
      expGained: 2700,
      caloriesBurned: 90,
      workoutDate: new Date()
    }
  });

  expect(workout.id).toBeDefined();
});
```

**Green**:
```prisma
model WorkoutRecord {
  id              String   @id @default(uuid())
  userId          String
  exerciseId      Int
  bodyPartId      Int
  sets            Int
  reps            Int
  weight          Decimal
  calculated1RM   Decimal?
  grade           String?
  expGained       Int?
  caloriesBurned  Decimal?
  workoutDate     DateTime
  createdAt       DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id])
  exercise        Exercise @relation(fields: [exerciseId], references: [id])
  bodyPart        BodyPart @relation(fields: [bodyPartId], references: [id])
}
```

**Migration**:
```bash
npx prisma migrate dev --name add_workout_records
```

**Acceptance Criteria**:
- ✅ Schema matches PRD design
- ✅ All constraints defined
- ✅ Indexes on frequently queried fields
- ✅ Migrations run successfully

---

#### Task 8: Workout Service (Day 4 - 6 hours)

**Red**:
```typescript
describe('WorkoutService', () => {
  test('should record workout and return results', async () => {
    const result = await workoutService.recordWorkout({
      userId: testUser.id,
      exerciseId: 101,
      bodyPart: 'chest',
      weight: 60,
      reps: 10,
      sets: 3,
      workoutDate: '2024-01-15'
    });

    expect(result.workout).toBeDefined();
    expect(result.expGained.bodyPart).toBeGreaterThan(0);
    expect(result.levelUp.didLevelUp).toBeDefined();
  });
});
```

**Green**:
```typescript
class WorkoutService {
  async recordWorkout(input: WorkoutInput): Promise<WorkoutResult> {
    // 1. Calculate 1RM and grade
    const rm = this.rmCalculator.calculate1RM(input.weight, input.reps);
    const grade = this.gradeEvaluator.evaluateGrade({...input, rm});

    // 2. Calculate EXP
    const exp = this.expEngine.calculateExp({...input, grade});

    // 3. Distribute EXP
    const dist = this.expEngine.distributeExp(exp.totalExp);

    // 4. Save workout (transaction)
    const workout = await this.prisma.$transaction(async (tx) => {
      const record = await tx.workoutRecord.create({...});
      const levelUp = await this.applyExp(tx, userId, dist);
      return { record, levelUp };
    });

    return { workout: workout.record, expGained: dist, levelUp: workout.levelUp };
  }
}
```

**Acceptance Criteria**:
- ✅ Uses Prisma transactions
- ✅ Calls all calculation services
- ✅ Returns complete result object
- ✅ Handles errors gracefully

---

#### Task 9: API Controller (Day 5 - 4 hours)

**Red**:
```typescript
describe('POST /api/v1/workouts', () => {
  test('should create workout record', async () => {
    const response = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        exerciseId: 101,
        bodyPart: 'chest',
        weight: 60,
        reps: 10,
        sets: 3,
        workoutDate: '2024-01-15'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.workout).toBeDefined();
  });

  test('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/v1/workouts')
      .set('Authorization', `Bearer ${token}`)
      .send({ weight: 60 }); // Missing required fields

    expect(response.status).toBe(400);
  });
});
```

**Green**:
```typescript
// server/src/controllers/workout.controller.ts
export class WorkoutController {
  async createWorkout(req: Request, res: Response) {
    try {
      // Validation
      const validated = CreateWorkoutSchema.parse(req.body);

      // Business logic
      const result = await this.workoutService.recordWorkout({
        userId: req.user!.id,
        ...validated
      });

      // Response
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }
}
```

**Acceptance Criteria**:
- ✅ Validates input with Zod
- ✅ Returns 201 on success
- ✅ Returns appropriate error codes
- ✅ Includes auth middleware

---

#### Task 10: Frontend Component (Day 6-7 - 8 hours)

**Red**:
```typescript
describe('WorkoutRecorder', () => {
  test('should submit workout and show results', async () => {
    render(<WorkoutRecorder />);

    // Fill form
    await userEvent.selectOptions(screen.getByLabelText('운동'), '101');
    await userEvent.type(screen.getByLabelText('무게'), '60');
    await userEvent.type(screen.getByLabelText('횟수'), '10');
    await userEvent.type(screen.getByLabelText('세트'), '3');

    // Submit
    await userEvent.click(screen.getByText('기록하기'));

    // Verify results
    await waitFor(() => {
      expect(screen.getByText(/경험치/)).toBeInTheDocument();
      expect(screen.getByText(/레벨업/)).toBeInTheDocument();
    });
  });
});
```

**Green**:
```typescript
// client/src/components/workout/WorkoutRecorder.tsx
export const WorkoutRecorder = () => {
  const [formData, setFormData] = useState({...});
  const recordWorkout = useRecordWorkout();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await recordWorkout.mutateAsync(formData);

    // Show result modal
    setShowResult(true);
    setResult(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <ExerciseSelector value={formData.exerciseId} onChange={...} />
      <Input label="무게" type="number" {...} />
      <Input label="횟수" type="number" {...} />
      <Input label="세트" type="number" {...} />
      <Button type="submit">기록하기</Button>

      {showResult && <WorkoutResultModal result={result} />}
    </form>
  );
};
```

**Acceptance Criteria**:
- ✅ Form validation works
- ✅ Submits to API correctly
- ✅ Shows loading state
- ✅ Displays results in modal
- ✅ Handles errors gracefully

---

### 4.2 Daily Standup Format

**Every Morning (10 min)**:
- What I completed yesterday
- What I'm working on today
- Any blockers

**Example**:
```
Yesterday:
- ✅ Completed 1RM calculation with tests (95% coverage)
- ✅ Completed RM percentage table

Today:
- [ ] Grade evaluation logic
- [ ] Grade evaluation tests

Blockers:
- None
```

---

### 4.3 Commit Strategy

**Commit Types**:
- `[Test]` - Add or modify tests (Red phase)
- `[Feat]` - Add new feature (Green phase)
- `[Refactor]` - Refactor existing code (Refactor phase)
- `[Fix]` - Bug fix
- `[Docs]` - Documentation only
- `[Chore]` - Build, dependencies, etc.

**Commit Frequency**:
- After each Red-Green-Refactor cycle
- At least 3-5 commits per day

**Example Commit Sequence**:
```bash
# Red
git commit -m "[Test] Add test for 1RM calculation with Epley formula"

# Green
git commit -m "[Feat] Implement 1RM calculation using Epley formula

- Formula: 1RM = weight × (1 + reps / 30)
- Returns number with 1 decimal precision
- Handles edge cases (reps = 1)"

# Refactor
git commit -m "[Refactor] Extract Epley multiplier to constant

- Moved magic number 0.025 to named constant
- Improved code readability
- No behavior changes"
```

---

## 5. Definition of Done

### Feature-Level DoD

A feature is considered DONE when:

- ✅ **Tests Written First** - All tests written before implementation
- ✅ **Tests Pass** - All unit, integration, E2E tests pass
- ✅ **Coverage** - Code coverage > 80% for business logic
- ✅ **Code Review** - Reviewed by at least one other developer
- ✅ **Documentation** - API docs updated (Swagger)
- ✅ **Linting** - ESLint passes with 0 errors
- ✅ **Type Safety** - TypeScript strict mode, no `any` types
- ✅ **Manual Testing** - Tested in local Docker environment
- ✅ **Committed** - All code committed with proper messages
- ✅ **Deployed** - Deployed to development environment

### Sprint-Level DoD

A sprint is considered DONE when:

- ✅ All user stories completed
- ✅ Sprint goal achieved
- ✅ No critical bugs
- ✅ Performance tests pass
- ✅ Security audit completed
- ✅ Demo-ready
- ✅ Retrospective held

### Release-Level DoD

A release is considered DONE when:

- ✅ All sprint DoDs met
- ✅ E2E tests pass
- ✅ Load testing completed
- ✅ Security scan passed
- ✅ Backup/rollback plan ready
- ✅ Monitoring/alerts configured
- ✅ User documentation complete
- ✅ Deployed to production

---

## 6. Next Phases Overview

### Phase 2: Gamification (Week 7-12)

**Priority Features**:
1. Skill Tree System
2. Map Exploration
3. Daily Quests
4. Achievements

**TDD Focus**:
- Skill unlock logic
- Map progression engine
- Quest assignment scheduler
- Achievement trigger system

---

### Phase 3: Community (Week 13-18)

**Priority Features**:
1. Community Feed
2. Leaderboards
3. Friend System
4. Social Sharing

**TDD Focus**:
- Post creation/moderation
- Ranking calculation
- Friend relationship logic
- Activity feed algorithm

---

### Phase 4: Monetization (Week 19-24)

**Priority Features**:
1. Premium Subscription
2. Food Photo Analysis
3. Advanced Analytics
4. Custom Workout Plans

**TDD Focus**:
- Payment processing
- AI integration tests
- Analytics calculation
- Plan generation algorithm

---

## 7. Risk Management

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Docker HMR issues on Windows | High | Medium | Document workarounds, use container restart |
| Database migration failures | Medium | High | Test migrations on staging first |
| Performance issues at scale | Medium | High | Load testing early, optimize queries |
| Security vulnerabilities | Low | High | Regular security audits, penetration testing |

### Process Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scope creep | Medium | Medium | Strict sprint planning, "out of scope" list |
| Testing debt | Medium | High | Enforce DoD, code review checks |
| Technical debt | Medium | Medium | Refactor time in each sprint |
| Knowledge silos | Low | Medium | Pair programming, documentation |

---

## 8. Success Metrics (Phase 1)

### Development Metrics

- **Test Coverage**: > 80%
- **Build Time**: < 5 minutes
- **Deployment Frequency**: Daily (dev), Weekly (staging)
- **Bug Escape Rate**: < 5% to production
- **Code Review Time**: < 24 hours

### Product Metrics

- **Beta Users**: 100+
- **Workout Records**: 500+
- **Retention (7-day)**: > 40%
- **Average Workouts/Week**: 3+
- **API Response Time**: p95 < 500ms

---

## Appendix A: TDD Checklist

**Before Starting New Feature**:
- [ ] Read user story and acceptance criteria
- [ ] Break down into testable units
- [ ] Write test cases (Red phase)
- [ ] Confirm tests fail for the right reason

**During Development**:
- [ ] Write minimal code to pass (Green phase)
- [ ] Run tests frequently (after every change)
- [ ] Refactor when tests are green
- [ ] Commit after each cycle

**Before Marking Complete**:
- [ ] All tests pass
- [ ] Coverage > 80%
- [ ] No console errors/warnings
- [ ] Linter passes
- [ ] Manual testing done
- [ ] Documentation updated

---

## Appendix B: Quick Reference Commands

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- RMCalculator.test.ts
```

### Database
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes data)
npx prisma migrate reset
```

### Docker
```bash
# Start all services
npm run docker:dev

# Restart specific service
docker-compose restart client
docker-compose restart server

# View logs
docker-compose logs server -f

# Rebuild
npm run docker:dev:build
```

### Git
```bash
# Conventional commit
git commit -m "[Type] Short description

- Detailed change 1
- Detailed change 2"

# Example types: Test, Feat, Refactor, Fix, Docs, Chore
```

---

**END OF PLAN**

**Next Action**: Start Task 1 - 1RM Calculation (Red phase)
