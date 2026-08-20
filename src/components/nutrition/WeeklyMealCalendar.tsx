import React, { useState } from 'react';
import { Utensils, Check, ChevronRight, ShoppingCart, RefreshCw } from 'lucide-react';
import type { DayKey, Meal } from '../../types/nutrition';
import { useNutrition } from '../../context/NutritionContext';
import { useTracking } from '../../context/TrackingContext';
import { MacroGauge } from './MacroGauge';
import { MealDetailModal } from './MealDetailModal';

const DAYS_LIST: { key: DayKey; short: string; full: string }[] = [
  { key: 'lunes', short: 'Lun', full: 'Lunes' },
  { key: 'martes', short: 'Mar', full: 'Martes' },
  { key: 'miercoles', short: 'Mié', full: 'Miércoles' },
  { key: 'jueves', short: 'Jue', full: 'Jueves' },
  { key: 'viernes', short: 'Vie', full: 'Viernes' },
  { key: 'sabado', short: 'Sáb', full: 'Sábado' },
  { key: 'domingo', short: 'Dom', full: 'Domingo' }
];

interface WeeklyMealCalendarProps {
  onGoToShopping?: () => void;
}

export const WeeklyMealCalendar: React.FC<WeeklyMealCalendarProps> = ({ onGoToShopping }) => {
  const { dietPlan, generateNewPlan, toggleMealCompleted } = useNutrition();
  const { metrics } = useTracking();

  const [selectedDay, setSelectedDay] = useState<DayKey>('lunes');
  const [activeMealDetail, setActiveMealDetail] = useState<Meal | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const currentDayPlan = dietPlan.days[selectedDay] || dietPlan.days.lunes;

  const handleRegenerate = () => {
    setIsRegenerating(true);
    generateNewPlan();
    setTimeout(() => setIsRegenerating(false), 500);
  };

  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case 'breakfast': return 'Desayuno';
      case 'lunch': return 'Almuerzo';
      case 'snack': return 'Merienda / Snack';
      case 'dinner': return 'Cena';
      default: return 'Comida';
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Cabecera y Botón Regenerar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-400" />
            Plan Nutricional Semanal
          </h2>
          <p className="text-xs text-slate-400">
            Ajustado a tu objetivo de <strong className="text-emerald-400 font-mono-numbers">{metrics.targetCalories} kcal</strong>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            title="Regenerar plan de comidas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Regenerar</span>
          </button>
        </div>
      </div>

      {/* Selector de Días de la Semana */}
      <div className="grid grid-cols-7 gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
        {DAYS_LIST.map(d => {
          const isSelected = selectedDay === d.key;
          const dayData = dietPlan.days[d.key];
          const allCompleted = dayData?.meals.length > 0 && dayData.meals.every(m => m.isCompleted);

          return (
            <button
              key={d.key}
              onClick={() => setSelectedDay(d.key)}
              className={`relative py-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{d.short}</span>
              {allCompleted && (
                <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-slate-950' : 'bg-emerald-400'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Medidor de Macros para el Día Seleccionado */}
      <MacroGauge
        currentKcal={currentDayPlan.totalCalories}
        targetKcal={metrics.targetCalories}
        currentProtein={currentDayPlan.totalProtein}
        targetProtein={metrics.proteinGrams}
        currentCarbs={currentDayPlan.totalCarbs}
        targetCarbs={metrics.carbsGrams}
        currentFat={currentDayPlan.totalFat}
        targetFat={metrics.fatGrams}
      />

      {/* Lista de Comidas del Día */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-200 capitalize">
            Menú de {currentDayPlan.dayName}
          </h3>
          <span className="text-xs text-slate-400 font-mono-numbers">
            {currentDayPlan.meals.filter(m => m.isCompleted).length} / {currentDayPlan.meals.length} realizadas
          </span>
        </div>

        {currentDayPlan.meals.map(meal => {
          return (
            <div
              key={meal.id}
              className={`rounded-2xl border transition overflow-hidden ${
                meal.isCompleted
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-3.5 flex items-center justify-between">
                {/* Info de la Comida */}
                <div
                  onClick={() => setActiveMealDetail(meal)}
                  className="flex items-center space-x-3 flex-1 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
                    {meal.photoEmoji || '🍽️'}
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      {getMealTypeLabel(meal.type)}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 truncate mt-0.5">
                      {meal.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono-numbers">
                      <span className="font-bold text-slate-200">{meal.calories} kcal</span>
                      <span>• P: {meal.protein}g</span>
                      <span>• C: {meal.carbs}g</span>
                      <span>• G: {meal.fat}g</span>
                    </div>
                  </div>
                </div>

                {/* Botón de Checkbox de Comida Realizada */}
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <button
                    onClick={() => toggleMealCompleted(selectedDay, meal.id)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                      meal.isCompleted
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700'
                    }`}
                    title={meal.isCompleted ? 'Completada' : 'Marcar como comida realizada'}
                  >
                    <Check className={`w-4 h-4 stroke-[3] ${meal.isCompleted ? 'text-slate-950' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner de Lista de Compra */}
      {onGoToShopping && (
        <div 
          onClick={onGoToShopping}
          className="rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 p-4 cursor-pointer hover:border-emerald-500/60 transition flex items-center justify-between group shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition">
                Lista de la Compra Semanal
              </h4>
              <p className="text-[11px] text-slate-400">
                Todos los ingredientes de esta semana agrupados por pasillos del súper
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition" />
        </div>
      )}

      {/* Modal de Detalle de Receta */}
      <MealDetailModal
        isOpen={!!activeMealDetail}
        onClose={() => setActiveMealDetail(null)}
        meal={activeMealDetail}
        onToggleComplete={() => {
          if (activeMealDetail) {
            toggleMealCompleted(selectedDay, activeMealDetail.id);
          }
        }}
      />
    </div>
  );
};
