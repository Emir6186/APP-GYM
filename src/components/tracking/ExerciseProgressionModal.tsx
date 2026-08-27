import React from 'react';
import { Dumbbell, TrendingUp } from 'lucide-react';
import { Modal } from '../common/Modal';
import { estimateOneRepMax } from '../../services/calculations';
import type { WorkoutSession } from '../../types/workout';

interface ExerciseProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  workoutHistory: WorkoutSession[];
}

interface SessionExerciseLog {
  date: string;
  bestWeightKg: number;
  bestReps: number;
  estimated1RM: number;
  totalVolume: number;
  totalSets: number;
  sessionName: string;
}

export const ExerciseProgressionModal: React.FC<ExerciseProgressionModalProps> = ({
  isOpen,
  onClose,
  exerciseName,
  workoutHistory
}) => {
  if (!exerciseName) return null;

  // Filtrar todas las sesiones donde se realizó este ejercicio
  const logs: SessionExerciseLog[] = [];
  let photoUrl: string | undefined = undefined;
  let category = 'Gimnasio';

  // Ordenar cronológicamente (más antiguo a más reciente)
  const sortedSessions = [...workoutHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedSessions.forEach(session => {
    const match = session.exercises.find(e => e.exerciseName.toLowerCase() === exerciseName.toLowerCase());
    if (match) {
      if (match.exercisePhotoUrl) photoUrl = match.exercisePhotoUrl;
      if (match.exerciseCategory) category = match.exerciseCategory;

      let maxWeight = 0;
      let maxRepsAtMaxWeight = 0;
      let max1RM = 0;
      let exerciseVolume = 0;
      let completedSetsCount = 0;

      match.sets.forEach(s => {
        if (s.isCompleted || s.weightKg > 0) {
          exerciseVolume += (s.weightKg * s.reps);
          completedSetsCount++;

          const oneRm = estimateOneRepMax(s.weightKg, s.reps);
          if (oneRm > max1RM) max1RM = oneRm;

          if (s.weightKg > maxWeight) {
            maxWeight = s.weightKg;
            maxRepsAtMaxWeight = s.reps;
          } else if (s.weightKg === maxWeight && s.reps > maxRepsAtMaxWeight) {
            maxRepsAtMaxWeight = s.reps;
          }
        }
      });

      if (completedSetsCount > 0) {
        logs.push({
          date: session.date,
          bestWeightKg: maxWeight,
          bestReps: maxRepsAtMaxWeight,
          estimated1RM: max1RM,
          totalVolume: exerciseVolume,
          totalSets: completedSetsCount,
          sessionName: session.name
        });
      }
    }
  });

  const firstSession = logs[0];
  const latestSession = logs[logs.length - 1];

  let totalWeightGain = 0;
  let percentGain = 0;
  let best1RMOverall = 0;
  let bestWeightOverall = 0;
  let bestRepsOverall = 0;

  logs.forEach(l => {
    if (l.estimated1RM > best1RMOverall) best1RMOverall = l.estimated1RM;
    if (l.bestWeightKg > bestWeightOverall) {
      bestWeightOverall = l.bestWeightKg;
      bestRepsOverall = l.bestReps;
    }
  });

  if (firstSession && latestSession && firstSession.bestWeightKg > 0) {
    totalWeightGain = latestSession.bestWeightKg - firstSession.bestWeightKg;
    percentGain = Number(((totalWeightGain / firstSession.bestWeightKg) * 100).toFixed(1));
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exerciseName}
      subtitle={`Evolución y comparativa histórica • ${category}`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Banner de Récord y Progreso */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center text-emerald-400 font-bold text-lg flex-shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt={exerciseName} className="w-full h-full object-cover" />
              ) : (
                <Dumbbell className="w-6 h-6" />
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Récord Personal (PR)</span>
              <div className="text-xl font-black font-mono-numbers text-emerald-400">
                {bestWeightOverall} kg <span className="text-xs font-normal text-slate-300">× {bestRepsOverall} reps</span>
              </div>
              <span className="text-xs text-slate-400 font-mono-numbers">
                1RM Estimado: <strong className="text-amber-400">~{best1RMOverall} kg</strong>
              </span>
            </div>
          </div>

          {logs.length > 1 && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 font-mono-numbers">
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Progreso en Carga</span>
                <span className={`text-sm font-black ${totalWeightGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {totalWeightGain >= 0 ? `+${totalWeightGain} kg` : `${totalWeightGain} kg`} ({percentGain}%)
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Sesiones Registradas</span>
                <span className="text-sm font-black text-slate-200">
                  {logs.length} entrenamientos
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Historial Cronológico de Sesiones con este ejercicio */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Evolución Sesión a Sesión ({logs.length})
          </h4>

          {logs.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950 text-center text-slate-500 text-xs">
              Aún no hay series registradas para este ejercicio.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {[...logs].reverse().map((log, idx) => {
                const prevLog = [...logs].reverse()[idx + 1];
                const diffVsPrev = prevLog ? log.bestWeightKg - prevLog.bestWeightKg : null;

                const dateFormatted = new Date(log.date).toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                });

                return (
                  <div
                    key={`${log.date}_${idx}`}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono-numbers text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">{dateFormatted}</span>
                        <span className="text-[10px] text-slate-500">• {log.sessionName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {log.totalSets} series • Vol: {log.totalVolume.toLocaleString()} kg
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-slate-100 text-sm">
                        {log.bestWeightKg} kg <span className="text-slate-400 font-normal text-[11px]">× {log.bestReps} reps</span>
                      </div>
                      {diffVsPrev !== null && diffVsPrev !== 0 && (
                        <span className={`text-[10px] font-bold ${diffVsPrev > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {diffVsPrev > 0 ? `+${diffVsPrev} kg 📈` : `${diffVsPrev} kg 📉`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botón de Cierre */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};
