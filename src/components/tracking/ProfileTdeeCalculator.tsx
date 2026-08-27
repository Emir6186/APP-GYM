import React, { useState } from 'react';
import { Flame, Activity, Sparkles, Check, Target, Calendar } from 'lucide-react';
import type { FitnessGoal, ActivityLevel, Gender } from '../../types/tracking';
import { useTracking } from '../../context/TrackingContext';
import { useNutrition } from '../../context/NutritionContext';

interface ProfileTdeeCalculatorProps {
  onPlanRegenerated?: () => void;
}

export const ProfileTdeeCalculator: React.FC<ProfileTdeeCalculatorProps> = ({ onPlanRegenerated }) => {
  const { profile, updateProfile, metrics, roadmapSteps, stats } = useTracking();
  const { generateNewPlan } = useNutrition();

  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age.toString());
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [weightKg, setWeightKg] = useState(profile.weightKg.toString());
  const [startWeightKg, setStartWeightKg] = useState((profile.startWeightKg || profile.weightKg).toString());
  const [targetWeightKg, setTargetWeightKg] = useState((profile.targetWeightKg || (profile.weightKg - 5)).toString());
  const [heightCm, setHeightCm] = useState(profile.heightCm.toString());
  const [trainingDays, setTrainingDays] = useState(profile.trainingDaysPerWeek);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const w = parseFloat(weightKg) || profile.weightKg;
    const sW = parseFloat(startWeightKg) || w;
    const tW = parseFloat(targetWeightKg) || w;
    const h = parseFloat(heightCm) || profile.heightCm;
    const a = parseInt(age, 10) || profile.age;

    updateProfile({
      name: name.trim() || 'Atleta',
      age: a,
      gender,
      weightKg: w,
      startWeightKg: sW,
      targetWeightKg: tW,
      heightCm: h,
      trainingDaysPerWeek: trainingDays,
      activityLevel,
      goal
    });

    // Sincronizar y regenerar el plan de alimentación con las nuevas calorías
    generateNewPlan();

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);

    if (onPlanRegenerated) {
      onPlanRegenerated();
    }
  };

  const goalsList: { id: FitnessGoal; label: string; desc: string; diff: string; color: string }[] = [
    { id: 'deficit_aggressive', label: 'Déficit Agresivo', desc: 'Pérdida rápida de grasa', diff: '-750 kcal', color: 'border-rose-500/50 bg-rose-950/20 text-rose-300' },
    { id: 'deficit_moderate', label: 'Déficit Moderado (Recomendado)', desc: 'Pérdida de grasa óptima preservando músculo', diff: '-500 kcal', color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300' },
    { id: 'deficit_mild', label: 'Déficit Leve', desc: 'Recomposición corporal y definición suave', diff: '-300 kcal', color: 'border-teal-500/50 bg-teal-950/20 text-teal-300' },
    { id: 'maintenance', label: 'Mantenimiento', desc: 'Mantener peso y ganar fuerza/salud', diff: '0 kcal', color: 'border-blue-500/50 bg-blue-950/20 text-blue-300' },
    { id: 'surplus_lean', label: 'Superávit Limpio (Volumen Magro)', desc: 'Aumento de masa muscular minimizando grasa', diff: '+300 kcal', color: 'border-amber-500/50 bg-amber-950/20 text-amber-300' },
    { id: 'surplus_aggressive', label: 'Superávit Alto (Volumen Fuerte)', desc: 'Ganancia máxima de masa y fuerza', diff: '+500 kcal', color: 'border-orange-500/50 bg-orange-950/20 text-orange-300' },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Toast de confirmación */}
      {showSavedToast && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto p-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-sm shadow-2xl flex items-center justify-center gap-2 animate-bounce">
          <Check className="w-5 h-5 stroke-[3]" />
          ¡Métricas, Objetivo y Plan de Comidas actualizados con éxito!
        </div>
      )}

      {/* Tarjeta de Resumen: Objetivo y Escalada de Progreso */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Tu Meta Fitness
              </span>
              <h3 className="text-sm font-bold text-slate-200">
                Peso Objetivo: {profile.targetWeightKg || profile.weightKg} kg
              </h3>
            </div>
          </div>

          <div className="text-right font-mono-numbers">
            <span className="text-xl font-black text-slate-100 block">
              {stats.remainingToTargetKg > 0 ? `-${stats.remainingToTargetKg}` : stats.remainingToTargetKg < 0 ? `+${Math.abs(stats.remainingToTargetKg)}` : '0'} kg
            </span>
            <span className="text-[10px] text-slate-400">para la meta</span>
          </div>
        </div>

        {/* 3 Bloques de Control de Peso: Inicial vs Actual vs Objetivo */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 font-mono-numbers text-center">
          <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Comienzo</span>
            <span className="text-sm font-black text-slate-300">{profile.startWeightKg || profile.weightKg} kg</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
            <span className="text-[10px] text-emerald-400 block uppercase font-bold">Actual</span>
            <span className="text-sm font-black text-slate-100">{profile.weightKg} kg</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-amber-400 block uppercase font-bold">Objetivo</span>
            <span className="text-sm font-black text-amber-400">{profile.targetWeightKg || profile.weightKg} kg</span>
          </div>
        </div>

        {/* Escalada de Progreso Estimada (Roadmap Semana a Semana) */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Escalada de Progreso ({metrics.estimatedWeeksToGoal} semanas estimadas)
            </span>
            <span className="text-[10px] font-mono-numbers text-emerald-400 font-bold">
              ~{metrics.recommendedWeeklyRateKg} kg/sem
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {roadmapSteps.map((step) => (
              <div
                key={step.weekNumber}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono-numbers"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                    #{step.weekNumber}
                  </span>
                  <span className="text-slate-300 font-medium">{step.dateStr}</span>
                </div>

                <div className="flex items-center space-x-1.5 font-bold">
                  <span className={step.projectedWeightKg === (profile.targetWeightKg || profile.weightKg) ? 'text-amber-400' : 'text-emerald-400'}>
                    {step.projectedWeightKg} kg
                  </span>
                  {step.projectedWeightKg === (profile.targetWeightKg || profile.weightKg) && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-sans">
                      🎯 Meta
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tarjeta de Calorías y Macros Diarios */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Presupuesto Calórico Diario</h3>
              <p className="text-[11px] text-slate-400">Ajustado para cumplir tu escalada</p>
            </div>
          </div>

          <div className="text-right font-mono-numbers">
            <span className="text-2xl font-black text-emerald-400 tracking-tight">
              {metrics.targetCalories}
            </span>
            <span className="text-xs text-slate-400 block -mt-1 font-semibold">kcal/día</span>
          </div>
        </div>

        {/* Desglose de Macronutrientes */}
        <div className="grid grid-cols-3 gap-2 pt-1 font-mono-numbers text-center">
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-rose-500/20">
            <span className="text-[10px] font-bold text-rose-400 block uppercase">Proteínas</span>
            <div className="text-sm font-black text-slate-100 mt-0.5">
              {metrics.proteinGrams} <span className="text-[10px] font-normal text-slate-400">g</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-amber-500/20">
            <span className="text-[10px] font-bold text-amber-400 block uppercase">Carbos</span>
            <div className="text-sm font-black text-slate-100 mt-0.5">
              {metrics.carbsGrams} <span className="text-[10px] font-normal text-slate-400">g</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-blue-500/20">
            <span className="text-[10px] font-bold text-blue-400 block uppercase">Grasas</span>
            <div className="text-sm font-black text-slate-100 mt-0.5">
              {metrics.fatGrams} <span className="text-[10px] font-normal text-slate-400">g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de Parámetros y Objetivos */}
      <form onSubmit={handleSave} className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Ajustar Datos de Comienzo y Objetivo
        </h3>

        {/* Nombre y Género */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Género</label>
            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  gender === 'male' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
                }`}
              >
                Hombre
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  gender === 'female' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
                }`}
              >
                Mujer
              </button>
            </div>
          </div>
        </div>

        {/* Peso Comienzo, Peso Actual, Peso Objetivo (Meta) */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Peso Inicio (kg)</label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="250"
              value={startWeightKg}
              onChange={(e) => setStartWeightKg(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-center text-sm font-bold font-mono-numbers text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-emerald-400 mb-1">Peso Actual (kg)</label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="250"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl p-2 text-center text-sm font-black font-mono-numbers text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-amber-400 mb-1">Peso Meta (kg)</label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="250"
              value={targetWeightKg}
              onChange={(e) => setTargetWeightKg(e.target.value)}
              className="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2 text-center text-sm font-black font-mono-numbers text-amber-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Edad y Altura */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Edad (años)</label>
            <input
              type="number"
              min="14"
              max="100"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-center text-sm font-bold font-mono-numbers text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Altura (cm)</label>
            <input
              type="number"
              min="100"
              max="240"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-center text-sm font-bold font-mono-numbers text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Días de entrenamiento a la semana */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Días de Entrenamiento Semanal
            </label>
            <span className="text-xs font-bold text-emerald-400 font-mono-numbers">
              {trainingDays} días / semana
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setTrainingDays(d)}
                className={`py-2 rounded-xl text-xs font-bold font-mono-numbers border transition ${
                  trainingDays === d
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Nivel de actividad */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nivel de Actividad Diaria (Fuera del Gym)
          </label>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="sedentary">Sedentario (Trabajo de oficina, poco movimiento)</option>
            <option value="light">Ligera (Caminar 6.000-8.000 pasos al día)</option>
            <option value="moderate">Moderada (Trabajo activo de pie o 10.000 pasos)</option>
            <option value="very_active">Muy Activa (Trabajo físico intenso)</option>
            <option value="athlete">Atleta / Doble sesión diaria</option>
          </select>
        </div>

        {/* Selección de Objetivo */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Tipo de Enfoque Nutricional
          </label>
          <div className="space-y-2">
            {goalsList.map(g => (
              <div
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  goal === g.id
                    ? `${g.color} shadow-md`
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{g.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{g.desc}</div>
                </div>

                <span className="text-xs font-mono-numbers font-black px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-700">
                  {g.diff}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Botón Guardar y Sincronizar */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          Guardar Meta y Generar Escalada de Progreso
        </button>
      </form>
    </div>
  );
};
