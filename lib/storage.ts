import { MealEntry } from './types';

const STORAGE_KEY = 'nutrition-tracker-meals';

export const storageUtils = {
  // Get all meal entries from localStorage
  getAllMeals: (): MealEntry[] => {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  // Save a new meal entry
  saveMeal: (meal: MealEntry): void => {
    if (typeof window === 'undefined') return;

    try {
      const meals = storageUtils.getAllMeals();
      meals.push(meal);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Update an existing meal entry
  updateMeal: (updatedMeal: MealEntry): void => {
    if (typeof window === 'undefined') return;

    try {
      const meals = storageUtils.getAllMeals();
      const index = meals.findIndex(m => m.id === updatedMeal.id);

      if (index !== -1) {
        meals[index] = updatedMeal;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  },

  // Delete a meal entry
  deleteMeal: (id: string): void => {
    if (typeof window === 'undefined') return;

    try {
      const meals = storageUtils.getAllMeals();
      const filteredMeals = meals.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredMeals));
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
    }
  },

  // Clear all data
  clearAll: (): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};
