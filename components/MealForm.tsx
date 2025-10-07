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
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateAndParse = (jsonString: string): Omit<MealEntry, 'id'> | null => {
    try {
      const parsed = JSON.parse(jsonString);
      const errors: string[] = [];

      // Required fields
      const requiredFields = ['calories', 'protein', 'carbs', 'added sugar', 'fat', 'fiber'];
      const missingFields = requiredFields.filter(field => !(field in parsed));

      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        return null;
      }

      // Validate numeric fields
      const numericFields = ['calories', 'protein', 'carbs', 'added sugar', 'fat', 'fiber'];
      for (const field of numericFields) {
        const value = parsed[field];
        if (typeof value !== 'number' || isNaN(value)) {
          setError(`Invalid number for ${field}: must be a valid number`);
          return null;
        }
        if (value < 0) {
          setError(`Invalid number for ${field}: must be a positive number`);
          return null;
        }
        if (value >= 10000) {
          setError(`Invalid number for ${field}: must be less than 10,000`);
          return null;
        }
      }

      // Optional notes field
      if (parsed.notes !== undefined && typeof parsed.notes !== 'string') {
        setError('Notes must be a string');
        return null;
      }

      return {
        date: format(new Date(), 'yyyy-MM-dd'),
        mealType: 'breakfast',
        calories: parsed.calories,
        protein: parsed.protein,
        carbs: parsed.carbs,
        'added sugar': parsed['added sugar'],
        fat: parsed.fat,
        fiber: parsed.fiber,
        notes: parsed.notes,
      };
    } catch (e) {
      setError(`Invalid JSON format. Please check and try again.\n\nExpected format:\n{\n  "calories": 850,\n  "protein": 55,\n  "carbs": 85,\n  "added sugar": 12,\n  "fat": 30,\n  "fiber": 8,\n  "notes": "Meal description"\n}`);
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const parsedData = validateAndParse(jsonInput);
    if (!parsedData) {
      return;
    }

    onSubmit(parsedData);

    // Show success message with values
    setSuccess(`Entry saved successfully!\nCalories: ${parsedData.calories}\nProtein: ${parsedData.protein}g\nCarbs: ${parsedData.carbs}g\nAdded Sugar: ${parsedData['added sugar']}g\nFat: ${parsedData.fat}g\nFiber: ${parsedData.fiber}g${parsedData.notes ? `\nNotes: ${parsedData.notes}` : ''}`);

    // Clear form
    setJsonInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="jsonInput" className="block text-sm font-medium text-gray-700 mb-1">
          Paste JSON Nutrition Data
        </label>
        <textarea
          id="jsonInput"
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setError('');
            setSuccess('');
          }}
          rows={12}
          placeholder='Paste JSON nutrition data here&#10;&#10;Example:&#10;{&#10;  "calories": 850,&#10;  "protein": 55,&#10;  "carbs": 85,&#10;  "added sugar": 12,&#10;  "fat": 30,&#10;  "fiber": 8,&#10;  "notes": "Meal description"&#10;}'
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded whitespace-pre-wrap">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded whitespace-pre-wrap">
          {success}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          Parse and Save
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
