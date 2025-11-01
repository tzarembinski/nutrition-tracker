'use client';

import { useState } from 'react';

interface SummaryCardProps {
  title: string;
  value: number;
  unit?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  benchmark?: string;
  dailyLimit?: number; // Daily limit for this nutrient
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
};

export default function SummaryCard({
  title,
  value,
  unit = '',
  icon,
  color = 'blue',
  benchmark,
  dailyLimit,
}: SummaryCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Handle NaN or undefined values gracefully
  const displayValue = isNaN(value) || value === undefined || value === null ? 0 : value;

  // Calculate percentage if dailyLimit is provided
  const percentage = dailyLimit ? Math.round((displayValue / dailyLimit) * 100) : null;

  return (
    <div
      className={`${colorClasses[color]} border rounded-lg p-4 shadow-sm relative`}
      onMouseEnter={() => dailyLimit && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && dailyLimit && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
          <div className="text-center">
            <div className="font-semibold">{title}</div>
            <div className="mt-1">
              {displayValue.toLocaleString()}{unit} / {dailyLimit.toLocaleString()}{unit}
              {percentage !== null && (
                <span className="ml-1">({percentage}%)</span>
              )}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-8 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">
            {displayValue.toLocaleString()}
            {unit && <span className="text-lg ml-1">{unit}</span>}
          </p>
          {benchmark && (
            <p className="text-xs text-gray-600 mt-1 opacity-70">
              {benchmark}
            </p>
          )}
        </div>
        {icon && <div className="text-3xl opacity-60">{icon}</div>}
      </div>
    </div>
  );
}
