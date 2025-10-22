// Daily nutritional benchmarks for a healthy, active adult male
export const DAILY_BENCHMARKS = {
  calories: 2800,
  protein: 100,
  carbohydrates: 400,
  fat: 90,
  addedSugar: 36,
  fiber: 42,
} as const;

// Minimum daily calorie requirement
export const MIN_DAILY_CALORIES = 1500;

export type NutrientType = keyof typeof DAILY_BENCHMARKS;

/**
 * Calculate benchmark value based on number of days
 * @param nutrient - The nutrient type
 * @param numberOfDays - Number of days to scale the benchmark for
 * @returns The scaled benchmark value
 */
export function calculateBenchmark(nutrient: NutrientType, numberOfDays: number): number {
  return DAILY_BENCHMARKS[nutrient] * numberOfDays;
}

/**
 * Format benchmark label for display
 * @param value - The benchmark value
 * @param numberOfDays - Number of days the benchmark covers
 * @param unit - The unit of measurement (e.g., "g", "cal")
 * @returns Formatted benchmark label
 */
export function formatBenchmarkLabel(value: number, numberOfDays: number, unit: string = 'g'): string {
  if (numberOfDays === 1) {
    return `Target: ${value.toLocaleString()}${unit}/day`;
  } else {
    return `Target: ${value.toLocaleString()}${unit} (${numberOfDays} days)`;
  }
}

/**
 * Calculate number of unique days in a date range
 * @param startDate - Start date string (yyyy-MM-dd)
 * @param endDate - End date string (yyyy-MM-dd)
 * @returns Number of days in the range (inclusive)
 */
export function calculateDaysInRange(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  return diffDays;
}
