import React from 'react';
import { Clock, Check, UtensilsCrossed } from 'lucide-react';
import type { Meal } from '../../types/nutrition';
import { Modal } from '../common/Modal';
import { CATEGORY_LABELS } from '../../services/shoppingListGenerator';

interface MealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal | null;
  onToggleComplete?: () => void;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
  isOpen,
  onClose,
  meal,
  onToggleComplete
}) => {
  if (!meal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={meal.title}
      subtitle={`Receta y desglose nutricional • ${meal.prepTimeMinutes} min de preparación`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Banner de Macros de la Comida */}
        <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">{meal.photoEmoji || '🍽️'}</span>
              <div>
                <span className="text-xs text-slate-400 font-medium">Aporte Energético</span>
                <div className="text-lg font-black text-emerald-400 font-mono-numbers">
                  {meal.calories} <span className="text-xs text-slate-400 font-normal">kcal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{meal.prepTimeMinutes} minutos</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
            <div className="p-2 rounded-xl bg-slate-900 border border-rose-500/20">
              <span className="text-[10px] text-rose-400 uppercase font-semibold">Proteína</span>
              <div className="text-sm font-bold text-slate-100 font-mono-numbers">{meal.protein}g</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-amber-500/20">
              <span className="text-[10px] text-amber-400 uppercase font-semibold">Carbos</span>
              <div className="text-sm font-bold text-slate-100 font-mono-numbers">{meal.carbs}g</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-blue-500/20">
              <span className="text-[10px] text-blue-400 uppercase font-semibold">Grasas</span>
              <div className="text-sm font-bold text-slate-100 font-mono-numbers">{meal.fat}g</div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          "{meal.description}"
        </p>

        {/* Lista de Ingredientes Exactos */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
            Ingredientes y Cantidades
          </h4>
          <div className="space-y-1.5">
            {meal.ingredients.map((ing, idx) => {
              const catMeta = CATEGORY_LABELS[ing.category] || { icon: '🛒' };
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70 text-xs"
                >
                  <span className="text-slate-200 flex items-center gap-2">
                    <span>{catMeta.icon}</span>
                    <span>{ing.name}</span>
                  </span>
                  <span className="font-mono-numbers font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {ing.quantity} {ing.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instrucciones de Elaboración */}
        {meal.instructions && meal.instructions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Pasos de Elaboración
            </h4>
            <div className="space-y-2">
              {meal.instructions.map((step, idx) => (
                <div key={idx} className="flex gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-mono-numbers flex items-center justify-center flex-shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón de acción */}
        <div className="pt-2">
          {onToggleComplete && (
            <button
              onClick={() => {
                onToggleComplete();
                onClose();
              }}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                meal.isCompleted
                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              {meal.isCompleted ? 'Marcar como pendiente' : 'Marcar comida como realizada'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
