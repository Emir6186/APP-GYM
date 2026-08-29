import React, { useState } from 'react';
import { Search, Plus, Camera, Dumbbell, Check, Eye } from 'lucide-react';
import type { MuscleGroup } from '../../types/workout';
import { useWorkout } from '../../context/WorkoutContext';
import { Modal } from '../common/Modal';
import { CameraModal } from '../common/CameraModal';
import { RestOptionsSelector } from './RestOptionsSelector';
import { ImageZoomModal } from '../common/ImageZoomModal';

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise?: (exerciseId: string) => void;
  onSelectMultiple?: (exerciseIds: string[]) => void;
  multiSelect?: boolean;
  alreadySelectedIds?: string[];
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
  onSelectExercise,
  onSelectMultiple,
  multiSelect = false,
  alreadySelectedIds = []
}) => {
  const { exercises, createExercise } = useWorkout();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | 'Todos'>('Todos');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Zoom de imagen
  const [zoomImage, setZoomImage] = useState<{ url?: string; title: string; subtitle?: string } | null>(null);

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

  const handleToggleSelect = (exId: string) => {
    if (multiSelect) {
      setSelectedIds(prev => 
        prev.includes(exId) ? prev.filter(id => id !== exId) : [...prev, exId]
      );
    } else {
      if (onSelectExercise) {
        onSelectExercise(exId);
        onClose();
      }
    }
  };

  const handleConfirmMultiSelect = () => {
    if (onSelectMultiple && selectedIds.length > 0) {
      onSelectMultiple(selectedIds);
    }
    setSelectedIds([]);
    onClose();
  };

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

    if (multiSelect) {
      setSelectedIds(prev => [...prev, created.id]);
      setIsCreatingNew(false);
    } else {
      if (onSelectExercise) onSelectExercise(created.id);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setIsCreatingNew(false);
    setNewExName('');
    setNewExGroup('Pecho');
    setNewExRest(60);
    setNewExPhoto(undefined);
    setSelectedIds([]);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          resetForm();
          onClose();
        }}
        title={isCreatingNew ? "Nuevo Ejercicio / Máquina" : multiSelect ? "Selección Múltiple de Ejercicios" : "Seleccionar Ejercicio"}
        subtitle={isCreatingNew ? "Toma foto a la máquina y configura tu ejercicio" : multiSelect ? "Marca todos los ejercicios que deseas añadir a la rutina" : "Añadir a tu sesión"}
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
          // Lista de Ejercicios Existentes con Multi-Selección
          <div className="space-y-4">
            {/* Barra de búsqueda y botón nuevo */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o músculo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
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

            {/* Grid de ejercicios con soporte para zoom de imagen y multiselección */}
            <div className="grid grid-cols-1 gap-2 max-h-[48vh] overflow-y-auto pr-1">
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
                filteredExercises.map(ex => {
                  const isSelected = selectedIds.includes(ex.id);
                  const isAlreadyInRoutine = alreadySelectedIds.includes(ex.id);

                  return (
                    <div
                      key={ex.id}
                      onClick={() => handleToggleSelect(ex.id)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition select-none ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
                          : isAlreadyInRoutine
                          ? 'bg-slate-900/40 border-slate-800 opacity-60'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Avatar / Foto de la máquina con lupa de zoom */}
                        <div 
                          onClick={(e) => {
                            if (ex.machinePhotoUrl) {
                              e.stopPropagation();
                              setZoomImage({
                                url: ex.machinePhotoUrl,
                                title: ex.name,
                                subtitle: `${ex.category} • Descanso: ${ex.defaultRestSeconds || 60}s`
                              });
                            }
                          }}
                          className="relative w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner group/photo"
                          title={ex.machinePhotoUrl ? "Tocar para ampliar foto" : undefined}
                        >
                          {ex.machinePhotoUrl ? (
                            <>
                              <img
                                src={ex.machinePhotoUrl}
                                alt={ex.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </>
                          ) : (
                            <Dumbbell className="w-5 h-5 text-slate-500" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                            {ex.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">
                              {ex.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono-numbers">
                              {ex.defaultRestSeconds || 60}s
                            </span>
                            {isAlreadyInRoutine && (
                              <span className="text-[9px] text-slate-500 italic">
                                (Ya en rutina)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Indicador de selección */}
                      <div className="flex items-center pr-1 flex-shrink-0">
                        {multiSelect ? (
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                            isSelected
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                              : 'bg-slate-950 border-slate-700 text-transparent'
                          }`}>
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <button className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition font-semibold text-xs">
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Barra de acción flotante para selección múltiple */}
            {multiSelect && (
              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIds([]);
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={selectedIds.length === 0}
                  onClick={handleConfirmMultiSelect}
                  className="flex-2 flex-[2] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Añadir {selectedIds.length > 0 ? `(${selectedIds.length})` : ''} a la Rutina
                </button>
              </div>
            )}
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

      {/* Modal de Zoom de Foto de la Máquina */}
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
