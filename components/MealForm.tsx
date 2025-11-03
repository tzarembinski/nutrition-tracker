'use client';

import { useState } from 'react';
import { MealEntry, MealType } from '@/lib/types';
import { format } from 'date-fns';

interface MealFormProps {
  onSubmit: (meal: Omit<MealEntry, 'id'>) => void;
  onBatchSubmit?: (meals: Omit<MealEntry, 'id'>[]) => void;
  initialData?: MealEntry;
  onCancel?: () => void;
}

export default function MealForm({ onSubmit, onBatchSubmit, initialData, onCancel }: MealFormProps) {
  // Pre-fill JSON input with initialData if editing
  const getInitialJsonInput = () => {
    if (!initialData) return '';

    // Convert date from yyyy-MM-dd to MM/DD/YY
    const dateParts = initialData.date.split('-');
    const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0].slice(2)}`;

    return JSON.stringify({
      date: formattedDate,
      meal_type: initialData.mealType,
      calories: initialData.calories,
      protein: initialData.protein,
      carbs: initialData.carbs,
      'added sugar': initialData['added sugar'],
      fat: initialData.fat,
      fiber: initialData.fiber,
      ...(initialData.notes && { notes: initialData.notes })
    }, null, 2);
  };

  const [jsonInput, setJsonInput] = useState(getInitialJsonInput());
  const [mealType, setMealType] = useState<MealType>(initialData?.mealType || 'other');
  const [selectedDate, setSelectedDate] = useState(initialData?.date || format(new Date(), 'yyyy-MM-dd'));
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [success, setSuccess] = useState('');
  const [useManualEntry, setUseManualEntry] = useState(!!initialData); // Default to manual entry when editing

  // Manual entry fields - pre-fill with initialData if editing
  const [manualCalories, setManualCalories] = useState(initialData?.calories.toString() || '');
  const [manualProtein, setManualProtein] = useState(initialData?.protein.toString() || '');
  const [manualCarbs, setManualCarbs] = useState(initialData?.carbs.toString() || '');
  const [manualSugar, setManualSugar] = useState(initialData?.['added sugar'].toString() || '');
  const [manualFat, setManualFat] = useState(initialData?.fat.toString() || '');
  const [manualFiber, setManualFiber] = useState(initialData?.fiber.toString() || '');
  const [manualNotes, setManualNotes] = useState(initialData?.notes || '');

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

  // Convert MM/DD/YY to yyyy-MM-dd
  const convertDateFormat = (dateStr: string): string | null => {
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    if (!match) return null;

    const [, month, day, year] = match;
    const fullYear = parseInt(year) >= 50 ? `19${year}` : `20${year}`;
    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');

    return `${fullYear}-${paddedMonth}-${paddedDay}`;
  };

  // Validate meal type
  const isValidMealType = (type: string): type is MealType => {
    return ['breakfast', 'lunch', 'dinner', 'snack', 'other'].includes(type);
  };

  const validateAndParse = (jsonString: string): Omit<MealEntry, 'id'> | null => {
    try {
      // Decode URL-encoded content if needed (for iPhone paste)
      const decodedString = decodeIfNeeded(jsonString);
      const parsed = JSON.parse(decodedString);
      const errors: string[] = [];

      // Normalize field names - accept both "added sugar" and "added_sugar"
      if ('added_sugar' in parsed && !('added sugar' in parsed)) {
        parsed['added sugar'] = parsed['added_sugar'];
      }

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

      // Parse and validate date if provided in JSON
      let mealDate = selectedDate;
      if (parsed.date) {
        const convertedDate = convertDateFormat(parsed.date);
        if (!convertedDate) {
          setError(`Invalid date format: ${parsed.date}. Expected format: MM/DD/YY (e.g., 10/31/24)`);
          return null;
        }
        mealDate = convertedDate;
        // Auto-populate the date field
        setSelectedDate(convertedDate);
      }

      // Parse and validate meal_type if provided in JSON
      let mealTypeValue = mealType;
      if (parsed.meal_type) {
        if (!isValidMealType(parsed.meal_type)) {
          setError(`Invalid meal_type: ${parsed.meal_type}. Must be one of: breakfast, lunch, dinner, snack, other`);
          return null;
        }
        mealTypeValue = parsed.meal_type;
        // Auto-populate the meal type field
        setMealType(parsed.meal_type);
      }

      return {
        date: mealDate,
        mealType: mealTypeValue,
        calories: parsed.calories,
        protein: parsed.protein,
        carbs: parsed.carbs,
        'added sugar': parsed['added sugar'],
        fat: parsed.fat,
        fiber: parsed.fiber,
        notes: parsed.notes,
      };
    } catch (e) {
      setError(`Invalid JSON format. Please check your input and try again.\n\nTip: Copy only the JSON data (starting with { and ending with })\n\nExpected format:\n{\n  "date": "10/31/24",\n  "meal_type": "breakfast",\n  "calories": 850,\n  "protein": 55,\n  "carbs": 85,\n  "added_sugar": 12,\n  "fat": 30,\n  "fiber": 8,\n  "notes": "Meal description"\n}`);
      return null;
    }
  };

  // Parse and validate batch JSON input (multiple meals)
  const validateAndParseBatch = (jsonString: string): Omit<MealEntry, 'id'>[] | null => {
    try {
      const decodedString = decodeIfNeeded(jsonString);

      // Replace smart quotes with straight quotes (common issue when copying from some sources)
      const cleanedString = decodedString
        .replace(/[\u201C\u201D]/g, '"')  // Replace curly double quotes
        .replace(/[\u2018\u2019]/g, "'"); // Replace curly single quotes

      let parsed;

      // Try to parse as array first
      try {
        parsed = JSON.parse(cleanedString);
      } catch (parseError) {
        // If direct parse fails, try to split by } {
        console.log('[Debug] JSON parse failed, trying to split:', parseError);
        // If that fails, try to split by } { and parse individually
        const jsonObjects = cleanedString
          .trim()
          .split(/}\s*{/)
          .map((obj, idx, arr) => {
            if (idx === 0 && idx === arr.length - 1) return obj;
            if (idx === 0) return obj + '}';
            if (idx === arr.length - 1) return '{' + obj;
            return '{' + obj + '}';
          });

        if (jsonObjects.length > 1) {
          parsed = jsonObjects.map(obj => JSON.parse(obj));
        } else {
          throw new Error('Invalid JSON');
        }
      }

      // Ensure parsed is an array
      const mealsArray = Array.isArray(parsed) ? parsed : [parsed];

      // Validate batch size
      if (mealsArray.length > 10) {
        setError(`Too many meals: ${mealsArray.length}. Maximum is 10 meals per upload.`);
        return null;
      }

      if (mealsArray.length === 0) {
        setError('No meal data found in the input.');
        return null;
      }

      // Validate each meal
      const validatedMeals: Omit<MealEntry, 'id'>[] = [];

      for (let i = 0; i < mealsArray.length; i++) {
        const parsed = mealsArray[i];
        const mealNumber = mealsArray.length > 1 ? ` (Meal ${i + 1})` : '';

        // Normalize field names - accept both "added sugar" and "added_sugar"
        if ('added_sugar' in parsed && !('added sugar' in parsed)) {
          parsed['added sugar'] = parsed['added_sugar'];
        }

        // Required fields
        const requiredFields = ['calories', 'protein', 'carbs', 'added sugar', 'fat', 'fiber'];
        const missingFields = requiredFields.filter(field => !(field in parsed));

        if (missingFields.length > 0) {
          setError(`Missing required fields${mealNumber}: ${missingFields.join(', ')}`);
          return null;
        }

        // Validate numeric fields
        const numericFields = ['calories', 'protein', 'carbs', 'added sugar', 'fat', 'fiber'];
        for (const field of numericFields) {
          const value = parsed[field];
          if (typeof value !== 'number' || isNaN(value)) {
            setError(`Invalid number for ${field}${mealNumber}: must be a valid number`);
            return null;
          }
          if (value < 0) {
            setError(`Invalid number for ${field}${mealNumber}: must be a positive number`);
            return null;
          }
          if (value >= 10000) {
            setError(`Invalid number for ${field}${mealNumber}: must be less than 10,000`);
            return null;
          }
        }

        // Optional notes field
        if (parsed.notes !== undefined && typeof parsed.notes !== 'string') {
          setError(`Notes must be a string${mealNumber}`);
          return null;
        }

        // Parse and validate date if provided in JSON
        let mealDate = selectedDate;
        if (parsed.date) {
          const convertedDate = convertDateFormat(parsed.date);
          if (!convertedDate) {
            setError(`Invalid date format${mealNumber}: ${parsed.date}. Expected format: MM/DD/YY (e.g., 10/31/24)`);
            return null;
          }
          mealDate = convertedDate;
        }

        // Parse and validate meal_type if provided in JSON
        let mealTypeValue = mealType;
        if (parsed.meal_type) {
          if (!isValidMealType(parsed.meal_type)) {
            setError(`Invalid meal_type${mealNumber}: ${parsed.meal_type}. Must be one of: breakfast, lunch, dinner, snack, other`);
            return null;
          }
          mealTypeValue = parsed.meal_type;
        }

        validatedMeals.push({
          date: mealDate,
          mealType: mealTypeValue,
          calories: parsed.calories,
          protein: parsed.protein,
          carbs: parsed.carbs,
          'added sugar': parsed['added sugar'],
          fat: parsed.fat,
          fiber: parsed.fiber,
          notes: parsed.notes,
        });
      }

      return validatedMeals;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error('[Debug] Validation error:', errorMsg);
      setError(`Invalid JSON format. ${errorMsg}\n\nPlease check your input and try again.\n\nFor single meal:\n{\n  "date": "10/31/24",\n  "meal_type": "breakfast",\n  "calories": 850,\n  "protein": 55,\n  "carbs": 85,\n  "added_sugar": 12,\n  "fat": 30,\n  "fiber": 8,\n  "notes": "Meal description"\n}\n\nFor multiple meals, use an array:\n[\n  {...meal1...},\n  {...meal2...}\n]`);
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
      date: selectedDate,
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
    setWarning('');
    setSuccess('');

    if (useManualEntry) {
      // Manual entry - validate first
      const parsedData = validateManualEntry();
      if (!parsedData) return;

      // Check date and show warnings (non-blocking)
      const today = new Date();
      const todayString = format(today, 'yyyy-MM-dd');

      // Compare date strings to avoid timezone issues
      if (selectedDate > todayString) {
        setWarning('⚠️ Date is in the future. You can still proceed, but please verify the date is correct.');
      } else {
        // Check if date is from a previous month
        const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayString = format(firstDayOfCurrentMonth, 'yyyy-MM-dd');

        if (selectedDate < firstDayString) {
          setWarning('⚠️ Date is from a previous month. You can still proceed, but please verify the date is correct.');
        }
      }

      onSubmit(parsedData);

      // Show success message
      setSuccess(`Entry saved successfully!\nCalories: ${parsedData.calories}\nProtein: ${parsedData.protein}g\nCarbs: ${parsedData.carbs}g\nAdded Sugar: ${parsedData['added sugar']}g\nFat: ${parsedData.fat}g\nFiber: ${parsedData.fiber}g${parsedData.notes ? `\nNotes: ${parsedData.notes}` : ''}`);

      // Clear form
      setManualCalories('');
      setManualProtein('');
      setManualCarbs('');
      setManualSugar('');
      setManualFat('');
      setManualFiber('');
      setManualNotes('');
    } else {
      // JSON entry - use batch validator
      const parsedMeals = validateAndParseBatch(jsonInput);
      if (!parsedMeals) return;

      // Check dates for all meals and show warnings (non-blocking)
      const today = new Date();
      const todayString = format(today, 'yyyy-MM-dd');
      const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayString = format(firstDayOfCurrentMonth, 'yyyy-MM-dd');

      let hasFutureDate = false;
      let hasOldDate = false;

      for (let i = 0; i < parsedMeals.length; i++) {
        const mealDateString = parsedMeals[i].date;

        // Compare date strings to avoid timezone issues
        if (mealDateString > todayString) {
          hasFutureDate = true;
        }

        if (mealDateString < firstDayString) {
          hasOldDate = true;
        }
      }

      // Set appropriate warning message
      if (hasFutureDate && hasOldDate) {
        setWarning('⚠️ Some dates are in the future and some are from previous months. You can still proceed, but please verify all dates are correct.');
      } else if (hasFutureDate) {
        setWarning('⚠️ One or more dates are in the future. You can still proceed, but please verify the dates are correct.');
      } else if (hasOldDate) {
        setWarning('⚠️ One or more dates are from a previous month. You can still proceed, but please verify the dates are correct.');
      }

      // If single meal, use onSubmit; if multiple, use onBatchSubmit if available
      if (parsedMeals.length === 1) {
        onSubmit(parsedMeals[0]);
        setSuccess(`Entry saved successfully!\nCalories: ${parsedMeals[0].calories}\nProtein: ${parsedMeals[0].protein}g\nCarbs: ${parsedMeals[0].carbs}g\nAdded Sugar: ${parsedMeals[0]['added sugar']}g\nFat: ${parsedMeals[0].fat}g\nFiber: ${parsedMeals[0].fiber}g${parsedMeals[0].notes ? `\nNotes: ${parsedMeals[0].notes}` : ''}`);
      } else {
        // Multiple meals
        if (onBatchSubmit) {
          onBatchSubmit(parsedMeals);
        } else {
          // Fallback: submit each meal individually
          parsedMeals.forEach(meal => onSubmit(meal));
        }
        setSuccess(`${parsedMeals.length} entries saved successfully!`);
      }

      // Clear form
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
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setError('');
    setWarning('');
    setSuccess('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="mealDate" className="block text-sm font-medium text-gray-700 mb-1">
            Meal Date
          </label>
          <input
            type="date"
            id="mealDate"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setError('');
              setWarning('');
              setSuccess('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
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
            setWarning('');
            setSuccess('');
          }}
          rows={12}
          placeholder='Paste JSON nutrition data here&#10;&#10;Single meal:&#10;{&#10;  "date": "10/31/24",&#10;  "meal_type": "breakfast",&#10;  "calories": 850,&#10;  "protein": 55,&#10;  "carbs": 85,&#10;  "added_sugar": 12,&#10;  "fat": 30,&#10;  "fiber": 8,&#10;  "notes": "Meal description"&#10;}&#10;&#10;Note: You can use "added_sugar" or "added sugar"&#10;Multiple meals (up to 10): [{...}, {...}]'
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
                  setWarning('');
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
                  setWarning('');
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
                  setWarning('');
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
                  setWarning('');
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
                  setWarning('');
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
                  setWarning('');
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
                setWarning('');
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

      {warning && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded whitespace-pre-wrap">
          {warning}
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
