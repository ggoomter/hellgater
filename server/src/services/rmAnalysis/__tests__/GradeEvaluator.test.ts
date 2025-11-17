/**
 * GradeEvaluator Test Suite
 *
 * Tests for grade evaluation based on bodyweight ratio
 * Grades: Bronze → Silver → Gold → Platinum → Diamond → Master → Challenger
 *
 * TDD Phase: RED
 * Status: Tests should FAIL (implementation not yet created)
 */

import { GradeEvaluator, type GradeInput, type Grade } from '../GradeEvaluator';

describe('GradeEvaluator', () => {
  let evaluator: GradeEvaluator;

  beforeEach(() => {
    evaluator = new GradeEvaluator();
  });

  describe('evaluateGrade - Deadlift 10 reps', () => {
    test('should return bronze for 55kg user lifting 20kg', () => {
      // Given
      const input: GradeInput = {
        bodyWeight: 55,
        weight: 20,
        exercise: 'deadlift',
        reps: 10,
      };

      // When
      const grade = evaluator.evaluateGrade(input);

      // Then
      expect(grade).toBe('bronze');
    });

    test('should return silver for 60kg user lifting 35kg', () => {
      // Given
      const input: GradeInput = {
        bodyWeight: 60,
        weight: 35,
        exercise: 'deadlift',
        reps: 10,
      };

      // When
      const grade = evaluator.evaluateGrade(input);

      // Then
      expect(grade).toBe('silver');
    });

    test('should return gold for 70kg user lifting 60kg', () => {
      // Given
      const input: GradeInput = {
        bodyWeight: 70,
        weight: 60,
        exercise: 'deadlift',
        reps: 10,
      };

      // When
      const grade = evaluator.evaluateGrade(input);

      // Then
      expect(grade).toBe('gold');
    });

    test('should return platinum for 75kg user lifting 80kg', () => {
      // Given
      const input: GradeInput = {
        bodyWeight: 75,
        weight: 80,
        exercise: 'deadlift',
        reps: 10,
      };

      // When
      const grade = evaluator.evaluateGrade(input);

      // Then
      expect(grade).toBe('platinum');
    });

    test('should return diamond for 75kg user lifting 100kg', () => {
      // Given
      const input: GradeInput = {
        bodyWeight: 75,
        weight: 100,
        exercise: 'deadlift',
        reps: 10,
      };

      // When
      const grade = evaluator.evaluateGrade(input);

      // Then
      expect(grade).toBe('diamond');
    });

    test('should return master for 75kg user lifting 120kg', () => {
      // Given
      const input: GradeInput = {
        bodyWeight: 75,
        weight: 120,
        exercise: 'deadlift',
        reps: 10,
      };

      // When
      const grade = evaluator.evaluateGrade(input);

      // Then
      expect(grade).toBe('master');
    });

    test('should return challenger for 75kg user lifting 160kg', () => {
      // Given
      const input: GradeInput = {
        bodyWeight: 75,
        weight: 160,
        exercise: 'deadlift',
        reps: 10,
      };

      // When
      const grade = evaluator.evaluateGrade(input);

      // Then
      expect(grade).toBe('challenger');
    });
  });

  describe('evaluateGrade - Bodyweight interpolation', () => {
    test('should interpolate for bodyweight between table values (67.5kg)', () => {
      // Given - bodyweight between 65kg and 70kg
      const input: GradeInput = {
        bodyWeight: 67.5,
        weight: 55,
        exercise: 'deadlift',
        reps: 10,
      };

      // When
      const grade = evaluator.evaluateGrade(input);

      // Then
      // Should be between 65kg (gold: 50) and 70kg (gold: 60)
      // At 67.5kg, gold should be around 55kg
      expect(grade).toBe('gold');
    });

    test('should handle bodyweight below minimum table value', () => {
      // Given - bodyweight below 55kg
      const input: GradeInput = {
        bodyWeight: 50,
        weight: 30,
        exercise: 'deadlift',
        reps: 10,
      };

      // When
      const grade = evaluator.evaluateGrade(input);

      // Then
      expect(['bronze', 'silver', 'gold']).toContain(grade);
    });

    test('should handle bodyweight above maximum table value', () => {
      // Given - bodyweight above 75kg
      const input: GradeInput = {
        bodyWeight: 100,
        weight: 100,
        exercise: 'deadlift',
        reps: 10,
      };

      // When
      const grade = evaluator.evaluateGrade(input);

      // Then
      expect(['bronze', 'silver', 'gold', 'platinum', 'diamond']).toContain(
        grade
      );
    });
  });

  describe('evaluateGrade - Different exercises', () => {
    test('should evaluate bench press correctly', () => {
      // Given
      const input: GradeInput = {
        bodyWeight: 70,
        weight: 60,
        exercise: 'bench_press',
        reps: 10,
      };

      // When
      const grade = evaluator.evaluateGrade(input);

      // Then
      expect(grade).toBeDefined();
      expect(['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'challenger']).toContain(grade);
    });

    test('should evaluate squat correctly', () => {
      // Given
      const input: GradeInput = {
        bodyWeight: 70,
        weight: 80,
        exercise: 'squat',
        reps: 10,
      };

      // When
      const grade = evaluator.evaluateGrade(input);

      // Then
      expect(grade).toBeDefined();
      expect(['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'challenger']).toContain(grade);
    });
  });

  describe('evaluateGrade - Edge cases', () => {
    test('should handle 0 weight (bodyweight exercise)', () => {
      // Given
      const input: GradeInput = {
        bodyWeight: 70,
        weight: 0,
        exercise: 'deadlift',
        reps: 10,
      };

      // When
      const grade = evaluator.evaluateGrade(input);

      // Then
      expect(grade).toBe('bronze');
    });

    test('should handle very high weight (world record level)', () => {
      // Given
      const input: GradeInput = {
        bodyWeight: 75,
        weight: 500,
        exercise: 'deadlift',
        reps: 1,
      };

      // When
      const grade = evaluator.evaluateGrade(input);

      // Then
      expect(grade).toBe('challenger');
    });

    test('should return consistent results for same input', () => {
      // Given
      const input: GradeInput = {
        bodyWeight: 70,
        weight: 60,
        exercise: 'deadlift',
        reps: 10,
      };

      // When
      const grade1 = evaluator.evaluateGrade(input);
      const grade2 = evaluator.evaluateGrade(input);

      // Then
      expect(grade1).toBe(grade2);
    });
  });

  describe('getGradeMultiplier', () => {
    test('should return 1.0 for bronze', () => {
      // When
      const multiplier = evaluator.getGradeMultiplier('bronze');

      // Then
      expect(multiplier).toBe(1.0);
    });

    test('should return 1.2 for silver', () => {
      // When
      const multiplier = evaluator.getGradeMultiplier('silver');

      // Then
      expect(multiplier).toBe(1.2);
    });

    test('should return 1.5 for gold', () => {
      // When
      const multiplier = evaluator.getGradeMultiplier('gold');

      // Then
      expect(multiplier).toBe(1.5);
    });

    test('should return 2.0 for platinum', () => {
      // When
      const multiplier = evaluator.getGradeMultiplier('platinum');

      // Then
      expect(multiplier).toBe(2.0);
    });

    test('should return 2.5 for diamond', () => {
      // When
      const multiplier = evaluator.getGradeMultiplier('diamond');

      // Then
      expect(multiplier).toBe(2.5);
    });

    test('should return 3.0 for master', () => {
      // When
      const multiplier = evaluator.getGradeMultiplier('master');

      // Then
      expect(multiplier).toBe(3.0);
    });

    test('should return 4.0 for challenger', () => {
      // When
      const multiplier = evaluator.getGradeMultiplier('challenger');

      // Then
      expect(multiplier).toBe(4.0);
    });
  });
});
