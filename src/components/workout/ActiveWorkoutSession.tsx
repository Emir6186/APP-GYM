import React, { useState, useEffect } from 'react';
import { Timer, Dumbbell, Plus, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import { ExerciseCard } from './ExerciseCard';
import { ExercisePickerModal } from './ExercisePickerModal';
import { Modal } from '../common/Modal';
import { formatSecondsToTime } from '../../services/calculations';

export const ActiveWorkoutSession: React.FC = () => {
  const { 
    activeSession, 
    finishWorkout, 
    cancelWorkout, 
    addExerciseToActiveWorkout, 
    addMultipleExercisesToActiveWorkout 
  } = useWorkout();
  
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Cronómetro de la sesión general
  useEffect(() => {
    if (!activeSession) return;

    // Calcular segundos desde inicio
    const updateElapsed = () => {
      const now = Date.now();
      const secs = Math.floor((now - activeSession.startTime) / 1000);
      setElapsedSeconds(secs);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) return null;

  // Calcular métricas en vivo de forma segura
  let totalVolumeKg = 0;
  let totalSets = 0;
  let completedSets = 0;

  const safeExercises = activeSession.exercises || [];

  safeExercises.forEach(ex => {
    const exSets = ex?.sets || [];
    exSets.forEach(set => {
      totalSets++;
      if (set && set.isCompleted) {
        completedSets++;
        totalVolumeKg += ((set.weightKg || 0) * (set.reps || 0));
      }
    });
  });

  const completionPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <div className="space-y-4 pb-28">
      {/* Banner de Estado de la Sesión en Vivo */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Sesión en Curso
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-100 mt-1">
              {activeSession.name}
            </h2>
          </div>

          {/* Cronómetro total */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
            <Timer className="w-4 h-4 text-emerald-400" />
            <span className="font-mono-numbers font-extrabold text-sm text-emerald-300">
              {formatSecondsToTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Métricas rápidas de la sesión */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <div className="text-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Series</div>
            <div className="text-sm font-bold text-slate-200 font-mono-numbers mt-0.5">
              {completedSets} / {totalSets}
            </div>
          </div>

          <div className="text-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Volumen Total</div>
            <div className="text-sm font-bold text-emerald-400 font-mono-numbers mt-0.5">
              {totalVolumeKg.toLocaleString()} kg
            </div>
          </div>

          <div className="text-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/50">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Progreso</div>
            <div className="text-sm font-bold text-amber-400 font-mono-numbers mt-0.5">
              {completionPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Ejercicios */}
      <div className="space-y-4">
        {activeSession.exercises.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
            <Dumbbell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200">No hay ejercicios en esta sesión</h3>
            <p className="text-xs text-slate-400 mt-1">Añade tu primer ejercicio o máquina para comenzar.</p>
            <button
              onClick={() => setIsPickerOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Añadir Primer Ejercicio
            </button>
          </div>
        ) : (
          activeSession.exercises.map((exercise, index) => (
            <ExerciseCard
              key={`${exercise.exerciseId}_${index}`}
              exercise={exercise}
              exerciseIndex={index}
            />
          ))
        )}
      </div>

      {/* Botón para Añadir Más Ejercicios */}
      <button
        onClick={() => setIsPickerOpen(true)}
        className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-dashed border-slate-700/80 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 transition"
      >
        <Plus className="w-5 h-5" />
        Añadir Otro Ejercicio / Máquina
      </button>

      {/* Botones de Finalizar / Cancelar Sesión */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="flex-1 py-3.5 rounded-2xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 font-semibold text-sm transition flex items-center justify-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          Cancelar
        </button>

        <button
          onClick={() => setShowFinishConfirm(true)}
          className="flex-2 flex-[2] py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          Finalizar Entrenamiento
        </button>
      </div>

      {/* Modal Selector de Ejercicios */}
      <ExercisePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        multiSelect={true}
        alreadySelectedIds={safeExercises.map(e => e.exerciseId)}
        onSelectExercise={(exId) => {
          addExerciseToActiveWorkout(exId);
        }}
        onSelectMultiple={(exIds) => {
          addMultipleExercisesToActiveWorkout(exIds);
        }}
      />

      {/* Modal Confirmar Finalizar Entrenamiento */}
      <Modal
        isOpen={showFinishConfirm}
        onClose={() => setShowFinishConfirm(false)}
        title="¿Completar Entrenamiento?"
        subtitle="¡Gran trabajo! Se registrará en tu historial."
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400">Tiempo Total</div>
              <div className="text-base font-bold text-slate-100 font-mono-numbers">
                {formatSecondsToTime(elapsedSeconds)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] text-slate-400">Carga Levantada</div>
              <div className="text-base font-bold text-emerald-400 font-mono-numbers">
                {totalVolumeKg.toLocaleString()} kg
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowFinishConfirm(false)}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm"
            >
              Continuar Entrenando
            </button>
            <button
              onClick={() => {
                setShowFinishConfirm(false);
                finishWorkout();
              }}
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20"
            >
              Guardar y Salir
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Confirmar Cancelar */}
      <Modal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="¿Descartar Sesión?"
        subtitle="Los cambios no guardados se perderán."
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-slate-300">
            ¿Estás seguro de que deseas cancelar la sesión de entrenamiento actual?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm"
            >
              No, volver
            </button>
            <button
              onClick={() => {
                setShowCancelConfirm(false);
                cancelWorkout();
              }}
              className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm"
            >
              Sí, descartar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
