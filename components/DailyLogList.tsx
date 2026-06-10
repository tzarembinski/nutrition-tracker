'use client';

import { DailyLog, WorkoutLevel } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface DailyLogListProps {
  logs: DailyLog[];
  onEdit?: (log: DailyLog) => void;
  onDelete?: (id: string) => void;
}

const workoutColors: Record<WorkoutLevel, string> = {
  none: 'bg-gray-100 text-gray-700 border-gray-300',
  easy: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  hard: 'bg-red-100 text-red-700 border-red-300',
};

const stressColors: Record<number, string> = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-red-100 text-red-700',
};

const stressLabels: Record<number, string> = {
  1: '1 — Low',
  2: '2 — Medium',
  3: '3 — High',
};

export default function DailyLogList({ logs, onEdit, onDelete }: DailyLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">No daily logs yet</p>
        <p className="text-gray-400 text-sm mt-2">Start by adding today's log</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map(log => (
        <div
          key={log.id}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Date */}
            <div className="flex-shrink-0 w-32">
              <div className="text-sm font-medium text-gray-900">
                {format(parseISO(log.date), 'MMM dd, yyyy')}
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Workout</div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${workoutColors[log.workout]}`}>
                  {log.workout}
                </span>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Bodyweight</div>
                <div className="text-sm font-semibold">{log.bodyweight} lbs</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Stress</div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${stressColors[log.stress]}`}>
                  {stressLabels[log.stress]}
                </span>
              </div>
            </div>

            {/* Actions */}
            {(onEdit || onDelete) && (
              <div className="flex gap-2 flex-shrink-0">
                {onEdit && (
                  <button
                    onClick={() => onEdit(log)}
                    className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm('Delete this daily log entry?')) onDelete(log.id);
                    }}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          {log.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Notes:</div>
              <div className="text-sm text-gray-700">{log.notes}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
