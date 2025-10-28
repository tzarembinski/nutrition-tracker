interface SummaryCardProps {
  title: string;
  value: number;
  unit?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
  benchmark?: string;
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
}: SummaryCardProps) {
  // Handle NaN or undefined values gracefully
  const displayValue = isNaN(value) || value === undefined || value === null ? 0 : value;

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4 shadow-sm`}>
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
