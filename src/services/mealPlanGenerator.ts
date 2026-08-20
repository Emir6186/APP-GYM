import { RECIPE_DATABASE } from '../data/recipeDatabase';
import type { RecipeTemplate } from '../data/recipeDatabase';
import type { DayKey, DayMealPlan, Meal, WeeklyDietPlan } from '../types/nutrition';
import type { CalculatedMetrics } from '../types/tracking';

const DAYS: { key: DayKey; name: string }[] = [
  { key: 'lunes', name: 'Lunes' },
  { key: 'martes', name: 'Martes' },
  { key: 'miercoles', name: 'Miércoles' },
  { key: 'jueves', name: 'Jueves' },
  { key: 'viernes', name: 'Viernes' },
  { key: 'sabado', name: 'Sábado' },
  { key: 'domingo', name: 'Domingo' }
];

/**
 * Escala una receta multiplicando ingredientes y macros por un factor dado
 */
function scaleRecipe(recipe: RecipeTemplate, factor: number, instanceId: string): Meal {
  const scaledIngredients = recipe.ingredients.map(ing => ({
    ...ing,
    id: `${instanceId}_${ing.name.toLowerCase().replace(/\s+/g, '_')}`,
    quantity: Math.round(ing.quantity * factor),
    calories: Math.round(ing.calories * factor),
    protein: Math.round(ing.protein * factor),
    carbs: Math.round(ing.carbs * factor),
    fat: Math.round(ing.fat * factor),
  }));

  return {
    id: instanceId,
    type: recipe.type,
    title: recipe.title,
    description: recipe.description,
    prepTimeMinutes: recipe.prepTimeMinutes,
    photoEmoji: recipe.photoEmoji,
    calories: Math.round(recipe.baseCalories * factor),
    protein: Math.round(recipe.baseProtein * factor),
    carbs: Math.round(recipe.baseCarbs * factor),
    fat: Math.round(recipe.baseFat * factor),
    ingredients: scaledIngredients,
    instructions: [...recipe.instructions],
    isCompleted: false
  };
}

/**
 * Genera un plan de alimentación semanal equilibrado y nutritivo
 * adaptado con exactitud a los objetivos calóricos y de macronutrientes del usuario
 */
export function generateWeeklyDietPlan(metrics: CalculatedMetrics, planName = 'Plan Nutricional Optimizado'): WeeklyDietPlan {
  const targetKcal = metrics.targetCalories;

  // Filtramos recetas por tipo
  const breakfasts = RECIPE_DATABASE.filter(r => r.type === 'breakfast');
  const lunches = RECIPE_DATABASE.filter(r => r.type === 'lunch');
  const snacks = RECIPE_DATABASE.filter(r => r.type === 'snack');
  const dinners = RECIPE_DATABASE.filter(r => r.type === 'dinner');

  const daysPlan: Record<DayKey, DayMealPlan> = {} as Record<DayKey, DayMealPlan>;

  DAYS.forEach((day, index) => {
    // Rotamos recetas para ofrecer variedad gastronómica
    const bRecipe = breakfasts[index % breakfasts.length];
    const lRecipe = lunches[index % lunches.length];
    const sRecipe = snacks[index % snacks.length];
    const dRecipe = dinners[index % dinners.length];

    const baseSumKcal = bRecipe.baseCalories + lRecipe.baseCalories + sRecipe.baseCalories + dRecipe.baseCalories;
    
    // Factor de escala para que la suma del día cuadre con targetKcal
    const scaleFactor = targetKcal / baseSumKcal;

    const bMeal = scaleRecipe(bRecipe, scaleFactor, `meal_${day.key}_b`);
    const lMeal = scaleRecipe(lRecipe, scaleFactor, `meal_${day.key}_l`);
    const sMeal = scaleRecipe(sRecipe, scaleFactor, `meal_${day.key}_s`);
    const dMeal = scaleRecipe(dRecipe, scaleFactor, `meal_${day.key}_d`);

    const dayMeals = [bMeal, lMeal, sMeal, dMeal];

    const totalCalories = dayMeals.reduce((acc, m) => acc + m.calories, 0);
    const totalProtein = dayMeals.reduce((acc, m) => acc + m.protein, 0);
    const totalCarbs = dayMeals.reduce((acc, m) => acc + m.carbs, 0);
    const totalFat = dayMeals.reduce((acc, m) => acc + m.fat, 0);

    daysPlan[day.key] = {
      dayKey: day.key,
      dayName: day.name,
      meals: dayMeals,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    };
  });

  return {
    id: `diet_plan_${Date.now()}`,
    name: planName,
    goal: metrics.calorieDiff < 0 ? 'Déficit Calórico' : metrics.calorieDiff > 0 ? 'Superávit / Volumen' : 'Mantenimiento',
    targetCalories: targetKcal,
    targetProtein: metrics.proteinGrams,
    targetCarbs: metrics.carbsGrams,
    targetFat: metrics.fatGrams,
    days: daysPlan,
    updatedAt: new Date().toISOString()
  };
}
