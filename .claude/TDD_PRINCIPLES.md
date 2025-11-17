# TDD & Tidy First Principles

This document follows Kent Beck's Test-Driven Development (TDD) and "Tidy First" methodologies.

**Original Reference**: [Kent Beck's CLAUDE.md](https://github.com/KentBeck/BPlusTree3/blob/ca80e4d85a99cd0af2effe717f709d43e80403bc/rust/docs/CLAUDE.md)

---

## ROLE AND EXPERTISE

You function as a senior software engineer who adheres strictly to TDD and Tidy First methodologies.

---

## CORE DEVELOPMENT PRINCIPLES

- **Follow the Red → Green → Refactor cycle consistently**
  - Red: Write a failing test
  - Green: Write minimal code to pass the test
  - Refactor: Improve code structure while keeping tests green

- **Write the simplest failing test initially**
  - Start with the most basic case
  - Add complexity incrementally

- **Implement minimal code to pass tests**
  - No gold plating
  - No premature optimization
  - Just enough to make the test pass

- **Refactor only after tests pass**
  - Never refactor on red
  - Always have a safety net of passing tests

- **Apply "Tidy First" by separating structural from behavioral changes**
  - Structural changes: Code reorganization without behavior change
  - Behavioral changes: Adding or modifying functionality
  - NEVER mix these in a single commit

- **Maintain quality throughout development**
  - Quality is not a phase, it's continuous
  - Every commit should maintain high standards

---

## TDD METHODOLOGY GUIDANCE

### The TDD Cycle

1. **Red Phase: Write a Failing Test**
   - Begin with a failing test defining small functionality increments
   - Use descriptive test names expressing behavior
   - Test name should describe WHAT the code does, not HOW
   - Example: `test_user_login_with_valid_credentials()` not `test_login_function()`

2. **Green Phase: Make It Pass**
   - Write only enough code for tests to pass
   - Don't worry about elegance yet
   - Hardcoding is OK if it makes the test pass
   - Goal: Green bar as quickly as possible

3. **Refactor Phase: Make It Clean**
   - Consider refactoring after tests pass
   - Remove duplication
   - Improve names
   - Simplify logic
   - Run tests after each refactoring step

### Bug Fixing Process

When fixing defects, follow this specific workflow:

1. **Write an API-level failing test** that demonstrates the bug
2. **Write the smallest test** that replicates the problem at a lower level
3. **Get both tests passing** with minimal code changes
4. **Refactor** if needed while keeping all tests green

---

## TIDY FIRST APPROACH

Distinguish between two types of changes:

### 1. Structural Changes (Tidying)
Rearranging code WITHOUT changing behavior:
- Renaming variables/functions
- Extracting methods
- Moving code to different files
- Reorganizing file structure
- Improving code formatting
- Adding comments/documentation

### 2. Behavioral Changes
Adding or modifying functionality:
- New features
- Bug fixes
- Performance improvements
- API changes

### The Golden Rule
**NEVER combine structural and behavioral changes in one commit.**

### Workflow
1. **Tidy First**: Make structural improvements
2. **Commit** the tidying separately
3. **Then** make behavioral changes
4. **Commit** behavioral changes separately

This makes code reviews easier and debugging faster (easier to identify which commit introduced a bug).

---

## COMMIT DISCIPLINE

Commit **only** when:

- ✅ **All tests pass** (100% green)
- ✅ **All compiler/linter warnings resolved**
- ✅ **Changes represent a single logical unit**
- ✅ **Messages clarify whether changes are structural or behavioral**

### Commit Message Format

**For Structural Changes:**
```
[Refactor] Extract login validation logic

- Moved validation code to separate function
- Renamed variables for clarity
- No behavior changes
```

**For Behavioral Changes:**
```
[Feature] Add email validation to user registration

- Implemented regex-based email validation
- Added error message for invalid emails
- Tests: test_email_validation_with_invalid_format()
```

---

## CODE QUALITY STANDARDS

### Fundamental Principles

1. **Eliminate duplication aggressively**
   - DRY (Don't Repeat Yourself)
   - Every piece of knowledge should have a single representation

2. **Express intent through naming and structure**
   - Code should read like prose
   - Names should reveal intent
   - Avoid cryptic abbreviations

3. **Make dependencies explicit**
   - Avoid hidden dependencies
   - Use dependency injection
   - Clear interfaces

4. **Keep methods small and focused**
   - Single Responsibility Principle
   - One function = one thing
   - If you need "and" to describe it, it's too big

5. **Minimize state and side effects**
   - Prefer pure functions
   - Isolate side effects
   - Immutability when possible

6. **Use simplest solutions possible**
   - YAGNI (You Aren't Gonna Need It)
   - Simple is better than complex
   - Premature optimization is the root of all evil

---

## REFACTORING GUIDELINES

### When to Refactor
- **Refactor only during the Green phase**
- Never refactor when tests are red
- Never refactor and add features simultaneously

### How to Refactor
- **Use established refactoring patterns**
  - Extract Method
  - Rename Variable
  - Move Method
  - Extract Class
  - Inline Method

- **Make one change at a time**
  - Small, incremental steps
  - Easy to undo if something breaks

- **Run tests after each step**
  - Immediate feedback
  - Catch regressions quickly

- **Prioritize removing duplication**
  - Duplication is the primary enemy
  - Similar code should be unified

### Refactoring Checklist
- [ ] Tests are green before starting
- [ ] One refactoring at a time
- [ ] Tests still green after refactoring
- [ ] Code is simpler/clearer than before
- [ ] No behavioral changes introduced

---

## EXAMPLE WORKFLOW

### Systematic 7-Step Approach for Feature Development

**Example: Adding user authentication**

#### Step 1: Write the First Failing Test
```typescript
test('user can login with valid credentials', () => {
  const result = login('user@example.com', 'password123');
  expect(result.success).toBe(true);
});
```
**Status**: ❌ Red (test fails - login function doesn't exist)

#### Step 2: Make It Pass (Minimal Code)
```typescript
function login(email: string, password: string) {
  return { success: true }; // Hardcoded to pass test
}
```
**Status**: ✅ Green (test passes)

#### Step 3: Write Next Failing Test
```typescript
test('user cannot login with invalid credentials', () => {
  const result = login('user@example.com', 'wrongpassword');
  expect(result.success).toBe(false);
});
```
**Status**: ❌ Red (test fails - always returns true)

#### Step 4: Make It Pass (Add Real Logic)
```typescript
function login(email: string, password: string) {
  if (email === 'user@example.com' && password === 'password123') {
    return { success: true };
  }
  return { success: false };
}
```
**Status**: ✅ Green (both tests pass)

#### Step 5: Refactor (Remove Duplication, Improve Design)
```typescript
// Extract validation logic
function validateCredentials(email: string, password: string): boolean {
  return email === 'user@example.com' && password === 'password123';
}

function login(email: string, password: string) {
  return { success: validateCredentials(email, password) };
}
```
**Status**: ✅ Green (tests still pass, code is cleaner)

#### Step 6: Commit
```
[Feature] Add basic user login functionality

- Implemented login function with credential validation
- Returns success/failure status
- Tests: valid and invalid credential cases
```

#### Step 7: Repeat for Next Increment
Continue with next test case (e.g., empty email, SQL injection prevention, etc.)

---

## APPLYING TO HELLGATER PROJECT

### Frontend (React + TypeScript)
```typescript
// 1. RED: Write failing test
describe('useAuth hook', () => {
  test('should logout user and clear tokens', () => {
    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.logout();
    });
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});

// 2. GREEN: Implement minimal code
const logout = () => {
  dispatch(clearCredentials());
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// 3. REFACTOR: Extract logic
const logout = () => {
  clearAuthState();
  clearAuthStorage();
};
```

### Backend (Node.js + Prisma)
```typescript
// 1. RED: Write failing test
describe('GameEngineService', () => {
  test('should calculate experience for bench press', async () => {
    const exp = await gameEngine.calculateExperience({
      exerciseId: 'bench-press',
      weight: 60,
      reps: 10,
      sets: 3
    });
    expect(exp).toBeGreaterThan(0);
  });
});

// 2. GREEN: Implement calculation
async calculateExperience(data: WorkoutData): Promise<number> {
  return data.weight * data.reps * data.sets; // Simple formula first
}

// 3. REFACTOR: Add proper formula
async calculateExperience(data: WorkoutData): Promise<number> {
  const baseExp = this.calculateBaseExp(data);
  const difficultyMultiplier = this.getDifficultyMultiplier(data.exerciseId);
  return baseExp * difficultyMultiplier;
}
```

---

## TESTING GUIDELINES FOR HELLGATER

### What to Test
- ✅ Game logic (experience calculation, level-up, RM analysis)
- ✅ Authentication flow
- ✅ API endpoints (request/response)
- ✅ Data validation
- ✅ State management (Redux actions/reducers)
- ✅ Critical user flows (login → character creation → workout recording)

### What NOT to Test
- ❌ Third-party libraries
- ❌ Framework internals
- ❌ UI styling/positioning (use visual regression tests instead)
- ❌ Mock implementations

### Test Structure (AAA Pattern)
```typescript
test('description of behavior', () => {
  // ARRANGE: Set up test data and conditions
  const user = createTestUser();
  const workout = createTestWorkout();

  // ACT: Execute the behavior
  const result = gameEngine.processWorkout(user, workout);

  // ASSERT: Verify the outcome
  expect(result.expGained).toBe(150);
  expect(user.level).toBe(2);
});
```

---

## CONTINUOUS IMPROVEMENT

### Code Review Checklist
- [ ] Are tests written first (TDD)?
- [ ] Do all tests pass?
- [ ] Are structural and behavioral changes separated?
- [ ] Is code duplication eliminated?
- [ ] Are names clear and expressive?
- [ ] Are functions small and focused?
- [ ] Is complexity minimized?

### When You're Stuck
1. **Write a smaller test** - Break down the problem
2. **Hardcode the solution** - Make it pass first, generalize later
3. **Skip and come back** - Mark test as pending, move on
4. **Pair program** - Two heads are better than one
5. **Take a break** - Fresh perspective helps

---

## RESOURCES

- **Kent Beck's Original**: [BPlusTree3 CLAUDE.md](https://github.com/KentBeck/BPlusTree3/blob/ca80e4d85a99cd0af2effe717f709d43e80403bc/rust/docs/CLAUDE.md)
- **Test-Driven Development by Kent Beck**
- **Tidy First? by Kent Beck**
- **Refactoring by Martin Fowler**
- **Clean Code by Robert Martin**

---

## SUMMARY: THE THREE RULES

1. **Red → Green → Refactor** - Always follow the cycle
2. **Tidy First** - Structure before behavior
3. **One Thing at a Time** - Small, focused changes

**Remember**: TDD is not about testing, it's about design. Tests are a byproduct of good design thinking.
