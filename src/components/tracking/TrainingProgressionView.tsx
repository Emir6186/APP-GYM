import React, { useState } from 'react';
import { Dumbbell, TrendingUp, Trophy, Award, ChevronRight, Activity } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import { estimateOneRepMax, formatSecondsToTime } from '../../services/calculations';
import type { WorkoutSession } from '../../types/workout';
import { WorkoutSessionDetailModal } from '../workout/WorkoutSessionDetailModal';

export const TrainingProgressionView: React.FC = () => {
  const { workoutHistory } = useWorkout();
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [selectedRoutineFilter, setSelectedRoutineFilter] = useState<string>('all');

  if (workoutHistory.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 space-y-3">
        <Dumbbell className="w-12 h-12 mx-auto text-slate-600 mb-2" />
        <h3 className="text-base font-bold text-slate-200">Aún no hay informes de entrenamiento</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Completa tus primeros entrenamientos para desbloquear los gráficos de sobrecarga progresiva, récords personales y análisis de volumen.
        </p>
      </div>
    );
  }

  // 1. Estadísticas Globales
  let totalLifetimeKg = 0;
  let totalLifetimeSets = 0;

  workoutHistory.forEach(s => {
    s.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.isCompleted) {
          totalLifetimeSets++;
          totalLifetimeKg += (set.weightKg * set.reps);
        }
      });
    });
  });

  // 2. Récords Personales (PRs) por Ejercicio
  interface ExercisePR {
    exerciseName: string;
    category: string;
    maxWeightKg: number;
    maxRepsAtWeight: number;
    estimated1RM: number;
    date: string;
    photoUrl?: string;
  }

  const prsMap: Record<string, ExercisePR> = {};

  workoutHistory.forEach(s => {
    s.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.isCompleted && set.weightKg > 0) {
          const current1RM = estimateOneRepMax(set.weightKg, set.reps);
          const existing = prsMap[ex.exerciseName];

          if (!existing || current1RM > existing.estimated1RM || set.weightKg > existing.maxWeightKg) {
            prsMap[ex.exerciseName] = {
              exerciseName: ex.exerciseName,
              category: ex.exerciseCategory,
              maxWeightKg: Math.max(existing?.maxWeightKg || 0, set.weightKg),
              maxRepsAtWeight: set.weightKg >= (existing?.maxWeightKg || 0) ? set.reps : existing?.maxRepsAtWeight || set.reps,
              estimated1RM: Math.max(existing?.estimated1RM || 0, current1RM),
              date: s.date,
              photoUrl: ex.exercisePhotoUrl
            };
          }
        }
      });
    });
  });

  const prsList = Object.values(prsMap).sort((a, b) => b.estimated1RM - a.estimated1RM);

  // 3. Agrupación por Rutinas y Comparativa de Sobrecarga Progresiva
  const routineGroups: Record<string, WorkoutSession[]> = {};
  workoutHistory.forEach(s => {
    const key = s.name || 'Entrenamiento Libre';
    if (!routineGroups[key]) {
      routineGroups[key] = [];
    }
    routineGroups[key].push(s);
  });

  const routineNames = Object.keys(routineGroups);

  // 4. Distribución de Volumen por Grupo Muscular
  const muscleVolumeMap: Record<string, { volumeKg: number; sets: number }> = {};
  workoutHistory.forEach(s => {
    s.exercises.forEach(ex => {
      const cat = ex.exerciseCategory || 'Otros';
      if (!muscleVolumeMap[cat]) {
        muscleVolumeMap[cat] = { volumeKg: 0, sets: 0 };
      }
      ex.sets.forEach(set => {
        if (set.isCompleted) {
          muscleVolumeMap[cat].sets++;
          muscleVolumeMap[cat].volumeKg += (set.weightKg * set.reps);
        }
      });
    });
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Tarjeta de Resumen Global */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Rendimiento Deportivo
            </span>
            <h2 className="text-xl font-black text-slate-100 mt-0.5">
              Informe de Entrenamiento
            </h2>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        {/* 4 Métricas Clave */}
        <div className="grid grid-cols-2 gap-2.5 font-mono-numbers">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold">
              <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
              Tonelaje Total
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
              {(totalLifetimeKg / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400">toneladas</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {totalLifetimeKg.toLocaleString()} kg levantados
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Sesiones & Series
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-100 mt-1">
              {workoutHistory.length} <span className="text-xs font-normal text-slate-400">sesiones</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-bold text-slate-300">
              {totalLifetimeSets} series efectivas
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Evolución y Sobrecarga Progresiva al Repetir Rutinas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Sobrecarga Progresiva por Rutina
            </h3>
          </div>
        </div>

        {/* Filtro de Rutina */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedRoutineFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedRoutineFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            Todas ({workoutHistory.length})
          </button>

          {routineNames.map(rName => (
            <button
              key={rName}
              onClick={() => setSelectedRoutineFilter(rName)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedRoutineFilter === rName
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {rName} ({routineGroups[rName].length})
            </button>
          ))}
        </div>

        {/* Lista de sesiones comparadas cronológicamente */}
        <div className="space-y-3">
          {routineNames
            .filter(rName => selectedRoutineFilter === 'all' || selectedRoutineFilter === rName)
            .map(rName => {
              const sessions = [...routineGroups[rName]].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              if (sessions.length === 0) return null;

              const firstSessionVolume = sessions[0].totalVolumeKg || sessions[0].exercises.reduce((acc, e) => acc + e.sets.reduce((sAcc, s) => s.isCompleted ? sAcc + (s.weightKg * s.reps) : sAcc, 0), 0);
              const latestSessionVolume = sessions[sessions.length - 1].totalVolumeKg || sessions[sessions.length - 1].exercises.reduce((acc, e) => acc + e.sets.reduce((sAcc, s) => s.isCompleted ? sAcc + (s.weightKg * s.reps) : sAcc, 0), 0);
              
              const totalGainKg = latestSessionVolume - firstSessionVolume;
              const percentGain = firstSessionVolume > 0 ? Number(((totalGainKg / firstSessionVolume) * 100).toFixed(1)) : 0;

              return (
                <div
                  key={rName}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{rName}</h4>
                      <span className="text-[11px] text-slate-400 font-mono-numbers">
                        {sessions.length} repeticiones de esta rutina
                      </span>
                    </div>

                    {sessions.length > 1 && (
                      <div className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono-numbers border ${
                        totalGainKg >= 0
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {totalGainKg >= 0 ? `+${totalGainKg} kg (+${percentGain}%)` : `${totalGainKg} kg (${percentGain}%)`}
                      </div>
                    )}
                  </div>

                  {/* Pasos / Historial de esta rutina */}
                  <div className="space-y-2">
                    {sessions.map((sess, idx) => {
                      const prevSess = sessions[idx - 1];
                      const sessVol = sess.totalVolumeKg || sess.exercises.reduce((acc, e) => acc + e.sets.reduce((sAcc, s) => s.isCompleted ? sAcc + (s.weightKg * s.reps) : sAcc, 0), 0);
                      
                      let diffVsPrev: number | null = null;
                      if (prevSess) {
                        const prevVol = prevSess.totalVolumeKg || prevSess.exercises.reduce((acc, e) => acc + e.sets.reduce((sAcc, s) => s.isCompleted ? sAcc + (s.weightKg * s.reps) : sAcc, 0), 0);
                        diffVsPrev = sessVol - prevVol;
                      }

                      const dateStr = new Date(sess.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short'
                      });

                      return (
                        <div
                          key={sess.id}
                          onClick={() => setSelectedSession(sess)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition"
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono-numbers font-bold text-[10px] flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <div>
                              <span className="text-xs font-semibold text-slate-200 block">
                                {dateStr} • {formatSecondsToTime(sess.totalDurationSeconds)}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono-numbers">
                                {sess.exercises.length} ejercicios
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 font-mono-numbers">
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-100 block">
                                {sessVol.toLocaleString()} kg
                              </span>
                              {diffVsPrev !== null && (
                                <span className={`text-[10px] font-bold ${diffVsPrev >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {diffVsPrev >= 0 ? `+${diffVsPrev} kg` : `${diffVsPrev} kg`}
                                </span>
                              )}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Sección: Récords Personales (PRs) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Récords Personales y 1RM Estimado
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono-numbers">
            {prsList.length} ejercicios
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {prsList.map(pr => (
            <div
              key={pr.exerciseName}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100 leading-tight">
                    {pr.exerciseName}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {pr.category}
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-mono-numbers font-extrabold text-[11px] border border-amber-500/20">
                  1RM: ~{pr.estimated1RM} kg
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs font-mono-numbers">
                <span className="text-slate-400">
                  Mejor Serie: <strong className="text-emerald-400">{pr.maxWeightKg} kg × {pr.maxRepsAtWeight} reps</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección: Distribución de Volumen por Grupo Muscular */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-md space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          Volumen por Grupo Muscular
        </h3>

        <div className="space-y-2.5">
          {Object.entries(muscleVolumeMap).map(([cat, data]) => {
            const pct = totalLifetimeKg > 0 ? Math.round((data.volumeKg / totalLifetimeKg) * 100) : 0;

            return (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{cat}</span>
                  <span className="font-mono-numbers font-bold text-slate-200">
                    {data.volumeKg.toLocaleString()} kg <span className="text-slate-500 text-[10px]">({data.sets} series • {pct}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                    style={{ width: `${Math.max(5, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Detalle de Sesión */}
      <WorkoutSessionDetailModal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
      />
    </div>
  );
};
