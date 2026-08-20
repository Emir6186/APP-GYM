import React from 'react';
import { Dumbbell, TrendingUp, Utensils, ShoppingCart, Target } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import { useNutrition } from '../../context/NutritionContext';

export type NavTab = 'workout' | 'tracking' | 'nutrition' | 'shopping' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { activeSession } = useWorkout();
  const { shoppingList } = useNutrition();

  const pendingShoppingCount = shoppingList.filter(item => !item.isChecked).length;

  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: number | string; highlight?: boolean }[] = [
    {
      id: 'workout',
      label: activeSession ? 'Entreno' : 'Entrenar',
      icon: <Dumbbell className="w-5 h-5" />,
      highlight: !!activeSession
    },
    {
      id: 'tracking',
      label: 'Progreso',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      id: 'nutrition',
      label: 'Comidas',
      icon: <Utensils className="w-5 h-5" />
    },
    {
      id: 'shopping',
      label: 'Compra',
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: pendingShoppingCount > 0 ? pendingShoppingCount : undefined
    },
    {
      id: 'profile',
      label: 'Objetivo',
      icon: <Target className="w-5 h-5" />
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5">
        {tabs.map(tab => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.highlight && (
                <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              )}

              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-slate-950 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] mt-1 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                {tab.label}
              </span>

              {isActive && (
                <div className="w-4 h-0.5 bg-emerald-400 rounded-full mt-0.5"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
