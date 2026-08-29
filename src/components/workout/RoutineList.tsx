import React, { useState } from 'react';
import { Play, Dumbbell, Calendar, History, Clock, Camera, Plus, Edit2, Trash2, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import type { Routine, WorkoutSession } from '../../types/workout';
import { useWorkout } from '../../context/WorkoutContext';
import { formatSecondsToTime } from '../../services/calculations';
import { ExercisePickerModal } from './ExercisePickerModal';
import { CreateRoutineModal } from './CreateRoutineModal';
import { WorkoutSessionDetailModal } from './WorkoutSessionDetailModal';
import { sortRoutinesByDay, extractRoutineDayNumber } from '../../services/routineSorter';

export const RoutineList: React.FC = () => {
  const { routines, workoutHistory, startWorkout, exercises, deleteRoutine, moveRoutine } = useWorkout();
  
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isCreateRoutineOpen, setIsCreateRoutineOpen] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);
  const [selectedHistorySession, setSelectedHistorySession] = useState<WorkoutSession | null>(null);

  const handleEditRoutine = (e: React.MouseEvent, routine: Routine) => {
    e.stopPropagation();
    setRoutineToEdit(routine);
    setIsCreateRoutineOpen(true);
  };

  const handleDeleteRoutineClick = (e: React.MouseEvent, routine: Routine) => {
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de que deseas eliminar la rutina "${routine.name}"?`)) {
      deleteRoutine(routine.id);
    }
  };

  const safeHistory = Array.isArray(workoutHistory) ? workoutHistory : [];
  const safeRoutines = Array.isArray(routines) ? routines : [];

  // Rutinas ordenadas estrictamente del Día 1 al Día 7
  const sortedRoutines = sortRoutinesByDay(safeRoutines);

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
            Rutinas ordenadas del Día 1 al 7, selección múltiple y fotos en alta resolución.
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

      {/* Sección: Tus Rutinas de Entrenamiento Ordenadas del Día 1 al 7 */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-extrabold text-slate-100">
              Tus Rutinas
            </h3>
            <span className="text-xs font-mono-numbers px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
              {sortedRoutines.length}
            </span>
          </div>

          <button
            onClick={() => {
              setRoutineToEdit(null);
              setIsCreateRoutineOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            Nueva Rutina
          </button>
        </div>

        {sortedRoutines.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-slate-400 space-y-2">
            <Dumbbell className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-300">No tienes ninguna rutina creada</p>
            <p className="text-[11px] text-slate-500">Pulsa "+ Nueva Rutina" para diseñar tus días de entrenamiento.</p>
            <button
              onClick={() => {
                setRoutineToEdit(null);
                setIsCreateRoutineOpen(true);
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Crear Rutina Ahora
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRoutines.map((routine, index) => {
              if (!routine) return null;
              const routineExercises = routine.exercises || [];
              const muscleGroups = routine.muscleGroups || [];
              const dayNum = extractRoutineDayNumber(routine);

              return (
                <div
                  key={routine.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-4 hover:border-slate-700 transition shadow-md group space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        {dayNum <= 7 && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs font-mono-numbers">
                            DÍA {dayNum}
                          </span>
                        )}
                        <h4 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition truncate">
                          {routine.name}
                        </h4>
                      </div>

                      {routine.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {routine.description}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {muscleGroups.map(mg => (
                          <span
                            key={mg}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800"
                          >
                            {mg}
                          </span>
                        ))}
                        <span className="text-[10px] text-slate-400 font-mono-numbers">
                          • {routineExercises.length} ejercicios
                        </span>
                      </div>
                    </div>

                    {/* Acciones de Rutina: Reordenar, Editar, Borrar, Iniciar */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Botones de subida y bajada de posición */}
                      <div className="flex flex-col gap-0.5 mr-0.5">
                        <button
                          disabled={index === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveRoutine(routine.id, 'up');
                          }}
                          className="p-1 rounded bg-slate-950 text-slate-500 hover:text-slate-200 disabled:opacity-20 border border-slate-800 transition"
                          title="Subir posición"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          disabled={index === sortedRoutines.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveRoutine(routine.id, 'down');
                          }}
                          className="p-1 rounded bg-slate-950 text-slate-500 hover:text-slate-200 disabled:opacity-20 border border-slate-800 transition"
                          title="Bajar posición"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={(e) => handleEditRoutine(e, routine)}
                        className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition"
                        title="Editar rutina"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteRoutineClick(e, routine)}
                        className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 transition"
                        title="Eliminar rutina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => startWorkout(routine.id, routine.name)}
                        className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95 ml-1"
                        title="Iniciar esta rutina"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sección: Historial de Entrenamientos Recientes */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-extrabold text-slate-100">
              Historial de Sesiones
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium font-mono-numbers">
            {safeHistory.length} registradas
          </span>
        </div>

        {safeHistory.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-4">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Aún no has completado ninguna sesión.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">¡Inicia tu primer entrenamiento arriba para registrar tus marcas!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {safeHistory.map(session => {
              if (!session) return null;
              
              const sessionExercises = session.exercises || [];
              const dateFormatted = session.date
                ? new Date(session.date).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  })
                : 'Sesión reciente';

              const completedSetsCount = session.totalSetsCompleted ?? sessionExercises.reduce((acc, e) => acc + (e?.sets || []).filter(s => s?.isCompleted).length, 0);
              const volume = session.totalVolumeKg ?? sessionExercises.reduce((acc, e) => acc + (e?.sets || []).reduce((sAcc, s) => s?.isCompleted ? sAcc + ((s.weightKg || 0) * (s.reps || 0)) : sAcc, 0), 0);

              return (
                <div
                  key={session.id || `session_${Math.random()}`}
                  onClick={() => setSelectedHistorySession(session)}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 flex items-center justify-between hover:border-emerald-500/40 cursor-pointer transition shadow group"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <h5 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition truncate">
                      {session.name || 'Entrenamiento'}
                    </h5>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono-numbers">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {dateFormatted}
                      </span>
                      <span>
                        ⏱️ {formatSecondsToTime(session.totalDurationSeconds || 0)}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        💪 {volume.toLocaleString()} kg
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono-numbers">
                      {completedSetsCount} series
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
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

      {/* Modal Crear / Editar Rutina */}
      <CreateRoutineModal
        isOpen={isCreateRoutineOpen}
        onClose={() => {
          setIsCreateRoutineOpen(false);
          setRoutineToEdit(null);
        }}
        routineToEdit={routineToEdit}
      />

      {/* Modal Detalle de Sesión del Historial */}
      <WorkoutSessionDetailModal
        isOpen={!!selectedHistorySession}
        onClose={() => setSelectedHistorySession(null)}
        session={selectedHistorySession}
      />
    </div>
  );
};
