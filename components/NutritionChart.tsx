'use client';

import { DailySummary } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface NutritionChartProps {
  data: DailySummary[];
}

export default function NutritionChart({ data }: NutritionChartProps) {
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
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 200]} />
            <Tooltip content={<MacrosTooltip />} />
            <Legend />
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
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 3000]} />
            <Tooltip content={<CaloriesTooltip />} />
            <Legend />
            <Bar dataKey="Calories" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
