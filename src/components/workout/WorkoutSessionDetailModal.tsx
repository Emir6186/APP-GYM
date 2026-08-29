import React, { useState } from 'react';
import { Timer, Dumbbell, Trash2, Play, Award, Eye } from 'lucide-react';
import type { WorkoutSession } from '../../types/workout';
import { Modal } from '../common/Modal';
import { formatSecondsToTime } from '../../services/calculations';
import { useWorkout } from '../../context/WorkoutContext';
import { ImageZoomModal } from '../common/ImageZoomModal';

interface WorkoutSessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: WorkoutSession | null;
}

export const WorkoutSessionDetailModal: React.FC<WorkoutSessionDetailModalProps> = ({
  isOpen,
  onClose,
  session
}) => {
  const { repeatWorkoutSession, deleteWorkoutSession } = useWorkout();
  const [zoomImage, setZoomImage] = useState<{ url?: string; title: string; subtitle?: string } | null>(null);

  if (!session) return null;

  const dateFormatted = session.date 
    ? new Date(session.date).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Fecha reciente';

  const sessionExercises = session.exercises || [];

  const totalVolume = session.totalVolumeKg ?? sessionExercises.reduce((acc, ex) => {
    return acc + (ex?.sets || []).reduce((sAcc, s) => s?.isCompleted ? sAcc + ((s.weightKg || 0) * (s.reps || 0)) : sAcc, 0);
  }, 0);

  const completedSetsCount = session.totalSetsCompleted ?? sessionExercises.reduce((acc, ex) => {
    return acc + (ex?.sets || []).filter(s => s?.isCompleted).length;
  }, 0);

  const handleRepeat = () => {
    repeatWorkoutSession(session);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta sesión del historial?')) {
      deleteWorkoutSession(session.id);
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={session.name || 'Detalle de Sesión'}
        subtitle={dateFormatted}
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Banner de Métricas Resumen */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 border border-slate-800 shadow-xl">
            <div className="grid grid-cols-3 gap-2 text-center font-mono-numbers">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                  <Timer className="w-3 h-3 text-emerald-400" />
                  Duración
                </span>
                <div className="text-sm sm:text-base font-black text-slate-100 mt-0.5">
                  {formatSecondsToTime(session.totalDurationSeconds || 0)}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                  <Dumbbell className="w-3 h-3 text-emerald-400" />
                  Volumen
                </span>
                <div className="text-sm sm:text-base font-black text-emerald-400 mt-0.5">
                  {totalVolume.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">kg</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                  <Award className="w-3 h-3 text-emerald-400" />
                  Series
                </span>
                <div className="text-sm sm:text-base font-black text-slate-100 mt-0.5">
                  {completedSetsCount} <span className="text-[10px] font-normal text-slate-400">listas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detalle de cada ejercicio realizado */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              Ejercicios Realizados ({sessionExercises.length})
            </h4>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {sessionExercises.map((ex, exIdx) => {
                const exSets = ex?.sets || [];
                const exVolume = exSets.reduce((acc, s) => s?.isCompleted ? acc + ((s.weightKg || 0) * (s.reps || 0)) : acc, 0);

                return (
                  <div
                    key={`${ex.exerciseId}_${exIdx}`}
                    className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-md"
                  >
                    {/* Cabecera del Ejercicio */}
                    <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {/* Miniatura ampliable */}
                        <div 
                          onClick={() => {
                            if (ex.exercisePhotoUrl) {
                              setZoomImage({
                                url: ex.exercisePhotoUrl,
                                title: ex.exerciseName,
                                subtitle: ex.exerciseCategory
                              });
                            }
                          }}
                          className={`w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0 relative group/pic ${
                            ex.exercisePhotoUrl ? 'cursor-pointer' : ''
                          }`}
                          title={ex.exercisePhotoUrl ? "Tocar para ampliar foto" : undefined}
                        >
                          {ex.exercisePhotoUrl ? (
                            <>
                              <img src={ex.exercisePhotoUrl} alt={ex.exerciseName} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/pic:opacity-100 flex items-center justify-center transition">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </>
                          ) : (
                            (ex.exerciseName || 'E').charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs sm:text-sm font-bold text-slate-100 leading-tight truncate">
                            {ex.exerciseName}
                          </h5>
                          <span className="text-[10px] text-slate-400">
                            {ex.exerciseCategory}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono-numbers font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 flex-shrink-0">
                        {exVolume.toLocaleString()} kg
                      </span>
                    </div>

                    {/* Tabla de Series */}
                    <div className="p-3">
                      <div className="grid grid-cols-4 gap-2 text-[10px] font-bold uppercase text-slate-400 text-center pb-1 border-b border-slate-800/60">
                        <span>Serie</span>
                        <span>Kg</span>
                        <span>Reps</span>
                        <span>Estado</span>
                      </div>

                      <div className="space-y-1.5 mt-1.5 font-mono-numbers text-xs text-center">
                        {exSets.map((set, sIdx) => (
                          <div
                            key={set?.id || `set_${sIdx}`}
                            className={`grid grid-cols-4 gap-2 py-1.5 px-2 rounded-lg items-center ${
                              set?.isCompleted ? 'bg-slate-900/80 text-slate-200' : 'bg-slate-950 text-slate-500 line-through'
                            }`}
                          >
                            <span className="font-bold text-emerald-400 text-left pl-2">
                              #{set?.setNumber || sIdx + 1}
                            </span>
                            <span className="font-bold text-slate-100">
                              {set?.weightKg || 0} kg
                            </span>
                            <span className="font-bold text-slate-100">
                              {set?.reps || 0} reps
                            </span>
                            <span className={`text-[11px] font-sans font-semibold ${set?.isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {set?.isCompleted ? 'Completada' : 'Pendiente'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleDelete}
              className="p-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 transition flex items-center justify-center"
              title="Eliminar sesión"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleRepeat}
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              Repetir este Entrenamiento
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Zoom de Imagen */}
      <ImageZoomModal
        isOpen={!!zoomImage}
        onClose={() => setZoomImage(null)}
        imageUrl={zoomImage?.url}
        title={zoomImage?.title || ''}
        subtitle={zoomImage?.subtitle}
      />
    </>
  );
};
