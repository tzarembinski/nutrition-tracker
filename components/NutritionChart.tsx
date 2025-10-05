'use client';

import { DailySummary } from '@/lib/types';
import {
  LineChart,
  Line,
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
  type?: 'line' | 'bar';
}

export default function NutritionChart({ data, type = 'line' }: NutritionChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-center text-gray-500">No data available for chart</p>
      </div>
    );
  }

  // Format data for chart (newest to oldest)
  const chartData = [...data]
    .reverse()
    .slice(-30) // Show last 30 days max
    .map(day => ({
      date: format(parseISO(day.date), 'MMM dd'),
      Calories: day.calories,
      Protein: day.protein,
      Carbs: day.carbs,
      Sugar: day.sugar,
      Fat: day.fat,
      Fiber: day.fiber,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.name === 'Calories' ? '' : 'g'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Nutrition Trends</h3>
      <ResponsiveContainer width="100%" height={400}>
        {type === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="Calories" stroke="#0ea5e9" strokeWidth={2} />
            <Line type="monotone" dataKey="Protein" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="Carbs" stroke="#f59e0b" strokeWidth={2} />
            <Line type="monotone" dataKey="Fat" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Calories" fill="#0ea5e9" />
            <Bar dataKey="Protein" fill="#10b981" />
            <Bar dataKey="Carbs" fill="#f59e0b" />
            <Bar dataKey="Fat" fill="#ef4444" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
