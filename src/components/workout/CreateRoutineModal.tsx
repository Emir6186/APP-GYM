import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Dumbbell, Timer, Check, Eye, Calendar } from 'lucide-react';
import type { Routine, RoutineExerciseTemplate, MuscleGroup } from '../../types/workout';
import { useWorkout } from '../../context/WorkoutContext';
import { Modal } from '../common/Modal';
import { ExercisePickerModal } from './ExercisePickerModal';
import { ImageZoomModal } from '../common/ImageZoomModal';

interface CreateRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  routineToEdit?: Routine | null;
}

const MUSCLE_GROUPS_LIST: MuscleGroup[] = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio'];

const DAYS_LIST = [
  { num: 1, label: 'Día 1' },
  { num: 2, label: 'Día 2' },
  { num: 3, label: 'Día 3' },
  { num: 4, label: 'Día 4' },
  { num: 5, label: 'Día 5' },
  { num: 6, label: 'Día 6' },
  { num: 7, label: 'Día 7' },
];

export const CreateRoutineModal: React.FC<CreateRoutineModalProps> = ({
  isOpen,
  onClose,
  routineToEdit
}) => {
  const { exercises, createRoutine, updateRoutine, routines } = useWorkout();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dayNumber, setDayNumber] = useState<number | undefined>(undefined);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<MuscleGroup[]>([]);
  const [routineExercises, setRoutineExercises] = useState<RoutineExerciseTemplate[]>([]);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState<{ url?: string; title: string; subtitle?: string } | null>(null);

  useEffect(() => {
    if (routineToEdit) {
      setName(routineToEdit.name || '');
      setDescription(routineToEdit.description || '');
      setDayNumber(routineToEdit.dayNumber);
      setSelectedMuscleGroups(routineToEdit.muscleGroups || []);
      setRoutineExercises(routineToEdit.exercises || []);
    } else {
      // Por defecto sugerir el siguiente número de día disponible
      const nextDay = Math.min(7, (routines?.length || 0) + 1);
      setName(`Día ${nextDay}: `);
      setDescription('');
      setDayNumber(nextDay);
      setSelectedMuscleGroups(['Pecho']);
      setRoutineExercises([]);
    }
  }, [routineToEdit, isOpen, routines?.length]);

  const toggleMuscleGroup = (mg: MuscleGroup) => {
    setSelectedMuscleGroups(prev =>
      prev.includes(mg) ? prev.filter(m => m !== mg) : [...prev, mg]
    );
  };

  // Añadir múltiples ejercicios simultáneamente
  const handleAddMultipleExercises = (exerciseIds: string[]) => {
    const newTemplates: RoutineExerciseTemplate[] = [];
    const newGroups = new Set<MuscleGroup>(selectedMuscleGroups);

    exerciseIds.forEach(id => {
      // Si ya está en la rutina, no duplicarlo
      if (routineExercises.some(re => re.exerciseId === id)) return;

      const exMeta = exercises.find(e => e.id === id);
      if (exMeta) {
        newTemplates.push({
          exerciseId: exMeta.id,
          defaultSets: 4,
          defaultReps: 10,
          defaultWeightKg: 20,
          targetRestSeconds: exMeta.defaultRestSeconds || 60
        });

        if (exMeta.category) {
          newGroups.add(exMeta.category);
        }
      }
    });

    setRoutineExercises(prev => [...prev, ...newTemplates]);
    setSelectedMuscleGroups(Array.from(newGroups));
  };

  const handleRemoveExercise = (idx: number) => {
    setRoutineExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateExerciseField = (idx: number, field: keyof RoutineExerciseTemplate, value: number) => {
    setRoutineExercises(prev => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        [field]: value
      };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (routineToEdit) {
      updateRoutine({
        ...routineToEdit,
        name: name.trim(),
        description: description.trim(),
        dayNumber,
        muscleGroups: selectedMuscleGroups.length > 0 ? selectedMuscleGroups : ['Pecho'],
        exercises: routineExercises
      });
    } else {
      createRoutine({
        name: name.trim(),
        description: description.trim(),
        dayNumber,
        orderIndex: dayNumber || (routines.length + 1),
        muscleGroups: selectedMuscleGroups.length > 0 ? selectedMuscleGroups : ['Pecho'],
        exercises: routineExercises
      });
    }

    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={routineToEdit ? "Editar Rutina" : "Crear Nueva Rutina"}
        subtitle={routineToEdit ? "Modifica los ejercicios y series de tu rutina" : "Diseña tu rutina seleccionando tus máquinas y ejercicios"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Día (Día 1 al Día 7) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Asignar Día del Plan (1 al 7)
            </label>
            <div className="grid grid-cols-7 gap-1">
              {DAYS_LIST.map(d => {
                const isSelected = dayNumber === d.num;
                return (
                  <button
                    key={d.num}
                    type="button"
                    onClick={() => {
                      setDayNumber(d.num);
                      if (name.startsWith('Día ') || name === '') {
                        const baseTitle = name.replace(/^Día\s*\d+\s*:\s*/i, '').replace(/^Día\s*\d+/i, '').trim();
                        setName(`Día ${d.num}${baseTitle ? `: ${baseTitle}` : ': '}`);
                      }
                    }}
                    className={`py-2 rounded-xl text-xs font-bold font-mono-numbers border transition ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    D{d.num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nombre de la Rutina */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre de la Rutina *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Día 1: Pecho y Tríceps, Día 2: Espalda y Bíceps..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descripción o Enfoque (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Enfoque en hipertrofia y fuerza pesada..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Grupos Musculares */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Grupos Musculares Involucrados
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MUSCLE_GROUPS_LIST.map(mg => {
                const isSelected = selectedMuscleGroups.includes(mg);
                return (
                  <button
                    key={mg}
                    type="button"
                    onClick={() => toggleMuscleGroup(mg)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {mg}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de Ejercicios en la Rutina */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                Ejercicios ({routineExercises.length})
              </label>

              <button
                type="button"
                onClick={() => setIsExercisePickerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold border border-emerald-500/40 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                Seleccionar Ejercicios
              </button>
            </div>

            {routineExercises.length === 0 ? (
              <div 
                onClick={() => setIsExercisePickerOpen(true)}
                className="p-6 rounded-2xl bg-slate-950/60 border-2 border-dashed border-slate-800/80 hover:border-emerald-500/50 cursor-pointer text-center text-slate-400 space-y-1.5 transition"
              >
                <Dumbbell className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                <p className="text-xs font-semibold text-slate-300">Toca para seleccionar ejercicios</p>
                <p className="text-[11px] text-slate-500">Puedes marcar varios a la vez para armar tu rutina en segundos.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {routineExercises.map((re, idx) => {
                  const exMeta = exercises.find(e => e.id === re.exerciseId);
                  return (
                    <div
                      key={re.exerciseId}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono-numbers font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>

                          {/* Foto miniatura con zoom */}
                          {exMeta?.machinePhotoUrl && (
                            <div 
                              onClick={() => setZoomImage({
                                url: exMeta.machinePhotoUrl,
                                title: exMeta.name,
                                subtitle: `${exMeta.category}`
                              })}
                              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex-shrink-0 cursor-pointer relative group/img"
                              title="Tocar para ampliar foto"
                            >
                              <img src={exMeta.machinePhotoUrl} alt={exMeta.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center">
                                <Eye className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}

                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-slate-100 block truncate">
                              {exMeta?.name || 'Ejercicio'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {exMeta?.category}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                          title="Quitar de la rutina"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Configuración de Series, Reps, Kg y Descanso */}
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block mb-0.5">Series</span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={re.defaultSets}
                            onChange={(e) => handleUpdateExerciseField(idx, 'defaultSets', parseInt(e.target.value, 10) || 1)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 text-center font-mono-numbers font-bold text-slate-100"
                          />
                        </div>

                        <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block mb-0.5">Reps</span>
                          <input
                            type="number"
                            min="1"
                            value={re.defaultReps}
                            onChange={(e) => handleUpdateExerciseField(idx, 'defaultReps', parseInt(e.target.value, 10) || 1)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 text-center font-mono-numbers font-bold text-slate-100"
                          />
                        </div>

                        <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block mb-0.5">Kg Inicial</span>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={re.defaultWeightKg}
                            onChange={(e) => handleUpdateExerciseField(idx, 'defaultWeightKg', parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 text-center font-mono-numbers font-bold text-slate-100"
                          />
                        </div>

                        <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block mb-0.5 flex items-center justify-center gap-0.5">
                            <Timer className="w-2.5 h-2.5 text-emerald-400" />
                            Descanso
                          </span>
                          <select
                            value={re.targetRestSeconds}
                            onChange={(e) => handleUpdateExerciseField(idx, 'targetRestSeconds', parseInt(e.target.value, 10))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-1 text-center font-mono-numbers text-[11px] font-bold text-slate-100"
                          >
                            <option value="30">30s</option>
                            <option value="45">45s</option>
                            <option value="60">60s</option>
                            <option value="75">75s</option>
                            <option value="90">90s</option>
                            <option value="120">120s</option>
                            <option value="180">180s</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {routineToEdit ? "Guardar Cambios" : "Crear Rutina"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Selector de Ejercicios en Modo Multiselección */}
      <ExercisePickerModal
        isOpen={isExercisePickerOpen}
        onClose={() => setIsExercisePickerOpen(false)}
        multiSelect={true}
        alreadySelectedIds={routineExercises.map(re => re.exerciseId)}
        onSelectMultiple={handleAddMultipleExercises}
      />

      {/* Modal de Zoom de Imagen */}
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
