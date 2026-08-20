import React, { useState } from 'react';
import { Play, Dumbbell, Calendar, History, Clock, Camera } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import { formatSecondsToTime } from '../../services/calculations';
import { ExercisePickerModal } from './ExercisePickerModal';

export const RoutineList: React.FC = () => {
  const { routines, workoutHistory, startWorkout, exercises } = useWorkout();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Banner: Iniciar Sesión Rápida */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 p-5 text-white shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-950/40 backdrop-blur-md text-emerald-300 border border-emerald-400/30">
            <Dumbbell className="w-3.5 h-3.5" />
            ¡Listo para entrenar!
          </span>

          <h2 className="text-2xl font-black mt-3 tracking-tight leading-tight">
            Supera tus marcas de hoy
          </h2>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-xs">
            Cronometra tus series, controla el tiempo de descanso y fotografía tus máquinas.
          </p>

          <div className="flex gap-2.5 mt-5">
            <button
              onClick={() => startWorkout(undefined, 'Entrenamiento Libre')}
              className="flex-1 py-3 px-4 rounded-xl bg-white text-slate-950 font-black text-xs sm:text-sm hover:bg-slate-100 transition shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              Entrenamiento Libre
            </button>

            <button
              onClick={() => setIsLibraryOpen(true)}
              className="py-3 px-3.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 backdrop-blur-md text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5"
              title="Biblioteca de Máquinas"
            >
              <Camera className="w-4 h-4 text-emerald-300" />
              <span>Máquinas ({exercises.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sección: Rutinas Predefinidas */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            Tus Rutinas
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {routines.length} disponibles
          </span>
        </div>

        <div className="space-y-3">
          {routines.map(routine => (
            <div
              key={routine.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-4 hover:border-slate-700 transition shadow-md group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition">
                    {routine.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {routine.description}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                    {routine.muscleGroups.map(mg => (
                      <span
                        key={mg}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {mg}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-400">
                      • {routine.exercises.length} ejercicios
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => startWorkout(routine.id, routine.name)}
                  className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95"
                  title="Iniciar esta rutina"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección: Historial de Entrenamientos Recientes */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            Historial de Sesiones
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {workoutHistory.length} registradas
          </span>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-4">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Aún no has completado ninguna sesión.</p>
            <p className="text-[11px] text-slate-500">¡Inicia tu primer entrenamiento arriba!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {workoutHistory.slice(0, 5).map(session => {
              const dateFormatted = new Date(session.date).toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              });

              return (
                <div
                  key={session.id}
                  className="rounded-xl bg-slate-900/70 border border-slate-800 p-3.5 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-sm font-bold text-slate-200">{session.name}</h5>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono-numbers">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {dateFormatted}
                      </span>
                      <span>
                        ⏱️ {formatSecondsToTime(session.totalDurationSeconds)}
                      </span>
                      <span>
                        💪 {session.totalVolumeKg?.toLocaleString() || 0} kg
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {session.totalSetsCompleted || session.exercises.reduce((acc, e) => acc + e.sets.filter(s => s.isCompleted).length, 0)} series
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Biblioteca de Ejercicios y Fotos de Máquinas */}
      <ExercisePickerModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectExercise={() => {
          startWorkout(undefined, 'Entrenamiento Libre');
        }}
      />
    </div>
  );
};
