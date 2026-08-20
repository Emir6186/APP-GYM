export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extra';

export type IngredientCategory = 
  | 'frutas_verduras' 
  | 'carniceria_pescaderia' 
  | 'lacteos_huevos' 
  | 'cereales_legumbres' 
  | 'despensa' 
  | 'suplementacion';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: 'g' | 'ml' | 'ud' | 'cda' | 'rebanada' | 'scoop';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: IngredientCategory;
}

export interface Meal {
  id: string;
  type: MealType;
  title: string;
  description: string;
  prepTimeMinutes: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Ingredient[];
  instructions: string[];
  photoEmoji?: string;
  isCompleted?: boolean;
}

export type DayKey = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface DayMealPlan {
  dayKey: DayKey;
  dayName: string;
  dateStr?: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface WeeklyDietPlan {
  id: string;
  name: string;
  goal: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  days: Record<DayKey, DayMealPlan>;
  updatedAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  isChecked: boolean;
  isCustom?: boolean;
}
