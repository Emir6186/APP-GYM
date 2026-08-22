import React, { useState } from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import { TrackingProvider, useTracking } from './context/TrackingContext';
import { NutritionProvider } from './context/NutritionContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import type { NavTab } from './components/common/BottomNav';
import { RestTimerOverlay } from './components/common/RestTimerOverlay';
import { MobileConnectModal } from './components/common/MobileConnectModal';

// Vistas de Entrenamiento
import { RoutineList } from './components/workout/RoutineList';
import { ActiveWorkoutSession } from './components/workout/ActiveWorkoutSession';

// Vistas de Seguimiento y Progreso
import { ProfileTdeeCalculator } from './components/tracking/ProfileTdeeCalculator';
import { ProgressCharts } from './components/tracking/ProgressCharts';
import { WeeklyHistoryList } from './components/tracking/WeeklyHistoryList';
import { WeeklyCheckInModal } from './components/tracking/WeeklyCheckInModal';
import { TrainingProgressionView } from './components/tracking/TrainingProgressionView';

// Vistas de Nutrición y Compra
import { WeeklyMealCalendar } from './components/nutrition/WeeklyMealCalendar';
import { ShoppingListView } from './components/shopping/ShoppingListView';

import { Plus, TrendingUp, Scale, Ruler, Dumbbell } from 'lucide-react';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('workout');
  const [trackingSubTab, setTrackingSubTab] = useState<'body' | 'training'>('body');
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isMobileConnectOpen, setIsMobileConnectOpen] = useState(false);

  const { activeSession } = useWorkout();
  const { weeklyCheckIns, stats, metrics, profile } = useTracking();

  const getHeaderInfo = () => {
    switch (currentTab) {
      case 'workout':
        return {
          title: activeSession ? activeSession.name : 'FitTrack Pro',
          subtitle: activeSession ? 'Entrenamiento en vivo' : 'Rutinas y Máquinas de Gym'
        };
      case 'tracking':
        return {
          title: trackingSubTab === 'body' ? 'Seguimiento Corporal' : 'Progreso de Fuerza',
          subtitle: trackingSubTab === 'body' ? 'Evolución de peso, cintura y composición' : 'Sobrecarga progresiva y récords'
        };
      case 'nutrition':
        return {
          title: 'Plan Nutricional',
          subtitle: `Menú semanal equilibrado (${metrics.targetCalories} kcal)`
        };
      case 'shopping':
        return {
          title: 'Lista de la Compra',
          subtitle: 'Ingredientes organizados por pasillos'
        };
      case 'profile':
        return {
          title: 'Objetivo y TDEE',
          subtitle: 'Cálculo metabólico y macros'
        };
      default:
        return { title: 'FitTrack Pro', subtitle: 'Tu asistente de gimnasio' };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Fijo */}
      <Header
        title={headerInfo.title}
        subtitle={headerInfo.subtitle}
        onOpenProfile={() => setCurrentTab('profile')}
        onOpenMobileConnect={() => setIsMobileConnectOpen(true)}
      />

      {/* Contenedor Central Adaptable / Mobile Frame */}
      <main className="flex-1 max-w-lg w-full mx-auto px-3.5 py-4">
        {/* Pestaña: Entrenar */}
        {currentTab === 'workout' && (
          <div>
            {activeSession ? (
              <ActiveWorkoutSession />
            ) : (
              <RoutineList />
            )}
          </div>
        )}

        {/* Pestaña: Seguimiento y Progreso */}
        {currentTab === 'tracking' && (
          <div className="space-y-4">
            {/* Selector de Sub-pestaña: Medidas Corporales vs Progreso de Entreno */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setTrackingSubTab('body')}
                className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  trackingSubTab === 'body'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Medidas y Peso</span>
              </button>

              <button
                type="button"
                onClick={() => setTrackingSubTab('training')}
                className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  trackingSubTab === 'training'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Progreso Gym</span>
              </button>
            </div>

            {/* Vista 1: Medidas Corporales y Revisiones Semanales */}
            {trackingSubTab === 'body' && (
              <div className="space-y-5 pb-24">
                {/* Tarjeta de Resumen Rápido de Evolución */}
                <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        Tu Evolución
                      </span>
                      <h2 className="text-xl font-black text-slate-100 mt-0.5">
                        {profile.name}
                      </h2>
                    </div>

                    <button
                      onClick={() => setIsCheckInModalOpen(true)}
                      className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      Nueva Revisión
                    </button>
                  </div>

                  {/* Métricas clave: Peso actual vs Inicial y Cintura */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                        <span className="flex items-center gap-1">
                          <Scale className="w-3 h-3 text-emerald-400" />
                          Peso Actual
                        </span>
                        <span className="font-mono-numbers text-slate-500">Sem #{stats.totalWeeks}</span>
                      </div>
                      <div className="text-xl font-black font-mono-numbers text-slate-100 mt-1">
                        {stats.currentWeight} <span className="text-xs text-slate-400 font-normal">kg</span>
                      </div>
                      <div className={`text-[11px] font-mono-numbers font-bold mt-1 ${stats.weightDelta < 0 ? 'text-emerald-400' : stats.weightDelta > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {stats.weightDelta > 0 ? `+${stats.weightDelta}` : stats.weightDelta} kg acumulado
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                        <span className="flex items-center gap-1">
                          <Ruler className="w-3 h-3 text-emerald-400" />
                          Cintura
                        </span>
                        <span className="font-mono-numbers text-slate-500">Grasa Visceral</span>
                      </div>
                      <div className="text-xl font-black font-mono-numbers text-emerald-400 mt-1">
                        {stats.currentWaist} <span className="text-xs text-slate-400 font-normal">cm</span>
                      </div>
                      <div className={`text-[11px] font-mono-numbers font-bold mt-1 ${stats.waistDelta < 0 ? 'text-emerald-400' : stats.waistDelta > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {stats.waistDelta > 0 ? `+${stats.waistDelta}` : stats.waistDelta} cm acumulado
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gráfica de Progreso */}
                <div>
                  <h3 className="text-sm font-bold text-slate-200 mb-2.5 px-1 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Curva de Evolución Semanal
                  </h3>
                  <ProgressCharts checkIns={weeklyCheckIns} />
                </div>

                {/* Historial de Controles Semanales */}
                <div>
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <h3 className="text-sm font-bold text-slate-200">
                      Historial de Revisiones ({weeklyCheckIns.length})
                    </h3>
                  </div>
                  <WeeklyHistoryList checkIns={weeklyCheckIns} />
                </div>

                {/* Modal de Nueva Revisión */}
                <WeeklyCheckInModal
                  isOpen={isCheckInModalOpen}
                  onClose={() => setIsCheckInModalOpen(false)}
                />
              </div>
            )}

            {/* Vista 2: Progreso e Informes de Entrenamiento */}
            {trackingSubTab === 'training' && (
              <TrainingProgressionView />
            )}
          </div>
        )}

        {/* Pestaña: Comidas y Dieta Semanal */}
        {currentTab === 'nutrition' && (
          <WeeklyMealCalendar onGoToShopping={() => setCurrentTab('shopping')} />
        )}

        {/* Pestaña: Lista de la Compra */}
        {currentTab === 'shopping' && (
          <ShoppingListView />
        )}

        {/* Pestaña: Objetivo y Calculadora TDEE */}
        {currentTab === 'profile' && (
          <ProfileTdeeCalculator onPlanRegenerated={() => setCurrentTab('nutrition')} />
        )}
      </main>

      {/* Temporizador flotante de descanso universal */}
      <RestTimerOverlay />

      {/* Modal de Conexión Móvil con Código QR */}
      <MobileConnectModal
        isOpen={isMobileConnectOpen}
        onClose={() => setIsMobileConnectOpen(false)}
      />

      {/* Barra de Navegación Inferior */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <TrackingProvider>
      <WorkoutProvider>
        <NutritionProvider>
          <MainContent />
        </NutritionProvider>
      </WorkoutProvider>
    </TrackingProvider>
  );
};

export default App;
