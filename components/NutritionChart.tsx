'use client';

import { DailySummary, DailyLog } from '@/lib/types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DAILY_BENCHMARKS } from '@/lib/benchmarks';

interface NutritionChartProps {
  data: DailySummary[];
  dailyLogs?: DailyLog[];
}

export default function NutritionChart({ data, dailyLogs = [] }: NutritionChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-center text-gray-500">No data available for charts</p>
      </div>
    );
  }

  // Format data for charts (last 7 days)
  const chartData = [...data]
    .reverse()
    .slice(-7)
    .map(day => ({
      date: format(parseISO(day.date), 'MMM dd'),
      Protein: day.protein,
      Carbs: day.carbs,
      'Added Sugar': day['added sugar'],
      Fat: day.fat,
      Fiber: day.fiber,
      Calories: day.calories,
    }));

  const logChartData = [...dailyLogs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .map(log => ({
      date: format(parseISO(log.date), 'MMM dd'),
      Bodyweight: log.bodyweight,
      Stress: log.stress,
    }));

  const MacrosTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}g
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CaloriesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          <p style={{ color: payload[0].color }} className="text-sm">
            Calories: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Macronutrients Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Macronutrients (grams)</h3>
        <p className="text-xs text-gray-500 mb-3">
          Dashed lines represent daily recommended targets for an active adult
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 450]} />
            <Tooltip content={<MacrosTooltip />} />
            <Legend />
            <ReferenceLine
              y={DAILY_BENCHMARKS.protein}
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeOpacity={0.4}
              label={{ value: 'Protein Target', position: 'insideTopRight', fill: '#10b981', fontSize: 10 }}
            />
            <ReferenceLine
              y={DAILY_BENCHMARKS.carbohydrates}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeOpacity={0.4}
              label={{ value: 'Carbs Target', position: 'insideTopRight', fill: '#f59e0b', fontSize: 10 }}
            />
            <ReferenceLine
              y={DAILY_BENCHMARKS.addedSugar}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeOpacity={0.4}
              label={{ value: 'Sugar Max', position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }}
            />
            <ReferenceLine
              y={DAILY_BENCHMARKS.fat}
              stroke="#8b5cf6"
              strokeDasharray="5 5"
              strokeOpacity={0.4}
              label={{ value: 'Fat Target', position: 'insideTopRight', fill: '#8b5cf6', fontSize: 10 }}
            />
            <ReferenceLine
              y={DAILY_BENCHMARKS.fiber}
              stroke="#06b6d4"
              strokeDasharray="5 5"
              strokeOpacity={0.4}
              label={{ value: 'Fiber Target', position: 'insideTopRight', fill: '#06b6d4', fontSize: 10 }}
            />
            <Bar dataKey="Protein" fill="#10b981" />
            <Bar dataKey="Carbs" fill="#f59e0b" />
            <Bar dataKey="Added Sugar" fill="#ef4444" />
            <Bar dataKey="Fat" fill="#8b5cf6" />
            <Bar dataKey="Fiber" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Calories Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Calories</h3>
        <p className="text-xs text-gray-500 mb-3">
          Dashed line represents daily recommended target (2,800 cal/day for an active adult)
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 3500]} />
            <Tooltip content={<CaloriesTooltip />} />
            <Legend />
            <ReferenceLine
              y={DAILY_BENCHMARKS.calories}
              stroke="#0ea5e9"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
              label={{ value: 'Daily Target', position: 'insideTopRight', fill: '#0ea5e9', fontSize: 12 }}
            />
            <Bar dataKey="Calories" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bodyweight & Stress Trends */}
      {logChartData.length > 0 && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bodyweight Trend (lbs)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={logChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip formatter={(v: number) => [`${v} lbs`, 'Bodyweight']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Bodyweight"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Stress Level Trend</h3>
            <p className="text-xs text-gray-500 mb-3">1 = Low, 2 = Medium, 3 = High</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={logChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0.5, 3.5]} ticks={[1, 2, 3]} />
                <Tooltip formatter={(v: number) => [v === 1 ? '1 — Low' : v === 2 ? '2 — Medium' : '3 — High', 'Stress']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Stress"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </>
  );
}
