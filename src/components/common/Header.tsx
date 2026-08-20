import React from 'react';
import { Dumbbell, Flame, QrCode } from 'lucide-react';
import { useWorkout } from '../../context/WorkoutContext';
import { useTracking } from '../../context/TrackingContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenProfile?: () => void;
  onOpenMobileConnect?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenProfile,
  onOpenMobileConnect
}) => {
  const { activeSession } = useWorkout();
  const { metrics } = useTracking();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 safe-top">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight flex items-center gap-2">
              {title}
              {activeSession && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1"></span>
                  En Vivo
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">{subtitle || 'Tu asistente de gimnasio y nutrición'}</p>
          </div>
        </div>

        {/* Acciones del Header: Conectar Móvil y Calorías */}
        <div className="flex items-center space-x-2">
          {onOpenMobileConnect && (
            <button
              onClick={onOpenMobileConnect}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition text-xs font-bold"
              title="Abrir en mi móvil (Código QR)"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Móvil</span>
            </button>
          )}

          <div 
            onClick={onOpenProfile}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 cursor-pointer hover:border-emerald-500/50 transition-colors"
            title="Ver objetivo calórico"
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <div className="text-right">
              <div className="text-xs font-bold text-slate-200 font-mono-numbers">{metrics.targetCalories}</div>
              <div className="text-[10px] text-slate-400 leading-none">kcal/día</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
