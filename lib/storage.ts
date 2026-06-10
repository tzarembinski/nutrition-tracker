import { MealEntry, DailyLog } from './types';

const STORAGE_KEY = 'nutrition-tracker-meals';
const DAILY_LOG_KEY = 'nutrition-tracker-daily-logs';

export const storageUtils = {
  // Get all meal entries from localStorage
  getAllMeals: (): MealEntry[] => {
    if (typeof window === 'undefined') {
      console.log('[Storage] Running on server-side, returning empty array');
      return [];
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const meals = data ? JSON.parse(data) : [];
      console.log(`[Storage] Loaded ${meals.length} meal(s) from localStorage`);
      return meals;
    } catch (error) {
      console.error('[Storage] Error reading from localStorage:', error);
      return [];
    }
  },

  // Save a new meal entry
  saveMeal: (meal: MealEntry): void => {
    if (typeof window === 'undefined') {
      console.log('[Storage] Running on server-side, skipping save');
      return;
    }

    try {
      const meals = storageUtils.getAllMeals();
      meals.push(meal);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
      console.log(`[Storage] Saved meal with ID ${meal.id}. Total meals: ${meals.length}`);
      console.log('[Storage] Meal details:', {
        date: meal.date,
        mealType: meal.mealType,
        calories: meal.calories,
        protein: meal.protein
      });
    } catch (error) {
      console.error('[Storage] Error saving to localStorage:', error);
    }
  },

  // Update an existing meal entry
  updateMeal: (updatedMeal: MealEntry): void => {
    if (typeof window === 'undefined') {
      console.log('[Storage] Running on server-side, skipping update');
      return;
    }

    try {
      const meals = storageUtils.getAllMeals();
      const index = meals.findIndex(m => m.id === updatedMeal.id);

      if (index !== -1) {
        meals[index] = updatedMeal;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
        console.log(`[Storage] Updated meal with ID ${updatedMeal.id}`);
        console.log('[Storage] Updated meal details:', {
          date: updatedMeal.date,
          mealType: updatedMeal.mealType,
          calories: updatedMeal.calories
        });
      } else {
        console.warn(`[Storage] Meal with ID ${updatedMeal.id} not found for update`);
      }
    } catch (error) {
      console.error('[Storage] Error updating localStorage:', error);
    }
  },

  // Delete a meal entry
  deleteMeal: (id: string): void => {
    if (typeof window === 'undefined') {
      console.log('[Storage] Running on server-side, skipping delete');
      return;
    }

    try {
      const meals = storageUtils.getAllMeals();
      const filteredMeals = meals.filter(m => m.id !== id);
      const deletedCount = meals.length - filteredMeals.length;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredMeals));
      console.log(`[Storage] Deleted meal with ID ${id}. Removed ${deletedCount} meal(s). Remaining: ${filteredMeals.length}`);
    } catch (error) {
      console.error('[Storage] Error deleting from localStorage:', error);
    }
  },

  // Clear all data
  clearAll: (): void => {
    if (typeof window === 'undefined') {
      console.log('[Storage] Running on server-side, skipping clear');
      return;
    }

    try {
      const mealCount = storageUtils.getAllMeals().length;
      localStorage.removeItem(STORAGE_KEY);
      console.log(`[Storage] Cleared all data. Removed ${mealCount} meal(s)`);
    } catch (error) {
      console.error('[Storage] Error clearing localStorage:', error);
    }
  },
};

export const dailyLogStorage = {
  getAll: (): DailyLog[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(DAILY_LOG_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  save: (log: DailyLog): void => {
    if (typeof window === 'undefined') return;
    try {
      const logs = dailyLogStorage.getAll();
      const existing = logs.findIndex(l => l.date === log.date);
      if (existing !== -1) {
        logs[existing] = log;
      } else {
        logs.push(log);
      }
      localStorage.setItem(DAILY_LOG_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('[Storage] Error saving daily log:', error);
    }
  },

  delete: (id: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const logs = dailyLogStorage.getAll().filter(l => l.id !== id);
      localStorage.setItem(DAILY_LOG_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('[Storage] Error deleting daily log:', error);
    }
  },
};
