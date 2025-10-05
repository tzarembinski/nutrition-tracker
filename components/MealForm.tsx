'use client';

import { useState } from 'react';
import { MealEntry, MealType } from '@/lib/types';
import { format } from 'date-fns';

interface MealFormProps {
  onSubmit: (meal: Omit<MealEntry, 'id'>) => void;
  initialData?: MealEntry;
  onCancel?: () => void;
}

export default function MealForm({ onSubmit, initialData, onCancel }: MealFormProps) {
  const [formData, setFormData] = useState({
    date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
    mealType: (initialData?.mealType || 'breakfast') as MealType,
    calories: initialData?.calories?.toString() || '',
    protein: initialData?.protein?.toString() || '',
    carbs: initialData?.carbs?.toString() || '',
    sugar: initialData?.sugar?.toString() || '',
    fat: initialData?.fat?.toString() || '',
    fiber: initialData?.fiber?.toString() || '',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate date
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (selectedDate > today) {
        newErrors.date = 'Future dates are not allowed';
      }
    }

    // Validate nutrition values
    const numericFields = ['calories', 'protein', 'carbs', 'sugar', 'fat', 'fiber'];

    numericFields.forEach(field => {
      const value = formData[field as keyof typeof formData];

      if (!value) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        return;
      }

      const num = parseFloat(value as string);

      if (isNaN(num)) {
        newErrors[field] = 'Must be a valid number';
      } else if (num < 0) {
        newErrors[field] = 'Must be a positive number';
      } else if (num >= 10000) {
        newErrors[field] = 'Must be less than 10,000';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const mealData: Omit<MealEntry, 'id'> = {
      date: formData.date,
      mealType: formData.mealType,
      calories: parseFloat(formData.calories),
      protein: parseFloat(formData.protein),
      carbs: parseFloat(formData.carbs),
      sugar: parseFloat(formData.sugar),
      fat: parseFloat(formData.fat),
      fiber: parseFloat(formData.fiber),
      notes: formData.notes || undefined,
    };

    onSubmit(mealData);

    // Reset form if it's not an edit
    if (!initialData) {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        mealType: 'breakfast',
        calories: '',
        protein: '',
        carbs: '',
        sugar: '',
        fat: '',
        fiber: '',
        notes: '',
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={format(new Date(), 'yyyy-MM-dd')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>

        {/* Meal Type */}
        <div>
          <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-1">
            Meal Type *
          </label>
          <select
            id="mealType"
            name="mealType"
            value={formData.mealType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        {/* Calories */}
        <div>
          <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
            Calories *
          </label>
          <input
            type="number"
            id="calories"
            name="calories"
            value={formData.calories}
            onChange={handleChange}
            step="0.1"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.calories ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.calories && <p className="text-red-500 text-xs mt-1">{errors.calories}</p>}
        </div>

        {/* Protein */}
        <div>
          <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-1">
            Protein (g) *
          </label>
          <input
            type="number"
            id="protein"
            name="protein"
            value={formData.protein}
            onChange={handleChange}
            step="0.1"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.protein ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.protein && <p className="text-red-500 text-xs mt-1">{errors.protein}</p>}
        </div>

        {/* Carbs */}
        <div>
          <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 mb-1">
            Carbohydrates (g) *
          </label>
          <input
            type="number"
            id="carbs"
            name="carbs"
            value={formData.carbs}
            onChange={handleChange}
            step="0.1"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.carbs ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.carbs && <p className="text-red-500 text-xs mt-1">{errors.carbs}</p>}
        </div>

        {/* Sugar */}
        <div>
          <label htmlFor="sugar" className="block text-sm font-medium text-gray-700 mb-1">
            Sugar (g) *
          </label>
          <input
            type="number"
            id="sugar"
            name="sugar"
            value={formData.sugar}
            onChange={handleChange}
            step="0.1"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.sugar ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.sugar && <p className="text-red-500 text-xs mt-1">{errors.sugar}</p>}
        </div>

        {/* Fat */}
        <div>
          <label htmlFor="fat" className="block text-sm font-medium text-gray-700 mb-1">
            Fat (g) *
          </label>
          <input
            type="number"
            id="fat"
            name="fat"
            value={formData.fat}
            onChange={handleChange}
            step="0.1"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.fat ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fat && <p className="text-red-500 text-xs mt-1">{errors.fat}</p>}
        </div>

        {/* Fiber */}
        <div>
          <label htmlFor="fiber" className="block text-sm font-medium text-gray-700 mb-1">
            Fiber (g) *
          </label>
          <input
            type="number"
            id="fiber"
            name="fiber"
            value={formData.fiber}
            onChange={handleChange}
            step="0.1"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.fiber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fiber && <p className="text-red-500 text-xs mt-1">{errors.fiber}</p>}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Add meal details, ingredients, or other notes..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          {initialData ? 'Update Meal' : 'Add Meal'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
