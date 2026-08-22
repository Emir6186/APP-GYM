import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Dumbbell, Timer, Check } from 'lucide-react';
import type { Routine, RoutineExerciseTemplate, MuscleGroup } from '../../types/workout';
import { useWorkout } from '../../context/WorkoutContext';
import { Modal } from '../common/Modal';
import { ExercisePickerModal } from './ExercisePickerModal';

interface CreateRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  routineToEdit?: Routine | null;
}

const MUSCLE_GROUPS_LIST: MuscleGroup[] = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio'];

export const CreateRoutineModal: React.FC<CreateRoutineModalProps> = ({
  isOpen,
  onClose,
  routineToEdit
}) => {
  const { exercises, createRoutine, updateRoutine } = useWorkout();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<MuscleGroup[]>([]);
  const [routineExercises, setRoutineExercises] = useState<RoutineExerciseTemplate[]>([]);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);

  useEffect(() => {
    if (routineToEdit) {
      setName(routineToEdit.name);
      setDescription(routineToEdit.description || '');
      setSelectedMuscleGroups(routineToEdit.muscleGroups || []);
      setRoutineExercises(routineToEdit.exercises || []);
    } else {
      setName('');
      setDescription('');
      setSelectedMuscleGroups(['Pecho']);
      setRoutineExercises([]);
    }
  }, [routineToEdit, isOpen]);

  const toggleMuscleGroup = (mg: MuscleGroup) => {
    setSelectedMuscleGroups(prev =>
      prev.includes(mg) ? prev.filter(m => m !== mg) : [...prev, mg]
    );
  };

  const handleAddExercise = (exerciseId: string) => {
    const exMeta = exercises.find(e => e.id === exerciseId);
    if (!exMeta) return;

    // Si ya está, no duplicarlo
    if (routineExercises.some(re => re.exerciseId === exerciseId)) return;

    const newTemplate: RoutineExerciseTemplate = {
      exerciseId: exMeta.id,
      defaultSets: 4,
      defaultReps: 10,
      defaultWeightKg: 20,
      targetRestSeconds: exMeta.defaultRestSeconds || 60
    };

    setRoutineExercises(prev => [...prev, newTemplate]);

    // Añadir grupo muscular si no está
    if (!selectedMuscleGroups.includes(exMeta.category)) {
      setSelectedMuscleGroups(prev => [...prev, exMeta.category]);
    }
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
        muscleGroups: selectedMuscleGroups.length > 0 ? selectedMuscleGroups : ['Pecho'],
        exercises: routineExercises
      });
    } else {
      createRoutine({
        name: name.trim(),
        description: description.trim(),
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
        subtitle={routineToEdit ? "Modifica los ejercicios y series de tu rutina" : "Diseña tu rutina personalizada con máquinas y ejercicios"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre de la Rutina */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre de la Rutina *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Torso / Pierna A, Push Day, Brazos y Hombros..."
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold border border-emerald-500/40 transition"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                Añadir Ejercicio
              </button>
            </div>

            {routineExercises.length === 0 ? (
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center text-slate-400">
                <p className="text-xs">No has añadido ejercicios a esta rutina todavía.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Pulsa "+ Añadir Ejercicio" para seleccionar del catálogo de máquinas.</p>
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
                        <div className="flex items-center space-x-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono-numbers font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-slate-100">
                            {exMeta?.name || 'Ejercicio'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {exMeta?.category}
                          </span>
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

                      {/* Configuración rápida de Series, Reps, Kg y Descanso */}
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

      {/* Modal Selector de Ejercicios */}
      <ExercisePickerModal
        isOpen={isExercisePickerOpen}
        onClose={() => setIsExercisePickerOpen(false)}
        onSelectExercise={(exId) => {
          handleAddExercise(exId);
        }}
      />
    </>
  );
};
