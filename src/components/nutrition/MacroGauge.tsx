import React from 'react';

interface MacroGaugeProps {
  currentKcal: number;
  targetKcal: number;
  currentProtein: number;
  targetProtein: number;
  currentCarbs: number;
  targetCarbs: number;
  currentFat: number;
  targetFat: number;
}

export const MacroGauge: React.FC<MacroGaugeProps> = ({
  currentKcal,
  targetKcal,
  currentProtein,
  targetProtein,
  currentCarbs,
  targetCarbs,
  currentFat,
  targetFat
}) => {
  const kcalPercent = Math.min(100, Math.round((currentKcal / (targetKcal || 1)) * 100));
  const proteinPercent = Math.min(100, Math.round((currentProtein / (targetProtein || 1)) * 100));
  const carbsPercent = Math.min(100, Math.round((currentCarbs / (targetCarbs || 1)) * 100));
  const fatPercent = Math.min(100, Math.round((currentFat / (targetFat || 1)) * 100));

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
      {/* Calorías Totales */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-slate-300">Calorías del Día</span>
          <span className="font-mono-numbers text-slate-200">
            <strong className="text-emerald-400 text-sm font-black">{currentKcal}</strong> / {targetKcal} kcal
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${kcalPercent}%` }}
          />
        </div>
      </div>

      {/* Barras de Macronutrientes */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {/* Proteínas */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold text-rose-400">Proteína</span>
            <span className="font-mono-numbers text-slate-300 font-semibold">{currentProtein}g</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-500 mt-0.5 block">Meta: {targetProtein}g</span>
        </div>

        {/* Carbohidratos */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold text-amber-400">Carbos</span>
            <span className="font-mono-numbers text-slate-300 font-semibold">{currentCarbs}g</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${carbsPercent}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-500 mt-0.5 block">Meta: {targetCarbs}g</span>
        </div>

        {/* Grasas */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold text-blue-400">Grasas</span>
            <span className="font-mono-numbers text-slate-300 font-semibold">{currentFat}g</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${fatPercent}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-500 mt-0.5 block">Meta: {targetFat}g</span>
        </div>
      </div>
    </div>
  );
};
