import React, { useState } from 'react';
import { Play, Pause, Plus, SkipForward, ChevronDown, ChevronUp, Timer } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import { formatSecondsToTime } from '../../services/calculations';

export const RestTimerOverlay: React.FC = () => {
  const { restTimer, pauseRestTimer, resumeRestTimer, addRestSeconds, skipRestTimer } = useWorkout();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!restTimer.isActive) return null;

  const progress = restTimer.totalSeconds > 0 
    ? (restTimer.remainingSeconds / restTimer.totalSeconds) 
    : 0;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress * circumference);

  const isUrgent = restTimer.remainingSeconds <= 5;

  return (
    <div className={`fixed z-50 transition-all duration-300 ${
      isMinimized 
        ? 'bottom-20 right-4 w-auto' 
        : 'bottom-16 left-0 right-0 max-w-lg mx-auto p-3'
    }`}>
      {isMinimized ? (
        // Versión Flotante Minimizada
        <div 
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 border shadow-2xl backdrop-blur-md cursor-pointer animate-bounce ${
            isUrgent ? 'border-amber-500/80 bg-amber-950/40 text-amber-300' : 'border-emerald-500/50 text-emerald-400'
          }`}
        >
          <Timer className="w-5 h-5 animate-pulse" />
          <span className="font-mono-numbers font-extrabold text-sm">
            {formatSecondsToTime(restTimer.remainingSeconds)}
          </span>
          <ChevronUp className="w-4 h-4 text-slate-400" />
        </div>
      ) : (
        // Versión Completa
        <div className={`rounded-2xl border shadow-2xl backdrop-blur-xl transition-colors p-4 ${
          isUrgent 
            ? 'bg-slate-900/95 border-amber-500/70 shadow-amber-500/10' 
            : 'bg-slate-900/95 border-emerald-500/50 shadow-emerald-500/10'
        }`}>
          <div className="flex items-center justify-between">
            {/* Anillo de tiempo y contador */}
            <div className="flex items-center space-x-3.5">
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg className="w-16 h-16 -rotate-90 transform">
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    className="text-slate-800"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    className={`transition-all duration-1000 ${
                      isUrgent ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`font-mono-numbers font-black text-sm tracking-tight ${
                    isUrgent ? 'text-amber-400 scale-110' : 'text-slate-100'
                  }`}>
                    {formatSecondsToTime(restTimer.remainingSeconds)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Tiempo de Descanso
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-100 mt-1 line-clamp-1">
                  {restTimer.exerciseName || 'Siguiente serie'}
                </h4>
                <p className="text-xs text-slate-400">
                  Tras serie #{restTimer.setNumber} • Prepárate
                </p>
              </div>
            </div>

            {/* Controles del temporizador */}
            <div className="flex items-center space-x-1.5">
              {/* Añadir 30 seg */}
              <button
                onClick={() => addRestSeconds(30)}
                className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                title="Añadir 30 segundos"
              >
                <Plus className="w-3.5 h-3.5" />
                30s
              </button>

              {/* Pausar / Reanudar */}
              <button
                onClick={restTimer.isPaused ? resumeRestTimer : pauseRestTimer}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title={restTimer.isPaused ? "Reanudar" : "Pausar"}
              >
                {restTimer.isPaused ? (
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                ) : (
                  <Pause className="w-4 h-4 text-amber-400" />
                )}
              </button>

              {/* Saltar */}
              <button
                onClick={skipRestTimer}
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-400 border border-slate-700 transition"
                title="Saltar descanso"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Minimizar */}
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Minimizar"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
