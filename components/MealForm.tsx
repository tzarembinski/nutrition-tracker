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
  const [mealType, setMealType] = useState<MealType>(initialData?.mealType || 'other');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [useManualEntry, setUseManualEntry] = useState(false);

  // Manual entry fields
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualSugar, setManualSugar] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualFiber, setManualFiber] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  const decodeIfNeeded = (text: string): string => {
    // Remove "said:" prefix and any text before it (case-insensitive)
    text = text.replace(/^.*?said:\s*/i, '').trim();

    // Check if text looks URL-encoded
    if (text.includes('%')) {
      try {
        return decodeURIComponent(text);
      } catch (e) {
        console.warn('URL decode failed, using original text:', e);
        return text; // If decoding fails, return original
      }
    }
    return text;
  };

  const validateAndParse = (jsonString: string): Omit<MealEntry, 'id'> | null => {
    try {
      // Decode URL-encoded content if needed (for iPhone paste)
      const decodedString = decodeIfNeeded(jsonString);
      const parsed = JSON.parse(decodedString);
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
        mealType: mealType,
        calories: parsed.calories,
        protein: parsed.protein,
        carbs: parsed.carbs,
        'added sugar': parsed['added sugar'],
        fat: parsed.fat,
        fiber: parsed.fiber,
        notes: parsed.notes,
      };
    } catch (e) {
      setError(`Invalid JSON format. Please check your input and try again.\n\nTip: Copy only the JSON data (starting with { and ending with })\n\nExpected format:\n{\n  "calories": 850,\n  "protein": 55,\n  "carbs": 85,\n  "added sugar": 12,\n  "fat": 30,\n  "fiber": 8,\n  "notes": "Meal description"\n}`);
      return null;
    }
  };

  const validateManualEntry = (): Omit<MealEntry, 'id'> | null => {
    const errors: string[] = [];
    const invalidFields: string[] = [];

    // Check required fields
    if (!manualCalories) errors.push('Calories');
    if (!manualProtein) errors.push('Protein');
    if (!manualCarbs) errors.push('Carbohydrates');
    if (!manualSugar) errors.push('Added Sugar');
    if (!manualFat) errors.push('Fat');
    if (!manualFiber) errors.push('Fiber');

    if (errors.length > 0) {
      setError(`Please fill in all required fields: ${errors.join(', ')}`);
      return null;
    }

    // Validate numeric fields
    const calories = parseFloat(manualCalories);
    const protein = parseFloat(manualProtein);
    const carbs = parseFloat(manualCarbs);
    const sugar = parseFloat(manualSugar);
    const fat = parseFloat(manualFat);
    const fiber = parseFloat(manualFiber);

    if (isNaN(calories) || calories < 0) invalidFields.push('Calories');
    if (isNaN(protein) || protein < 0) invalidFields.push('Protein');
    if (isNaN(carbs) || carbs < 0) invalidFields.push('Carbohydrates');
    if (isNaN(sugar) || sugar < 0) invalidFields.push('Added Sugar');
    if (isNaN(fat) || fat < 0) invalidFields.push('Fat');
    if (isNaN(fiber) || fiber < 0) invalidFields.push('Fiber');

    if (invalidFields.length > 0) {
      setError(`Please enter valid numbers for: ${invalidFields.join(', ')}`);
      return null;
    }

    return {
      date: format(new Date(), 'yyyy-MM-dd'),
      mealType: mealType,
      calories: calories,
      protein: protein,
      carbs: carbs,
      'added sugar': sugar,
      fat: fat,
      fiber: fiber,
      notes: manualNotes || undefined,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    let parsedData: Omit<MealEntry, 'id'> | null;

    if (useManualEntry) {
      parsedData = validateManualEntry();
    } else {
      parsedData = validateAndParse(jsonInput);
    }

    if (!parsedData) {
      return;
    }

    onSubmit(parsedData);

    // Show success message with values
    setSuccess(`Entry saved successfully!\nCalories: ${parsedData.calories}\nProtein: ${parsedData.protein}g\nCarbs: ${parsedData.carbs}g\nAdded Sugar: ${parsedData['added sugar']}g\nFat: ${parsedData.fat}g\nFiber: ${parsedData.fiber}g${parsedData.notes ? `\nNotes: ${parsedData.notes}` : ''}`);

    // Clear form
    if (useManualEntry) {
      setManualCalories('');
      setManualProtein('');
      setManualCarbs('');
      setManualSugar('');
      setManualFat('');
      setManualFiber('');
      setManualNotes('');
    } else {
      setJsonInput('');
    }
  };

  const handleClear = () => {
    const hasContent = jsonInput.trim() || manualCalories || manualProtein || manualCarbs || manualSugar || manualFat || manualFiber || manualNotes;
    if (hasContent && !window.confirm('Are you sure you want to clear all fields?')) {
      return;
    }
    setJsonInput('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualSugar('');
    setManualFat('');
    setManualFiber('');
    setManualNotes('');
    setMealType('other');
    setError('');
    setSuccess('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-1">
          Meal Type
        </label>
        <select
          id="mealType"
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="other">Other</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>

      {/* Input Mode Toggle */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setUseManualEntry(false)}
          className={`flex-1 pb-3 px-4 font-medium text-sm ${
            !useManualEntry
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Paste JSON
        </button>
        <button
          type="button"
          onClick={() => setUseManualEntry(true)}
          className={`flex-1 pb-3 px-4 font-medium text-sm ${
            useManualEntry
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Manual Entry
        </button>
      </div>

      {!useManualEntry ? (
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
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="manualCalories" className="block text-sm font-medium text-gray-700 mb-1">
                Calories <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="manualCalories"
                value={manualCalories}
                onChange={(e) => {
                  setManualCalories(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="850"
              />
            </div>
            <div>
              <label htmlFor="manualProtein" className="block text-sm font-medium text-gray-700 mb-1">
                Protein (g) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="manualProtein"
                value={manualProtein}
                onChange={(e) => {
                  setManualProtein(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="55"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="manualCarbs" className="block text-sm font-medium text-gray-700 mb-1">
                Carbohydrates (g) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="manualCarbs"
                value={manualCarbs}
                onChange={(e) => {
                  setManualCarbs(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="85"
              />
            </div>
            <div>
              <label htmlFor="manualSugar" className="block text-sm font-medium text-gray-700 mb-1">
                Added Sugar (g) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="manualSugar"
                value={manualSugar}
                onChange={(e) => {
                  setManualSugar(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="manualFat" className="block text-sm font-medium text-gray-700 mb-1">
                Fat (g) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="manualFat"
                value={manualFat}
                onChange={(e) => {
                  setManualFat(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="30"
              />
            </div>
            <div>
              <label htmlFor="manualFiber" className="block text-sm font-medium text-gray-700 mb-1">
                Fiber (g) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="manualFiber"
                value={manualFiber}
                onChange={(e) => {
                  setManualFiber(e.target.value);
                  setError('');
                  setSuccess('');
                }}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="8"
              />
            </div>
          </div>

          <div>
            <label htmlFor="manualNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Meal Description (optional)
            </label>
            <textarea
              id="manualNotes"
              value={manualNotes}
              onChange={(e) => {
                setManualNotes(e.target.value);
                setError('');
                setSuccess('');
              }}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Grilled chicken with brown rice and vegetables"
            />
          </div>
        </div>
      )}

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
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          Clear All
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
