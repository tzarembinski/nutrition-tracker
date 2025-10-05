# Nutrition Tracker - Athletic Performance

A modern, professional food tracking web application designed for athletes to manage their daily nutrition intake. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### Core Functionality
- **Manual Entry Form**: Easy-to-use form for logging daily nutrition data
- **Nutrition Tracking**: Track calories, protein, carbohydrates, sugar, fat, and fiber
- **Meal Categories**: Organize meals by Breakfast, Lunch, Dinner, or Snack
- **Notes Field**: Optional field for adding meal details, ingredients, or observations
- **Data Persistence**: All data stored locally using localStorage

### Dashboard & Analytics
- **Summary Cards**: Real-time overview of total and average nutrition intake
- **Visual Analytics**: Interactive charts showing nutrition trends over time
- **Daily Breakdown**: Detailed table view of nutrition data by day
- **Filtering**: Filter meals by date range, meal type, and search notes

### Advanced Features
- **CSV Export**: Export filtered data to CSV for external analysis
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Form Validation**: Comprehensive validation with helpful error messages
- **Edit & Delete**: Full CRUD operations for meal entries

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Usage Guide

### Adding a Meal Entry

1. Navigate to the "Add Meal" tab
2. Fill in all required fields:
   - **Date**: Select the meal date (no future dates allowed)
   - **Meal Type**: Choose from Breakfast, Lunch, Dinner, or Snack
   - **Calories**: Total caloric value
   - **Macronutrients**: Enter protein, carbohydrates, sugar, fat, and fiber in grams
   - **Notes** (Optional): Add any relevant meal details
3. Click "Add Meal" to save

### Viewing Meal History

1. Navigate to the "Meal History" tab
2. Use the filter bar to refine results:
   - Filter by date range
   - Filter by meal type
   - Search within notes
3. View, edit, or delete any meal entry
4. Export filtered results to CSV

### Analytics & Trends

1. Navigate to the "Analytics" tab
2. View interactive charts showing:
   - Daily calorie trends
   - Macronutrient patterns over time
3. Review the daily breakdown table for detailed statistics

## Data Validation

All nutrition entries are validated:
- All nutrition values must be positive numbers
- All values must be less than 10,000
- Date is required and cannot be in the future
- Protein, carbs, sugar, fat, and fiber are all required fields

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Storage**: localStorage (browser-based)

## Project Structure

```
nutrition-tracker/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── MealForm.tsx        # Meal entry form
│   ├── MealList.tsx        # Meal list display
│   ├── SummaryCard.tsx     # Summary card component
│   ├── FilterBar.tsx       # Filter controls
│   └── NutritionChart.tsx  # Chart visualizations
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── storage.ts          # localStorage utilities
│   └── calculations.ts     # Data processing functions
└── utils/                  # Utility functions
```

## Data Structure

```typescript
interface MealEntry {
  id: string;
  date: string;              // ISO date format (YYYY-MM-DD)
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;           // grams
  carbs: number;             // grams
  sugar: number;             // grams
  fat: number;               // grams
  fiber: number;             // grams
  notes?: string;            // optional
}
```

## Features in Detail

### Summary Cards
Display aggregated nutrition data with color-coded cards:
- Total Calories (Blue)
- Total Protein (Green)
- Total Carbohydrates (Orange)
- Total Fat (Red)
- Total Sugar (Yellow)
- Total Fiber (Purple)
- Average Calories per Meal (Blue)
- Total Meal Count (Green)

### Filtering System
- **Date Range**: Filter meals between specific dates
- **Meal Type**: View only breakfast, lunch, dinner, or snacks
- **Search**: Find meals by searching notes content
- **Clear Filters**: Reset all filters with one click

### CSV Export
Export your nutrition data with all fields:
- Date
- Meal Type
- All nutrition values (Calories, Protein, Carbs, Sugar, Fat, Fiber)
- Notes

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Local Storage

Data is stored in your browser's localStorage under the key `nutrition-tracker-meals`. Your data persists across sessions but is device-specific. To transfer data:
1. Export to CSV on one device
2. Import manually on another device (or clear and re-enter)

## Future Enhancements

Potential features for future versions:
- Cloud sync / database integration
- Goal setting and progress tracking
- Meal templates and favorites
- Barcode scanning for packaged foods
- Integration with fitness trackers
- Nutritional recommendations based on activity level
- Multi-user support with authentication

## License

This is a demo application created for athletic nutrition tracking purposes.

## Support

For issues or questions, please refer to the documentation or create an issue in the project repository.

---

**Built with ❤️ for Athletes**
