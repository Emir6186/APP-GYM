import React, { useState } from 'react';
import { Timer } from 'lucide-react';

interface RestOptionsSelectorProps {
  currentRestSeconds: number;
  onSelectRest: (seconds: number) => void;
  compact?: boolean;
}

const PRESET_OPTIONS = [30, 45, 60, 75, 90, 120, 180];

export const RestOptionsSelector: React.FC<RestOptionsSelectorProps> = ({
  currentRestSeconds,
  onSelectRest,
  compact = false
}) => {
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState(currentRestSeconds.toString());

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customValue, 10);
    if (!isNaN(val) && val > 0) {
      onSelectRest(val);
      setIsCustom(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {PRESET_OPTIONS.slice(0, 5).map(sec => (
          <button
            key={sec}
            onClick={() => onSelectRest(sec)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold font-mono-numbers transition ${
              currentRestSeconds === sec
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {sec}s
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="flex items-center gap-1.5 font-medium">
          <Timer className="w-3.5 h-3.5 text-emerald-400" />
          Descanso estipulado: <strong className="text-emerald-400 font-mono-numbers">{currentRestSeconds}s</strong>
        </span>
        <button
          type="button"
          onClick={() => setIsCustom(!isCustom)}
          className="text-emerald-400 hover:underline text-xs"
        >
          {isCustom ? 'Ver opciones' : 'Personalizar'}
        </button>
      </div>

      {isCustom ? (
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="number"
            min="5"
            max="600"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Segundos (ej: 45)"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-100 font-mono-numbers focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl font-bold text-xs"
          >
            Aplicar
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-4 gap-1.5">
          {PRESET_OPTIONS.map(sec => (
            <button
              key={sec}
              type="button"
              onClick={() => onSelectRest(sec)}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold font-mono-numbers transition border ${
                currentRestSeconds === sec
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
              }`}
            >
              {sec < 60 ? `${sec}s` : sec === 60 ? '1 min' : sec === 90 ? '1:30' : sec === 120 ? '2 min' : `${sec / 60}m`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
