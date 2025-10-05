import { MealEntry, NutritionSummary, DailySummary, FilterOptions } from './types';
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
      totalCalories: acc.totalCalories + meal.calories,
      totalProtein: acc.totalProtein + meal.protein,
      totalCarbs: acc.totalCarbs + meal.carbs,
      totalSugar: acc.totalSugar + meal.sugar,
      totalFat: acc.totalFat + meal.fat,
      totalFiber: acc.totalFiber + meal.fiber,
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
      sugar: summary.totalSugar,
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

export const exportToCSV = (meals: MealEntry[]): string => {
  const headers = [
    'Date',
    'Meal Type',
    'Calories',
    'Protein (g)',
    'Carbs (g)',
    'Sugar (g)',
    'Fat (g)',
    'Fiber (g)',
    'Notes',
  ];

  const rows = meals.map(meal => [
    meal.date,
    meal.mealType,
    meal.calories.toString(),
    meal.protein.toString(),
    meal.carbs.toString(),
    meal.sugar.toString(),
    meal.fat.toString(),
    meal.fiber.toString(),
    meal.notes || '',
  ]);

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
