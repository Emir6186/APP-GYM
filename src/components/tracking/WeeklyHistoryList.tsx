import React from 'react';
import { Calendar, Ruler, Scale, Trash2, TrendingDown, TrendingUp, Minus, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import type { WeeklyCheckIn } from '../../types/tracking';
import { useTracking } from '../../context/TrackingContext';
import { useNutrition } from '../../context/NutritionContext';
import { auditWeeklyProgress } from '../../services/calculations';

interface WeeklyHistoryListProps {
  checkIns: WeeklyCheckIn[];
}

export const WeeklyHistoryList: React.FC<WeeklyHistoryListProps> = ({ checkIns }) => {
  const { deleteWeeklyCheckIn, applyCalorieAdjustment, profile } = useTracking();
  const { generateNewPlan } = useNutrition();

  // Ordenar de más reciente a más antiguo
  const sorted = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400">
        <Scale className="w-8 h-8 mx-auto text-slate-600 mb-2" />
        <p className="text-xs font-semibold text-slate-300">No hay revisiones semanales registradas</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Pulsa el botón de "+ Nueva Revisión" para registrar tu primer control.</p>
      </div>
    );
  }

  const handleApplyAdjustment = (delta: number) => {
    applyCalorieAdjustment(delta);
    generateNewPlan();
  };

  return (
    <div className="space-y-3">
      {sorted.map((item, index) => {
        const nextOlder = sorted[index + 1];
        
        let weightDiff: number | null = null;
        let waistDiff: number | null = null;

        if (nextOlder) {
          weightDiff = Number((item.weightKg - nextOlder.weightKg).toFixed(1));
          waistDiff = Number((item.waistCircumferenceCm - nextOlder.waistCircumferenceCm).toFixed(1));
        }

        const dateStr = new Date(item.date).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });

        // Auditoría nutricional calculada
        const audit = item.auditResult || auditWeeklyProgress(item, nextOlder, profile.goal);

        return (
          <div
            key={item.id}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-md hover:border-slate-700 transition space-y-3"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-extrabold text-xs font-mono-numbers border border-emerald-500/20">
                  Semana {item.weekNumber}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {dateStr}
                </span>
              </div>

              <button
                onClick={() => deleteWeeklyCheckIn(item.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                title="Eliminar revisión"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Métricas Principales */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Scale className="w-3 h-3 text-emerald-400" />
                    Peso
                  </span>
                  {weightDiff !== null && (
                    <span className={`text-[10px] font-mono-numbers font-bold flex items-center ${
                      weightDiff < 0 ? 'text-emerald-400' : weightDiff > 0 ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {weightDiff < 0 ? <TrendingDown className="w-3 h-3 mr-0.5" /> : weightDiff > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <Minus className="w-3 h-3 mr-0.5" />}
                      {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg
                    </span>
                  )}
                </div>
                <div className="text-base font-black font-mono-numbers text-slate-100 mt-0.5">
                  {item.weightKg} <span className="text-xs text-slate-400 font-normal">kg</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-emerald-400" />
                    Cintura
                  </span>
                  {waistDiff !== null && (
                    <span className={`text-[10px] font-mono-numbers font-bold flex items-center ${
                      waistDiff < 0 ? 'text-emerald-400' : waistDiff > 0 ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {waistDiff < 0 ? <TrendingDown className="w-3 h-3 mr-0.5" /> : waistDiff > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <Minus className="w-3 h-3 mr-0.5" />}
                      {waistDiff > 0 ? `+${waistDiff}` : waistDiff} cm
                    </span>
                  )}
                </div>
                <div className="text-base font-black font-mono-numbers text-emerald-400 mt-0.5">
                  {item.waistCircumferenceCm} <span className="text-xs text-slate-400 font-normal">cm</span>
                </div>
              </div>
            </div>

            {/* Auditoría Nutricional y Control Inteligente de Progreso */}
            {audit && (
              <div className={`p-3 rounded-xl border text-xs space-y-2 ${
                audit.status === 'optimal'
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : audit.status === 'slow'
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                  : audit.status === 'fast'
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  {audit.status === 'optimal' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                  <span>{audit.title}</span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {audit.message}
                </p>

                {/* Botón de acción para aplicar ajuste calórico inteligente si procede */}
                {audit.recommendedCalorieDelta !== 0 && (
                  <button
                    onClick={() => handleApplyAdjustment(audit.recommendedCalorieDelta)}
                    className="mt-1 w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition shadow flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                    Aplicar Ajuste a mi Dieta ({audit.recommendedCalorieDelta > 0 ? `+${audit.recommendedCalorieDelta}` : audit.recommendedCalorieDelta} kcal)
                  </button>
                )}
              </div>
            )}

            {/* Medidas secundarias opcionales */}
            {(item.chestCm || item.armCm || item.thighCm || item.bodyFatPercentage) && (
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono-numbers pt-1 border-t border-slate-800/60">
                {item.chestCm && <span>Pecho: <strong className="text-slate-300">{item.chestCm}cm</strong></span>}
                {item.armCm && <span>Brazo: <strong className="text-slate-300">{item.armCm}cm</strong></span>}
                {item.thighCm && <span>Muslo: <strong className="text-slate-300">{item.thighCm}cm</strong></span>}
                {item.bodyFatPercentage && <span>Grasa: <strong className="text-slate-300">{item.bodyFatPercentage}%</strong></span>}
              </div>
            )}

            {/* Notas y Foto si existen */}
            {item.notes && (
              <p className="text-xs text-slate-300 bg-slate-950/40 p-2 rounded-lg italic">
                "{item.notes}"
              </p>
            )}

            {item.photoUrl && (
              <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
                <img src={item.photoUrl} alt="Foto semanal" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
