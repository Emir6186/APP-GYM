import React, { useState } from 'react';
import { Camera, Scale, Ruler, CheckCircle2 } from 'lucide-react';
import { useTracking } from '../../context/TrackingContext';
import { Modal } from '../common/Modal';
import { CameraModal } from '../common/CameraModal';

interface WeeklyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyCheckInModal: React.FC<WeeklyCheckInModalProps> = ({
  isOpen,
  onClose
}) => {
  const { weeklyCheckIns, addWeeklyCheckIn, profile } = useTracking();

  const nextWeekNumber = weeklyCheckIns.length > 0 
    ? Math.max(...weeklyCheckIns.map(c => c.weekNumber)) + 1 
    : 1;

  const [weekNumber] = useState(nextWeekNumber);
  const [weightKg, setWeightKg] = useState(profile.weightKg.toString());
  const [waistCm, setWaistCm] = useState('84.0');
  const [chestCm, setChestCm] = useState('103.0');
  const [armCm, setArmCm] = useState('37.5');
  const [thighCm, setThighCm] = useState('58.0');
  const [bodyFat] = useState('16.5');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const weight = parseFloat(weightKg);
    const waist = parseFloat(waistCm);

    if (isNaN(weight) || isNaN(waist)) return;

    addWeeklyCheckIn({
      date: new Date().toISOString(),
      weekNumber: Number(weekNumber),
      weightKg: weight,
      waistCircumferenceCm: waist,
      chestCm: parseFloat(chestCm) || undefined,
      armCm: parseFloat(armCm) || undefined,
      thighCm: parseFloat(thighCm) || undefined,
      bodyFatPercentage: parseFloat(bodyFat) || undefined,
      notes: notes.trim() || 'Control semanal completado con éxito.',
      photoUrl,
      energyLevel: 5,
      trainingCompliance: 100
    });

    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Nueva Revisión Semanal"
        subtitle={`Control de evolución corporal - Semana ${weekNumber}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Métricas Principales: Peso y Cintura */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                Peso Corporal (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Ej: 78.5"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-lg font-black font-mono-numbers text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 bg-emerald-950/10">
              <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1.5">
                <Ruler className="w-3.5 h-3.5" />
                Ancho de Cintura (cm) *
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
                placeholder="Ej: 84.0"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-lg font-black font-mono-numbers text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">A nivel del ombligo en ayunas</span>
            </div>
          </div>

          {/* Medidas Adicionales */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Perímetros adicionales y Grasa estimada
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Pecho (cm)</span>
                <input
                  type="number"
                  step="0.5"
                  value={chestCm}
                  onChange={(e) => setChestCm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-bold font-mono-numbers text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Brazo (cm)</span>
                <input
                  type="number"
                  step="0.5"
                  value={armCm}
                  onChange={(e) => setArmCm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-bold font-mono-numbers text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Muslo (cm)</span>
                <input
                  type="number"
                  step="0.5"
                  value={thighCm}
                  onChange={(e) => setThighCm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-bold font-mono-numbers text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Foto de Control */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Foto de Evolución (Opcional)
            </label>
            <div
              onClick={() => setIsCameraOpen(true)}
              className="p-3 rounded-2xl bg-slate-950 border border-dashed border-slate-800 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between transition"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Control" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    {photoUrl ? 'Foto añadida' : 'Tomar / Subir foto'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {photoUrl ? 'Tocar para cambiar' : 'Frontal, lateral o de espalda'}
                  </span>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-semibold">Abrir Cámara</span>
            </div>
          </div>

          {/* Notas de la semana */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Sensaciones y Notas de la Semana
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: He aumentado pesos en sentadilla, buena energía y sin sensación de hambre."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              Guardar Revisión
            </button>
          </div>
        </form>
      </Modal>

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        exerciseName={`Control Semana ${weekNumber}`}
        onPhotoSaved={(url) => {
          setPhotoUrl(url);
          setIsCameraOpen(false);
        }}
      />
    </>
  );
};
