import { MealEntry, NutritionSummary, DailySummary, FilterOptions, DailyLog } from './types';
import { startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

export const calculateSummary = (meals: MealEntry[]): NutritionSummary => {
  if (meals.length === 0) {
    return {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalSugar: 0,
      totalFat: 0,
      totalFiber: 0,
      avgCalories: 0,
      mealCount: 0,
    };
  }

  const totals = meals.reduce(
    (acc, meal) => ({
      totalCalories: acc.totalCalories + (meal.calories || 0),
      totalProtein: acc.totalProtein + (meal.protein || 0),
      totalCarbs: acc.totalCarbs + (meal.carbs || 0),
      totalSugar: acc.totalSugar + (meal['added sugar'] || 0),
      totalFat: acc.totalFat + (meal.fat || 0),
      totalFiber: acc.totalFiber + (meal.fiber || 0),
    }),
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalSugar: 0,
      totalFat: 0,
      totalFiber: 0,
    }
  );

  return {
    ...totals,
    avgCalories: Math.round(totals.totalCalories / meals.length),
    mealCount: meals.length,
  };
};

export const getDailySummaries = (meals: MealEntry[]): DailySummary[] => {
  const dailyMap = new Map<string, MealEntry[]>();

  // Group meals by date
  meals.forEach(meal => {
    const date = meal.date;
    if (!dailyMap.has(date)) {
      dailyMap.set(date, []);
    }
    dailyMap.get(date)!.push(meal);
  });

  // Calculate summary for each day
  const summaries: DailySummary[] = [];
  dailyMap.forEach((dayMeals, date) => {
    const summary = calculateSummary(dayMeals);
    summaries.push({
      date,
      calories: summary.totalCalories,
      protein: summary.totalProtein,
      carbs: summary.totalCarbs,
      'added sugar': summary.totalSugar,
      fat: summary.totalFat,
      fiber: summary.totalFiber,
      mealCount: dayMeals.length,
    });
  });

  // Sort by date (newest first)
  return summaries.sort((a, b) => b.date.localeCompare(a.date));
};

export const filterMeals = (meals: MealEntry[], filters: FilterOptions): MealEntry[] => {
  return meals.filter(meal => {
    // Filter by date range
    if (filters.startDate || filters.endDate) {
      const mealDate = parseISO(meal.date);
      const start = filters.startDate ? startOfDay(parseISO(filters.startDate)) : new Date(0);
      const end = filters.endDate ? endOfDay(parseISO(filters.endDate)) : new Date(8640000000000000);

      if (!isWithinInterval(mealDate, { start, end })) {
        return false;
      }
    }

    // Filter by meal type
    if (filters.mealType && filters.mealType !== 'all' && meal.mealType !== filters.mealType) {
      return false;
    }

    // Filter by search term (in notes)
    if (filters.searchTerm && meal.notes) {
      const searchLower = filters.searchTerm.toLowerCase();
      if (!meal.notes.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    return true;
  });
};

export const exportToCSV = (meals: MealEntry[], dailyLogs: DailyLog[] = []): string => {
  const logsByDate = new Map(dailyLogs.map(l => [l.date, l]));

  // Aggregate meals by date
  const dailyMap = new Map<string, { calories: number; protein: number; carbs: number; sugar: number; fat: number; fiber: number; mealCount: number }>();
  meals.forEach(meal => {
    const existing = dailyMap.get(meal.date) ?? { calories: 0, protein: 0, carbs: 0, sugar: 0, fat: 0, fiber: 0, mealCount: 0 };
    dailyMap.set(meal.date, {
      calories: existing.calories + (meal.calories ?? 0),
      protein: existing.protein + (meal.protein ?? 0),
      carbs: existing.carbs + (meal.carbs ?? 0),
      sugar: existing.sugar + (meal['added sugar'] ?? (meal as any)['added_sugar'] ?? 0),
      fat: existing.fat + (meal.fat ?? 0),
      fiber: existing.fiber + (meal.fiber ?? 0),
      mealCount: existing.mealCount + 1,
    });
  });

  // Collect all dates (from meals and daily logs), sorted
  const allDates = Array.from(new Set([...dailyMap.keys(), ...logsByDate.keys()])).sort();

  const headers = [
    'Date',
    'Meals',
    'Calories',
    'Protein (g)',
    'Carbs (g)',
    'Added Sugar (g)',
    'Fat (g)',
    'Fiber (g)',
    'Workout',
    'Bodyweight (lbs)',
    'Stress',
  ];

  const rows = allDates.map(date => {
    const day = dailyMap.get(date);
    const log = logsByDate.get(date);
    return [
      date,
      day?.mealCount.toString() || '0',
      day?.calories.toString() || '',
      day?.protein.toString() || '',
      day?.carbs.toString() || '',
      day?.sugar.toString() || '',
      day?.fat.toString() || '',
      day?.fiber.toString() || '',
      log?.workout || '',
      log?.bodyweight?.toString() || '',
      log?.stress?.toString() || '',
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string = 'nutrition-data.csv'): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
