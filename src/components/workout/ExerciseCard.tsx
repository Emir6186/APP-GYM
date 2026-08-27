import React, { useState } from 'react';
import { Camera, Trash2, Plus, Check, Timer, ChevronDown, ChevronUp, History } from 'lucide-react';
import type { WorkoutExercise } from '../../types/workout';
import { useWorkout } from '../../context/WorkoutContext';
import { CameraModal } from '../common/CameraModal';
import { RestOptionsSelector } from './RestOptionsSelector';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  exerciseIndex
}) => {
  const {
    updateSet,
    addSet,
    removeSet,
    completeSet,
    uncompleteSet,
    removeExerciseFromActiveWorkout,
    updateExerciseTargetRest,
    updateExerciseMachinePhoto,
    getLastExercisePerformance
  } = useWorkout();

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showRestOptions, setShowRestOptions] = useState(false);

  // Obtener la última marca histórica para mostrar como referencia
  const lastPerf = getLastExercisePerformance(exercise.exerciseId);

  const handleCompleteSetAction = (setIdx: number) => {
    if (exercise.sets[setIdx].isCompleted) {
      uncompleteSet(exerciseIndex, setIdx);
    } else {
      completeSet(exerciseIndex, setIdx);
    }
  };

  return (
    <>
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden transition hover:border-slate-700/80">
        {/* Cabecera del Ejercicio */}
        <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Avatar / Foto de la máquina con botón de cámara */}
            <div className="relative group flex-shrink-0">
              <div className="w-13 h-13 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center shadow-inner">
                {exercise.exercisePhotoUrl ? (
                  <img
                    src={exercise.exercisePhotoUrl}
                    alt={exercise.exerciseName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-base">
                    {exercise.exerciseName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Botón flotante para cambiar foto de la máquina */}
              <button
                onClick={() => setIsCameraOpen(true)}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950/50 transition transform group-hover:scale-110"
                title="Tomar foto a la máquina de gym"
              >
                <Camera className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-100 leading-tight truncate">
                {exercise.exerciseName}
              </h3>
              
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">
                  {exercise.exerciseCategory}
                </span>

                {/* Botón de descanso configurado */}
                <button
                  type="button"
                  onClick={() => setShowRestOptions(!showRestOptions)}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-semibold border border-emerald-500/30 hover:bg-emerald-900/50 transition font-mono-numbers"
                >
                  <Timer className="w-3 h-3" />
                  <span>{exercise.targetRestSeconds}s descanso</span>
                  {showRestOptions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Pista de marca histórica anterior si existe */}
              {lastPerf && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-400/90 font-mono-numbers mt-1">
                  <History className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span>Última vez: <strong>{lastPerf.lastWeightKg} kg × {lastPerf.lastReps} reps</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Eliminar ejercicio de la sesión */}
          <button
            onClick={() => removeExerciseFromActiveWorkout(exerciseIndex)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition flex-shrink-0"
            title="Eliminar ejercicio de la sesión"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Acordeón de Configuración de Opciones de Descanso */}
        {showRestOptions && (
          <div className="p-3 bg-slate-950/70 border-b border-slate-800 animate-fadeIn">
            <RestOptionsSelector
              currentRestSeconds={exercise.targetRestSeconds}
              onSelectRest={(sec) => {
                updateExerciseTargetRest(exerciseIndex, sec);
                setShowRestOptions(false);
              }}
            />
          </div>
        )}

        {/* Tabla de Series Limpia (Serie, Kg, Reps, Listo) */}
        <div className="p-3">
          {/* Encabezados */}
          <div className="grid grid-cols-12 gap-2 px-1 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
            <span className="col-span-2 text-left pl-1">Serie</span>
            <span className="col-span-4">Kg</span>
            <span className="col-span-4">Reps</span>
            <span className="col-span-2">Listo</span>
          </div>

          {/* Filas de Series */}
          <div className="space-y-2 mt-1">
            {exercise.sets.map((set, setIdx) => {
              return (
                <div
                  key={set.id}
                  className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition ${
                    set.isCompleted
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  {/* Número de Serie */}
                  <div className="col-span-2 flex items-center">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono-numbers font-bold text-xs ${
                      set.isCompleted 
                        ? 'bg-emerald-500 text-slate-950' 
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{set.setNumber}
                    </span>
                  </div>

                  {/* Input de Kg */}
                  <div className="col-span-4">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      disabled={set.isCompleted}
                      value={set.weightKg === 0 ? '' : set.weightKg}
                      onChange={(e) => updateSet(exerciseIndex, setIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                      placeholder="Kg"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 px-2 text-center font-mono-numbers font-black text-sm text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                    />
                  </div>

                  {/* Input de Reps */}
                  <div className="col-span-4">
                    <input
                      type="number"
                      min="1"
                      disabled={set.isCompleted}
                      value={set.reps === 0 ? '' : set.reps}
                      onChange={(e) => updateSet(exerciseIndex, setIdx, 'reps', parseInt(e.target.value, 10) || 0)}
                      placeholder="Reps"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-2 px-2 text-center font-mono-numbers font-black text-sm text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                    />
                  </div>

                  {/* Botón de Completar Serie (Activa temporizador de descanso) */}
                  <div className="col-span-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleCompleteSetAction(setIdx)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition shadow ${
                        set.isCompleted
                          ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20 active:scale-95'
                          : 'bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 border border-slate-700'
                      }`}
                      title={set.isCompleted ? 'Desmarcar serie' : 'Completar serie e iniciar descanso'}
                    >
                      <Check className={`w-4 h-4 stroke-[3] ${set.isCompleted ? 'text-slate-950' : 'text-slate-400'}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón para Añadir Serie */}
          <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => addSet(exerciseIndex)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-emerald-400 text-xs font-bold border border-slate-700/60 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Añadir Serie
            </button>

            {exercise.sets.length > 1 && (
              <button
                type="button"
                onClick={() => removeSet(exerciseIndex, exercise.sets.length - 1)}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition"
              >
                Quitar última serie
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Cámara para cambiar avatar de esta máquina */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        exerciseName={exercise.exerciseName}
        onPhotoSaved={(photoUrl) => {
          updateExerciseMachinePhoto(exercise.exerciseId, photoUrl);
          setIsCameraOpen(false);
        }}
      />
    </>
  );
};
