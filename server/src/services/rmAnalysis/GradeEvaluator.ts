/**
 * GradeEvaluator - Performance Grade Evaluator
 *
 * Evaluates workout performance based on bodyweight ratio
 * Grades: Bronze → Silver → Gold → Platinum → Diamond → Master → Challenger
 *
 * TDD Phase: GREEN
 * Status: Minimal implementation to pass tests
 */

/**
 * Grade tier type definition
 */
export type Grade =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'challenger';

/**
 * Input parameters for grade evaluation
 */
export interface GradeInput {
  bodyWeight: number; // User's body weight in kg
  weight: number; // Weight lifted in kg
  exercise: string; // Exercise name (e.g., 'deadlift', 'bench_press')
  reps: number; // Number of repetitions
}

/**
 * Grade thresholds for specific bodyweight
 */
interface GradeThresholds {
  bodyWeight: number;
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
  diamond: number;
  master: number;
  challenger: number;
}

/**
 * Exercise-specific grade tables
 */
interface ExerciseGradeTable {
  exercise: string;
  reps: number;
  thresholds: GradeThresholds[];
}

export class GradeEvaluator {
  /**
   * Grade multipliers for EXP calculation
   */
  private static readonly GRADE_MULTIPLIERS: Record<Grade, number> = {
    bronze: 1.0,
    silver: 1.2,
    gold: 1.5,
    platinum: 2.0,
    diamond: 2.5,
    master: 3.0,
    challenger: 4.0,
  };

  /**
   * Deadlift grade thresholds (10 reps)
   * Based on CLAUDE.md specifications
   */
  private static readonly DEADLIFT_10REPS_THRESHOLDS: GradeThresholds[] = [
    {
      bodyWeight: 55,
      bronze: 20,
      silver: 30,
      gold: 40,
      platinum: 60,
      diamond: 80,
      master: 90,
      challenger: 100,
    },
    {
      bodyWeight: 60,
      bronze: 20,
      silver: 35,
      gold: 50,
      platinum: 65,
      diamond: 85,
      master: 100,
      challenger: 130,
    },
    {
      bodyWeight: 65,
      bronze: 20,
      silver: 40,
      gold: 50,
      platinum: 70,
      diamond: 85,
      master: 110,
      challenger: 140,
    },
    {
      bodyWeight: 70,
      bronze: 20,
      silver: 45,
      gold: 60,
      platinum: 70,
      diamond: 90,
      master: 115,
      challenger: 155,
    },
    {
      bodyWeight: 75,
      bronze: 20,
      silver: 50,
      gold: 65,
      platinum: 80,
      diamond: 100,
      master: 120,
      challenger: 160,
    },
  ];

  /**
   * Bench press grade thresholds (10 reps)
   * Approximate values - to be refined based on user data
   */
  private static readonly BENCH_PRESS_10REPS_THRESHOLDS: GradeThresholds[] = [
    {
      bodyWeight: 55,
      bronze: 15,
      silver: 25,
      gold: 35,
      platinum: 45,
      diamond: 55,
      master: 65,
      challenger: 80,
    },
    {
      bodyWeight: 60,
      bronze: 15,
      silver: 30,
      gold: 40,
      platinum: 50,
      diamond: 60,
      master: 70,
      challenger: 90,
    },
    {
      bodyWeight: 65,
      bronze: 15,
      silver: 35,
      gold: 45,
      platinum: 55,
      diamond: 65,
      master: 80,
      challenger: 100,
    },
    {
      bodyWeight: 70,
      bronze: 15,
      silver: 40,
      gold: 50,
      platinum: 60,
      diamond: 70,
      master: 85,
      challenger: 110,
    },
    {
      bodyWeight: 75,
      bronze: 15,
      silver: 45,
      gold: 55,
      platinum: 65,
      diamond: 80,
      master: 95,
      challenger: 120,
    },
  ];

  /**
   * Squat grade thresholds (10 reps)
   * Approximate values - to be refined based on user data
   */
  private static readonly SQUAT_10REPS_THRESHOLDS: GradeThresholds[] = [
    {
      bodyWeight: 55,
      bronze: 20,
      silver: 35,
      gold: 50,
      platinum: 65,
      diamond: 80,
      master: 95,
      challenger: 110,
    },
    {
      bodyWeight: 60,
      bronze: 20,
      silver: 40,
      gold: 55,
      platinum: 70,
      diamond: 90,
      master: 105,
      challenger: 130,
    },
    {
      bodyWeight: 65,
      bronze: 20,
      silver: 45,
      gold: 60,
      platinum: 80,
      diamond: 95,
      master: 115,
      challenger: 145,
    },
    {
      bodyWeight: 70,
      bronze: 20,
      silver: 50,
      gold: 70,
      platinum: 85,
      diamond: 105,
      master: 125,
      challenger: 160,
    },
    {
      bodyWeight: 75,
      bronze: 20,
      silver: 55,
      gold: 75,
      platinum: 95,
      diamond: 115,
      master: 135,
      challenger: 175,
    },
  ];

  /**
   * Evaluate performance grade based on bodyweight ratio
   *
   * @param input - Grade evaluation parameters
   * @returns Performance grade (bronze to challenger)
   *
   * @example
   * ```typescript
   * const evaluator = new GradeEvaluator();
   * const grade = evaluator.evaluateGrade({
   *   bodyWeight: 70,
   *   weight: 60,
   *   exercise: 'deadlift',
   *   reps: 10
   * });
   * // Returns: 'gold'
   * ```
   */
  evaluateGrade(input: GradeInput): Grade {
    // Get appropriate threshold table for exercise
    const thresholds = this.getThresholdsForExercise(
      input.exercise,
      input.reps
    );

    // Find thresholds for user's bodyweight (with interpolation)
    const userThresholds = this.findThresholdsForBodyweight(
      thresholds,
      input.bodyWeight
    );

    // Determine grade based on weight
    if (input.weight >= userThresholds.challenger) return 'challenger';
    if (input.weight >= userThresholds.master) return 'master';
    if (input.weight >= userThresholds.diamond) return 'diamond';
    if (input.weight >= userThresholds.platinum) return 'platinum';
    if (input.weight >= userThresholds.gold) return 'gold';
    if (input.weight >= userThresholds.silver) return 'silver';
    return 'bronze';
  }

  /**
   * Get EXP multiplier for given grade
   *
   * @param grade - Performance grade
   * @returns EXP multiplier (1.0 to 4.0)
   */
  getGradeMultiplier(grade: Grade): number {
    return GradeEvaluator.GRADE_MULTIPLIERS[grade];
  }

  /**
   * Get threshold table for specific exercise and rep count
   *
   * @param exercise - Exercise name
   * @param reps - Number of repetitions
   * @returns Array of grade thresholds
   */
  private getThresholdsForExercise(
    exercise: string,
    reps: number
  ): GradeThresholds[] {
    // Normalize exercise name
    const exerciseName = exercise.toLowerCase().replace(/_/g, '');

    // Select appropriate threshold table based on reps
    // For different rep counts, we use interpolation or closest match
    // Currently supporting: 5, 8, 10, 12, 15 reps
    let repCategory: number;
    if (reps <= 6) {
      repCategory = 5; // 1-6 reps → use 5 rep thresholds (scaled down)
    } else if (reps <= 9) {
      repCategory = 8; // 7-9 reps → use 8 rep thresholds
    } else if (reps <= 11) {
      repCategory = 10; // 10-11 reps → use 10 rep thresholds
    } else if (reps <= 13) {
      repCategory = 12; // 12-13 reps → use 12 rep thresholds (scaled up)
    } else {
      repCategory = 15; // 14+ reps → use 15 rep thresholds (scaled up)
    }

    // Get base thresholds for 10 reps
    let baseThresholds: GradeThresholds[];
    if (exerciseName.includes('deadlift')) {
      baseThresholds = GradeEvaluator.DEADLIFT_10REPS_THRESHOLDS;
    } else if (exerciseName.includes('bench') || exerciseName.includes('press')) {
      baseThresholds = GradeEvaluator.BENCH_PRESS_10REPS_THRESHOLDS;
    } else if (exerciseName.includes('squat')) {
      baseThresholds = GradeEvaluator.SQUAT_10REPS_THRESHOLDS;
    } else {
      // Default to deadlift thresholds
      baseThresholds = GradeEvaluator.DEADLIFT_10REPS_THRESHOLDS;
    }

    // Scale thresholds based on rep count
    // Lower reps = higher weight thresholds, higher reps = lower weight thresholds
    // Using Epley formula approximation: weight at N reps ≈ weight at 10 reps × (1 + (10-N)/30)
    const scaleFactor = repCategory === 10 ? 1.0 : repCategory < 10 
      ? 1 + (10 - repCategory) / 30  // Heavier for fewer reps
      : 1 - (repCategory - 10) / 40; // Lighter for more reps

    return baseThresholds.map((threshold) => ({
      ...threshold,
      bronze: Math.round(threshold.bronze * scaleFactor),
      silver: Math.round(threshold.silver * scaleFactor),
      gold: Math.round(threshold.gold * scaleFactor),
      platinum: Math.round(threshold.platinum * scaleFactor),
      diamond: Math.round(threshold.diamond * scaleFactor),
      master: Math.round(threshold.master * scaleFactor),
      challenger: Math.round(threshold.challenger * scaleFactor),
    }));
  }

  /**
   * Find grade thresholds for user's bodyweight with interpolation
   *
   * @param thresholds - Array of threshold data points
   * @param bodyWeight - User's bodyweight
   * @returns Interpolated thresholds for user's bodyweight
   */
  private findThresholdsForBodyweight(
    thresholds: GradeThresholds[],
    bodyWeight: number
  ): Omit<GradeThresholds, 'bodyWeight'> {
    // If bodyweight matches a table entry exactly
    const exactMatch = thresholds.find((t) => t.bodyWeight === bodyWeight);
    if (exactMatch) {
      const { bodyWeight: _, ...rest } = exactMatch;
      return rest;
    }

    // Find surrounding data points for interpolation
    let lower: GradeThresholds | null = null;
    let upper: GradeThresholds | null = null;

    for (let i = 0; i < thresholds.length; i++) {
      if (thresholds[i].bodyWeight < bodyWeight) {
        lower = thresholds[i];
      }
      if (thresholds[i].bodyWeight > bodyWeight && !upper) {
        upper = thresholds[i];
        break;
      }
    }

    // If bodyweight is below minimum, use minimum thresholds
    if (!lower) {
      const { bodyWeight: _, ...rest } = thresholds[0];
      return rest;
    }

    // If bodyweight is above maximum, use maximum thresholds
    if (!upper) {
      const { bodyWeight: _, ...rest } = thresholds[thresholds.length - 1];
      return rest;
    }

    // Linear interpolation between lower and upper
    const ratio =
      (bodyWeight - lower.bodyWeight) / (upper.bodyWeight - lower.bodyWeight);

    return {
      bronze: this.interpolate(lower.bronze, upper.bronze, ratio),
      silver: this.interpolate(lower.silver, upper.silver, ratio),
      gold: this.interpolate(lower.gold, upper.gold, ratio),
      platinum: this.interpolate(lower.platinum, upper.platinum, ratio),
      diamond: this.interpolate(lower.diamond, upper.diamond, ratio),
      master: this.interpolate(lower.master, upper.master, ratio),
      challenger: this.interpolate(lower.challenger, upper.challenger, ratio),
    };
  }

  /**
   * Linear interpolation helper
   *
   * @param a - Lower bound value
   * @param b - Upper bound value
   * @param ratio - Interpolation ratio (0 to 1)
   * @returns Interpolated value
   */
  private interpolate(a: number, b: number, ratio: number): number {
    return a + (b - a) * ratio;
  }
}
