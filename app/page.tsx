'use client';

import { useState, useEffect } from 'react';
import { MealEntry, FilterOptions } from '@/lib/types';
import { storageUtils } from '@/lib/storage';
import {
  calculateSummary,
  getDailySummaries,
  filterMeals,
  exportToCSV,
  downloadCSV,
} from '@/lib/calculations';
import {
  calculateBenchmark,
  formatBenchmarkLabel,
  calculateDaysInRange,
} from '@/lib/benchmarks';
import MealForm from '@/components/MealForm';
import MealList from '@/components/MealList';
import SummaryCard from '@/components/SummaryCard';
import FilterBar from '@/components/FilterBar';
import NutritionChart from '@/components/NutritionChart';

export default function Home() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<MealEntry[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({ mealType: 'all' });
  const [editingMeal, setEditingMeal] = useState<MealEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'analytics'>('add');

  // Load meals from localStorage on mount
  useEffect(() => {
    const loadedMeals = storageUtils.getAllMeals();
    setMeals(loadedMeals);
    setFilteredMeals(loadedMeals);
  }, []);

  // Apply filters whenever meals or filters change
  useEffect(() => {
    const filtered = filterMeals(meals, filters);
    setFilteredMeals(filtered);
  }, [meals, filters]);

  const handleAddMeal = (mealData: Omit<MealEntry, 'id'>) => {
    const newMeal: MealEntry = {
      ...mealData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    storageUtils.saveMeal(newMeal);
    setMeals([...meals, newMeal]);
    setActiveTab('list');
  };

  const handleUpdateMeal = (mealData: Omit<MealEntry, 'id'>) => {
    if (!editingMeal) return;

    const updatedMeal: MealEntry = {
      ...mealData,
      id: editingMeal.id,
    };

    storageUtils.updateMeal(updatedMeal);
    setMeals(meals.map(m => (m.id === updatedMeal.id ? updatedMeal : m)));
    setEditingMeal(null);
    setActiveTab('list');
  };

  const handleDeleteMeal = (id: string) => {
    storageUtils.deleteMeal(id);
    setMeals(meals.filter(m => m.id !== id));
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(filteredMeals);
    downloadCSV(csvContent, `nutrition-data-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const summary = calculateSummary(filteredMeals);
  const dailySummaries = getDailySummaries(filteredMeals);

  // Calculate number of days for benchmarks
  const getNumberOfDays = (): number => {
    if (filteredMeals.length === 0) return 1;

    // Get unique dates
    const uniqueDates = new Set(filteredMeals.map(meal => meal.date));
    return uniqueDates.size;
  };

  const numberOfDays = getNumberOfDays();

  // Calculate benchmarks
  const benchmarks = {
    calories: formatBenchmarkLabel(calculateBenchmark('calories', numberOfDays), numberOfDays, 'cal'),
    protein: formatBenchmarkLabel(calculateBenchmark('protein', numberOfDays), numberOfDays, 'g'),
    carbohydrates: formatBenchmarkLabel(calculateBenchmark('carbohydrates', numberOfDays), numberOfDays, 'g'),
    fat: formatBenchmarkLabel(calculateBenchmark('fat', numberOfDays), numberOfDays, 'g'),
    addedSugar: formatBenchmarkLabel(calculateBenchmark('addedSugar', numberOfDays), numberOfDays, 'g'),
    fiber: formatBenchmarkLabel(calculateBenchmark('fiber', numberOfDays), numberOfDays, 'g'),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Nutrition Tracker</h1>
          <p className="text-primary-100 mt-1">Track your nutrition for peak athletic performance</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {filters.startDate || filters.endDate || filters.mealType !== 'all'
              ? 'Filtered Summary'
              : 'Overall Summary'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <SummaryCard
              title="Total Calories"
              value={summary.totalCalories}
              color="blue"
              benchmark={benchmarks.calories}
            />
            <SummaryCard
              title="Total Protein"
              value={summary.totalProtein}
              unit="g"
              color="green"
              benchmark={benchmarks.protein}
            />
            <SummaryCard
              title="Total Carbs"
              value={summary.totalCarbs}
              unit="g"
              color="orange"
              benchmark={benchmarks.carbohydrates}
            />
            <SummaryCard
              title="Total Fat"
              value={summary.totalFat}
              unit="g"
              color="red"
              benchmark={benchmarks.fat}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Added Sugar"
              value={summary.totalSugar}
              unit="g"
              color="yellow"
              benchmark={benchmarks.addedSugar}
            />
            <SummaryCard
              title="Total Fiber"
              value={summary.totalFiber}
              unit="g"
              color="purple"
              benchmark={benchmarks.fiber}
            />
            <SummaryCard title="Avg Calories/Meal" value={summary.avgCalories} color="blue" />
            <SummaryCard title="Total Meals" value={summary.mealCount} color="green" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-4">
            <button
              onClick={() => {
                setActiveTab('add');
                setEditingMeal(null);
              }}
              className={`pb-3 px-2 font-medium text-sm ${
                activeTab === 'add'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Add Meal
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-3 px-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Meal History ({meals.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 px-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'add' && (
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingMeal ? 'Edit Meal Entry' : 'Add New Meal Entry'}
            </h2>
            <MealForm
              onSubmit={editingMeal ? handleUpdateMeal : handleAddMeal}
              initialData={editingMeal || undefined}
              onCancel={editingMeal ? () => setEditingMeal(null) : undefined}
            />
          </div>
        )}

        {activeTab === 'list' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Meal History</h2>
              {filteredMeals.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export CSV
                </button>
              )}
            </div>

            <FilterBar filters={filters} onFilterChange={setFilters} />

            <div className="mt-6">
              <MealList
                meals={filteredMeals.sort((a, b) => b.date.localeCompare(a.date))}
                onEdit={meal => {
                  setEditingMeal(meal);
                  setActiveTab('add');
                }}
                onDelete={handleDeleteMeal}
              />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Analytics & Trends</h2>

            {dailySummaries.length > 0 ? (
              <>
                <NutritionChart data={dailySummaries} />

                {/* Daily Breakdown Table */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Meals
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Calories
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Protein (g)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Carbs (g)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fat (g)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dailySummaries.slice(0, 14).map(day => (
                          <tr key={day.date} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {day.date}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {day.mealCount}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {day.calories}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {day.protein}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {day.carbs}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {day.fat}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-12 rounded-lg shadow-md text-center">
                <p className="text-gray-500 text-lg">No data available yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Start adding meals to see analytics and trends
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>Nutrition Tracker - Built for Athletes</p>
        </div>
      </footer>
    </div>
  );
}
