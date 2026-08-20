import React, { useState } from 'react';
import { Search, Plus, Camera, Dumbbell } from 'lucide-react';
import type { MuscleGroup } from '../../types/workout';
import { useWorkout } from '../../context/WorkoutContext';
import { Modal } from '../common/Modal';
import { CameraModal } from '../common/CameraModal';
import { RestOptionsSelector } from './RestOptionsSelector';

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exerciseId: string) => void;
}

const MUSCLE_GROUPS: (MuscleGroup | 'Todos')[] = [
  'Todos',
  'Pecho',
  'Espalda',
  'Piernas',
  'Hombros',
  'Brazos',
  'Core'
];

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise
}) => {
  const { exercises, createExercise } = useWorkout();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | 'Todos'>('Todos');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Formulario para nuevo ejercicio
  const [newExName, setNewExName] = useState('');
  const [newExGroup, setNewExGroup] = useState<MuscleGroup>('Pecho');
  const [newExRest, setNewExRest] = useState(60);
  const [newExPhoto, setNewExPhoto] = useState<string | undefined>(undefined);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Filtrado de ejercicios
  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ex.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'Todos' || ex.category === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const created = createExercise({
      name: newExName.trim(),
      category: newExGroup,
      defaultRestSeconds: newExRest,
      machinePhotoUrl: newExPhoto,
      description: 'Ejercicio personalizado creado por el usuario'
    });

    onSelectExercise(created.id);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setIsCreatingNew(false);
    setNewExName('');
    setNewExGroup('Pecho');
    setNewExRest(60);
    setNewExPhoto(undefined);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          resetForm();
          onClose();
        }}
        title={isCreatingNew ? "Nuevo Ejercicio / Máquina" : "Seleccionar Ejercicio"}
        subtitle={isCreatingNew ? "Toma foto a la máquina y configura tu ejercicio" : "Añadir a tu rutina actual"}
        maxWidth="lg"
      >
        {isCreatingNew ? (
          // Formulario de creación de ejercicio con foto de máquina
          <form onSubmit={handleCreateExercise} className="space-y-4">
            {/* Foto de la máquina */}
            <div className="flex flex-col items-center justify-center">
              <div 
                onClick={() => setIsCameraOpen(true)}
                className="relative w-32 h-32 rounded-2xl bg-slate-950 border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 overflow-hidden cursor-pointer flex flex-col items-center justify-center group transition"
              >
                {newExPhoto ? (
                  <>
                    <img src={newExPhoto} alt="Máquina" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center p-2 text-slate-400 group-hover:text-emerald-400">
                    <Camera className="w-8 h-8 mb-1 text-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-semibold">Foto Máquina</span>
                    <span className="text-[9px] text-slate-500">Tocar para abrir</span>
                  </div>
                )}
              </div>
            </div>

            {/* Nombre del ejercicio */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Ejercicio / Máquina *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Press Pecho en Máquina Hammer"
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Grupo muscular */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Grupo Muscular Principal
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {MUSCLE_GROUPS.filter(g => g !== 'Todos').map(group => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setNewExGroup(group as MuscleGroup)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border transition ${
                      newExGroup === group
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Descanso por defecto */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tiempo de descanso tras cada serie
              </label>
              <RestOptionsSelector
                currentRestSeconds={newExRest}
                onSelectRest={setNewExRest}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold border border-slate-700"
              >
                Volver a la lista
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20"
              >
                Guardar y Usar
              </button>
            </div>
          </form>
        ) : (
          // Lista de Ejercicios Existentes
          <div className="space-y-4">
            {/* Barra de búsqueda y botón nuevo */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar ejercicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={() => setIsCreatingNew(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 font-semibold text-xs transition whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Crear</span>
              </button>
            </div>

            {/* Filtros de grupos musculares */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {MUSCLE_GROUPS.map(group => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-medium transition ${
                    selectedGroup === group
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Grid de ejercicios */}
            <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Dumbbell className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-medium">No se encontraron ejercicios</p>
                  <p className="text-xs text-slate-500 mt-1">¿Deseas crear uno nuevo con la foto de tu máquina?</p>
                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    <Camera className="w-4 h-4" />
                    Crear nuevo con foto
                  </button>
                </div>
              ) : (
                filteredExercises.map(ex => (
                  <div
                    key={ex.id}
                    onClick={() => {
                      onSelectExercise(ex.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500/50 cursor-pointer transition group"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar / Foto de la máquina */}
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
                        {ex.machinePhotoUrl ? (
                          <img
                            src={ex.machinePhotoUrl}
                            alt={ex.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Dumbbell className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition">
                          {ex.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-700/60 text-slate-300 font-medium">
                            {ex.category}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono-numbers">
                            Descanso: {ex.defaultRestSeconds}s
                          </span>
                        </div>
                      </div>
                    </div>

                    <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition font-semibold text-xs">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Cámara para fotografiar la máquina */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        exerciseName={newExName || 'Nueva Máquina'}
        onPhotoSaved={(photoUrl) => {
          setNewExPhoto(photoUrl);
          setIsCameraOpen(false);
        }}
      />
    </>
  );
};
