/**
 * RMCalculator Test Suite
 *
 * Tests for 1RM (One-Rep Max) calculation using project-specific formula
 * Formula: 1RM = weight + (weight × 0.025 × reps)
 *
 * TDD Phase: RED
 * Status: Tests should FAIL (implementation not yet created)
 */

import { RMCalculator } from '../RMCalculator';

describe('RMCalculator', () => {
  let calculator: RMCalculator;

  beforeEach(() => {
    calculator = new RMCalculator();
  });

  describe('calculate1RM', () => {
    test('should calculate 1RM correctly for 60kg × 10 reps', () => {
      // Given
      const weight = 60;
      const reps = 10;

      // When
      const result = calculator.calculate1RM(weight, reps);

      // Then
      // Expected: 60 + (60 × 0.025 × 10) = 60 + 15 = 75
      expect(result).toBeCloseTo(75, 1);
    });

    test('should calculate 1RM correctly for 100kg × 5 reps', () => {
      // Given
      const weight = 100;
      const reps = 5;

      // When
      const result = calculator.calculate1RM(weight, reps);

      // Then
      // Expected: 100 + (100 × 0.025 × 5) = 100 + 12.5 = 112.5
      expect(result).toBeCloseTo(112.5, 1);
    });

    test('should return original weight for 1 rep (1RM test)', () => {
      // Given
      const weight = 80;
      const reps = 1;

      // When
      const result = calculator.calculate1RM(weight, reps);

      // Then
      // Expected: 80 + (80 × 0.025 × 1) = 80 + 2 = 82
      expect(result).toBeCloseTo(82, 1);
    });

    test('should handle edge case of 0 weight', () => {
      // Given
      const weight = 0;
      const reps = 10;

      // When
      const result = calculator.calculate1RM(weight, reps);

      // Then
      expect(result).toBe(0);
    });

    test('should handle high rep counts (20 reps)', () => {
      // Given
      const weight = 50;
      const reps = 20;

      // When
      const result = calculator.calculate1RM(weight, reps);

      // Then
      // Expected: 50 + (50 × 0.025 × 20) = 50 + 25 = 75
      expect(result).toBeCloseTo(75, 1);
    });

    test('should return number with appropriate precision', () => {
      // Given
      const weight = 62.5;
      const reps = 8;

      // When
      const result = calculator.calculate1RM(weight, reps);

      // Then
      // Expected: 62.5 + (62.5 × 0.025 × 8) = 62.5 + 12.5 = 75
      expect(result).toBeCloseTo(75, 1);
      expect(typeof result).toBe('number');
    });

    test('should handle decimal weights', () => {
      // Given
      const weight = 57.5;
      const reps = 12;

      // When
      const result = calculator.calculate1RM(weight, reps);

      // Then
      // Expected: 57.5 + (57.5 × 0.025 × 12) = 57.5 + 17.25 = 74.75
      expect(result).toBeCloseTo(74.75, 1);
    });
  });

  describe('getRMPercentage', () => {
    test('should return 100% for 1 rep', () => {
      // When
      const percentage = calculator.getRMPercentage(1);

      // Then
      expect(percentage).toBe(100);
    });

    test('should return 75% for 10 reps', () => {
      // When
      const percentage = calculator.getRMPercentage(10);

      // Then
      expect(percentage).toBe(75);
    });

    test('should return 57% for 20 reps', () => {
      // When
      const percentage = calculator.getRMPercentage(20);

      // Then
      expect(percentage).toBe(57);
    });

    test('should interpolate for reps > 20', () => {
      // When
      const percentage25 = calculator.getRMPercentage(25);

      // Then
      // Expected: 57 - (25 - 20) × 0.5 = 57 - 2.5 = 54.5
      expect(percentage25).toBeCloseTo(54.5, 1);
    });

    test('should never return less than 50%', () => {
      // When
      const percentage100 = calculator.getRMPercentage(100);

      // Then
      expect(percentage100).toBeGreaterThanOrEqual(50);
    });

    test('should return correct percentages for reps 1-12', () => {
      // Given - RM percentage table from GAME_LOGIC.md
      const expectedTable = {
        1: 100, 2: 95, 3: 90, 4: 88, 5: 86, 6: 83,
        7: 80, 8: 78, 9: 76, 10: 75, 11: 72, 12: 70
      };

      // When & Then
      Object.entries(expectedTable).forEach(([reps, expected]) => {
        const result = calculator.getRMPercentage(Number(reps));
        expect(result).toBe(expected);
      });
    });
  });

  describe('calculate1RMFromPercentage', () => {
    test('should calculate 1RM from weight and RM percentage', () => {
      // Given - User lifted 60kg for 10 reps (75% of 1RM)
      const weight = 60;
      const reps = 10;

      // When
      const result = calculator.calculate1RMFromPercentage(weight, reps);

      // Then
      // Expected: 60 / 0.75 = 80kg
      expect(result).toBeCloseTo(80, 1);
    });

    test('should match calculate1RM result approximately', () => {
      // Given
      const weight = 60;
      const reps = 10;

      // When
      const directCalculation = calculator.calculate1RM(weight, reps);
      const percentageCalculation = calculator.calculate1RMFromPercentage(weight, reps);

      // Then - Both methods should give similar results (within 10% tolerance)
      const difference = Math.abs(directCalculation - percentageCalculation);
      const tolerance = directCalculation * 0.1; // 10% tolerance
      expect(difference).toBeLessThan(tolerance);
    });
  });
});
