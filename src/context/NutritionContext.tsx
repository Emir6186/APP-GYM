import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DayKey, Meal, ShoppingItem, WeeklyDietPlan } from '../types/nutrition';
import { storageService } from '../services/storage';
import { generateWeeklyDietPlan } from '../services/mealPlanGenerator';
import { generateShoppingListFromPlan } from '../services/shoppingListGenerator';
import { useTracking } from './TrackingContext';

interface NutritionContextType {
  dietPlan: WeeklyDietPlan;
  shoppingList: ShoppingItem[];
  generateNewPlan: (customName?: string) => void;
  updateMeal: (dayKey: DayKey, mealId: string, updatedMeal: Partial<Meal>) => void;
  toggleMealCompleted: (dayKey: DayKey, mealId: string) => void;
  regenerateShoppingList: () => void;
  toggleShoppingItem: (id: string) => void;
  addCustomShoppingItem: (item: Omit<ShoppingItem, 'id' | 'isChecked' | 'isCustom'>) => void;
  deleteShoppingItem: (id: string) => void;
  clearCheckedShoppingItems: () => void;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export const NutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { metrics } = useTracking();

  const [dietPlan, setDietPlan] = useState<WeeklyDietPlan>(() => storageService.getWeeklyDietPlan());
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => storageService.getShoppingList());

  useEffect(() => {
    storageService.saveWeeklyDietPlan(dietPlan);
  }, [dietPlan]);

  useEffect(() => {
    storageService.saveShoppingList(shoppingList);
  }, [shoppingList]);

  // Generar nuevo plan con los macros actuales
  const generateNewPlan = useCallback((customName?: string) => {
    const newPlan = generateWeeklyDietPlan(metrics, customName || 'Plan Semanal Equilibrado');
    setDietPlan(newPlan);

    // Regenerar la lista de la compra automáticamente
    const newShopping = generateShoppingListFromPlan(newPlan);
    setShoppingList(newShopping);
  }, [metrics]);

  const updateMeal = useCallback((dayKey: DayKey, mealId: string, updatedMeal: Partial<Meal>) => {
    setDietPlan(prev => {
      const day = prev.days[dayKey];
      if (!day) return prev;

      const updatedMeals = day.meals.map(m => m.id === mealId ? { ...m, ...updatedMeal } : m);
      const totalCalories = updatedMeals.reduce((acc, m) => acc + m.calories, 0);
      const totalProtein = updatedMeals.reduce((acc, m) => acc + m.protein, 0);
      const totalCarbs = updatedMeals.reduce((acc, m) => acc + m.carbs, 0);
      const totalFat = updatedMeals.reduce((acc, m) => acc + m.fat, 0);

      const newPlan = {
        ...prev,
        days: {
          ...prev.days,
          [dayKey]: {
            ...day,
            meals: updatedMeals,
            totalCalories,
            totalProtein,
            totalCarbs,
            totalFat
          }
        },
        updatedAt: new Date().toISOString()
      };

      return newPlan;
    });
  }, []);

  const toggleMealCompleted = useCallback((dayKey: DayKey, mealId: string) => {
    setDietPlan(prev => {
      const day = prev.days[dayKey];
      if (!day) return prev;

      const updatedMeals = day.meals.map(m => m.id === mealId ? { ...m, isCompleted: !m.isCompleted } : m);

      return {
        ...prev,
        days: {
          ...prev.days,
          [dayKey]: {
            ...day,
            meals: updatedMeals
          }
        }
      };
    });
  }, []);

  const regenerateShoppingList = useCallback(() => {
    const newItems = generateShoppingListFromPlan(dietPlan, shoppingList);
    setShoppingList(newItems);
  }, [dietPlan, shoppingList]);

  const toggleShoppingItem = useCallback((id: string) => {
    setShoppingList(prev => prev.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
  }, []);

  const addCustomShoppingItem = useCallback((item: Omit<ShoppingItem, 'id' | 'isChecked' | 'isCustom'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: `custom_${Date.now()}`,
      isChecked: false,
      isCustom: true
    };
    setShoppingList(prev => [newItem, ...prev]);
  }, []);

  const deleteShoppingItem = useCallback((id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCheckedShoppingItems = useCallback(() => {
    setShoppingList(prev => prev.filter(item => !item.isChecked));
  }, []);

  return (
    <NutritionContext.Provider value={{
      dietPlan,
      shoppingList,
      generateNewPlan,
      updateMeal,
      toggleMealCompleted,
      regenerateShoppingList,
      toggleShoppingItem,
      addCustomShoppingItem,
      deleteShoppingItem,
      clearCheckedShoppingItems
    }}>
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error('useNutrition debe ser usado dentro de NutritionProvider');
  }
  return context;
};
