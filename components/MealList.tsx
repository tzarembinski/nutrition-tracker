'use client';

import { MealEntry } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface MealListProps {
  meals: MealEntry[];
  onEdit?: (meal: MealEntry) => void;
  onDelete?: (id: string) => void;
}

const mealTypeColors = {
  breakfast: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  lunch: 'bg-green-100 text-green-800 border-green-300',
  dinner: 'bg-blue-100 text-blue-800 border-blue-300',
  snack: 'bg-purple-100 text-purple-800 border-purple-300',
};

const mealTypeLabels = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function MealList({ meals, onEdit, onDelete }: MealListProps) {
  if (meals.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">No meals found</p>
        <p className="text-gray-400 text-sm mt-2">Start by adding your first meal entry</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meals.map(meal => (
        <div
          key={meal.id}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Left side - Date and meal type */}
            <div className="flex-shrink-0">
              <div className="text-sm text-gray-500">
                {format(parseISO(meal.date), 'MMM dd, yyyy')}
              </div>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium border ${
                  mealTypeColors[meal.mealType]
                }`}
              >
                {mealTypeLabels[meal.mealType]}
              </span>
            </div>

            {/* Middle - Nutrition info */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <div className="text-xs text-gray-500">Calories</div>
                <div className="text-sm font-semibold">{meal.calories}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Protein</div>
                <div className="text-sm font-semibold">{meal.protein}g</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Carbs</div>
                <div className="text-sm font-semibold">{meal.carbs}g</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Added Sugar</div>
                <div className="text-sm font-semibold">{meal['added sugar']}g</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Fat</div>
                <div className="text-sm font-semibold">{meal.fat}g</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Fiber</div>
                <div className="text-sm font-semibold">{meal.fiber}g</div>
              </div>
            </div>

            {/* Right side - Actions */}
            {(onEdit || onDelete) && (
              <div className="flex gap-2 flex-shrink-0">
                {onEdit && (
                  <button
                    onClick={() => onEdit(meal)}
                    className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this meal entry?')) {
                        onDelete(meal.id);
                      }
                    }}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          {meal.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Notes:</div>
              <div className="text-sm text-gray-700">{meal.notes}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
