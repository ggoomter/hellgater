/**
 * RMCalculator - One-Rep Max (1RM) Calculator
 *
 * Calculates 1RM using project-specific formula and RM percentage table
 * Formula: 1RM = weight + (weight × EPLEY_MULTIPLIER × reps)
 *
 * TDD Phase: REFACTOR
 * Status: Optimized with named constants and improved readability
 */

export class RMCalculator {
  /**
   * Epley formula multiplier for 1RM calculation
   * Based on project specifications
   */
  private static readonly EPLEY_MULTIPLIER = 0.025;

  /**
   * Minimum RM percentage for high rep counts
   */
  private static readonly MIN_RM_PERCENTAGE = 50;

  /**
   * Linear interpolation slope for reps > 20
   * Percentage decreases by 0.5% per additional rep
   */
  private static readonly INTERPOLATION_SLOPE = 0.5;

  /**
   * Base percentage at 20 reps for interpolation calculations
   */
  private static readonly BASE_PERCENTAGE_AT_20_REPS = 57;

  /**
   * RM Percentage Table (reps → percentage of 1RM)
   * Based on standard strength training percentages
   */
  private static readonly RM_PERCENTAGE_TABLE: Record<number, number> = {
    1: 100,
    2: 95,
    3: 90,
    4: 88,
    5: 86,
    6: 83,
    7: 80,
    8: 78,
    9: 76,
    10: 75,
    11: 72,
    12: 70,
    13: 68,
    14: 66,
    15: 65,
    16: 63,
    17: 61,
    18: 60,
    19: 58,
    20: 57,
  };

  /**
   * Calculate 1RM (One-Rep Max) using project-specific formula
   *
   * @param weight - Weight lifted (kg)
   * @param reps - Number of repetitions
   * @returns Calculated 1RM in kg
   *
   * @example
   * ```typescript
   * const calculator = new RMCalculator();
   * const oneRM = calculator.calculate1RM(60, 10);
   * // Returns: 75 (60 + 60 * 0.025 * 10)
   * ```
   */
  calculate1RM(weight: number, reps: number): number {
    // Handle edge case: 0 weight
    if (weight === 0) {
      return 0;
    }

    // Formula: 1RM = weight + (weight × EPLEY_MULTIPLIER × reps)
    const additionalWeight = weight * RMCalculator.EPLEY_MULTIPLIER * reps;
    const oneRM = weight + additionalWeight;

    return oneRM;
  }

  /**
   * Get RM percentage for given number of reps
   *
   * @param reps - Number of repetitions
   * @returns RM percentage (0-100)
   *
   * @example
   * ```typescript
   * const calculator = new RMCalculator();
   * const percentage = calculator.getRMPercentage(10);
   * // Returns: 75
   * ```
   */
  getRMPercentage(reps: number): number {
    // For reps 1-20, use lookup table
    if (reps <= 20) {
      return RMCalculator.RM_PERCENTAGE_TABLE[reps];
    }

    // For reps > 20, linear interpolation
    // Formula: BASE_PERCENTAGE_AT_20_REPS - (reps - 20) × INTERPOLATION_SLOPE
    const repsAbove20 = reps - 20;
    const percentage =
      RMCalculator.BASE_PERCENTAGE_AT_20_REPS -
      repsAbove20 * RMCalculator.INTERPOLATION_SLOPE;

    // Never return less than minimum percentage
    return Math.max(RMCalculator.MIN_RM_PERCENTAGE, percentage);
  }

  /**
   * Calculate 1RM from weight and RM percentage
   *
   * @param weight - Weight lifted (kg)
   * @param reps - Number of repetitions
   * @returns Calculated 1RM in kg
   *
   * @example
   * ```typescript
   * const calculator = new RMCalculator();
   * const oneRM = calculator.calculate1RMFromPercentage(60, 10);
   * // 10 reps = 75% of 1RM, so 1RM = 60 / 0.75 = 80kg
   * ```
   */
  calculate1RMFromPercentage(weight: number, reps: number): number {
    const percentage = this.getRMPercentage(reps);
    const oneRM = (weight / percentage) * 100;
    return oneRM;
  }
}
