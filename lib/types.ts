export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

export interface MealEntry {
  id: string;
  date: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  'added sugar': number;
  fat: number;
  fiber: number;
  notes?: string;
}

export interface NutritionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalSugar: number;
  totalFat: number;
  totalFiber: number;
  avgCalories: number;
  mealCount: number;
}

export interface DailySummary {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  'added sugar': number;
  fat: number;
  fiber: number;
  mealCount: number;
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  mealType?: MealType | 'all';
  searchTerm?: string;
}
