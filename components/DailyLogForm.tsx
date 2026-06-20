'use client';

import { useState } from 'react';
import { DailyLog, WorkoutLevel } from '@/lib/types';
import { format } from 'date-fns';

interface DailyLogFormProps {
  onSubmit: (log: Omit<DailyLog, 'id'>) => void;
  initialData?: DailyLog;
  onCancel?: () => void;
}

const workoutOptions: { value: WorkoutLevel; label: string; color: string }[] = [
  { value: 'none', label: 'None', color: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200' },
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
];

const workoutSelectedColor: Record<WorkoutLevel, string> = {
  none: 'bg-gray-500 text-white border-gray-500',
  easy: 'bg-green-500 text-white border-green-500',
  medium: 'bg-yellow-500 text-white border-yellow-500',
  hard: 'bg-red-500 text-white border-red-500',
};

const stressOptions: { value: 1 | 2 | 3; label: string; desc: string; color: string; selectedColor: string }[] = [
  { value: 1, label: '1', desc: 'Low', color: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200', selectedColor: 'bg-green-500 text-white border-green-500' },
  { value: 2, label: '2', desc: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200', selectedColor: 'bg-yellow-500 text-white border-yellow-500' },
  { value: 3, label: '3', desc: 'High', color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200', selectedColor: 'bg-red-500 text-white border-red-500' },
];

export default function DailyLogForm({ onSubmit, initialData, onCancel }: DailyLogFormProps) {
  const [selectedDate, setSelectedDate] = useState(initialData?.date || format(new Date(), 'yyyy-MM-dd'));
  const [workout, setWorkout] = useState<WorkoutLevel>(initialData?.workout || 'none');
  const [bodyweight, setBodyweight] = useState(initialData?.bodyweight.toString() || '');
  const [stress, setStress] = useState<1 | 2 | 3>(initialData?.stress || 1);
  const [sleep, setSleep] = useState(initialData?.sleep?.toString() || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!bodyweight) {
      setError('Please enter your bodyweight.');
      return;
    }

    const weight = parseFloat(bodyweight);
    if (isNaN(weight) || weight <= 0 || weight > 999) {
      setError('Please enter a valid bodyweight (1–999 lbs).');
      return;
    }

    onSubmit({ date: selectedDate, workout, bodyweight: weight, stress, sleep: sleep ? parseFloat(sleep) : undefined, notes: notes || undefined });
    setSuccess('Daily log saved!');

    if (!initialData) {
      setBodyweight('');
      setSleep('');
      setNotes('');
      setWorkout('none');
      setStress(1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      {/* Date */}
      <div>
        <label htmlFor="logDate" className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          id="logDate"
          value={selectedDate}
          onChange={e => { setSelectedDate(e.target.value); setError(''); setSuccess(''); }}
          className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Workout */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Workout</label>
        <div className="flex gap-2 flex-wrap">
          {workoutOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setWorkout(opt.value); setError(''); setSuccess(''); }}
              className={`px-5 py-2 rounded-md border font-medium text-sm transition-colors ${
                workout === opt.value ? workoutSelectedColor[opt.value] : opt.color
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bodyweight */}
      <div>
        <label htmlFor="bodyweight" className="block text-sm font-medium text-gray-700 mb-1">
          Bodyweight (lbs) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="bodyweight"
          value={bodyweight}
          onChange={e => { setBodyweight(e.target.value); setError(''); setSuccess(''); }}
          step="0.1"
          min="1"
          max="999"
          placeholder="175.5"
          className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Sleep */}
      <div>
        <label htmlFor="sleep" className="block text-sm font-medium text-gray-700 mb-1">
          Sleep last night (hours)
        </label>
        <select
          id="sleep"
          value={sleep}
          onChange={e => { setSleep(e.target.value); setError(''); setSuccess(''); }}
          className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">— select —</option>
          {[4, 5, 6, 7, 8, 9, 10].map(h => (
            <option key={h} value={h}>{h} hrs</option>
          ))}
        </select>
      </div>

      {/* Stress */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Stress Level</label>
        <div className="flex gap-2">
          {stressOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setStress(opt.value); setError(''); setSuccess(''); }}
              className={`px-5 py-2 rounded-md border font-medium text-sm transition-colors ${
                stress === opt.value ? opt.selectedColor : opt.color
              }`}
            >
              {opt.label} — {opt.desc}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="logNotes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          id="logNotes"
          value={notes}
          onChange={e => { setNotes(e.target.value); setError(''); setSuccess(''); }}
          rows={2}
          placeholder="How did you feel today?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          Save Log
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
