import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { storageService } from '../../services/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FitTrack Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Optimizar y limpiar memoria saturada sin perder rutinas ni historial
      storageService.cleanupAndOptimize();
      localStorage.removeItem('fittrack_active_session_v1');
    } catch {
      // Ignorar
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <div>
              <h2 className="text-lg font-black text-slate-100">Conflicto de Almacenamiento Resuelto</h2>
              <p className="text-xs text-slate-400 mt-1">
                Se ha optimizado el espacio de memoria de tus fotos y sesiones. Pulsa el botón para restaurar la pantalla principal con tus rutinas ordenadas.
              </p>
              {this.state.error?.message && (
                <div className="mt-2 p-2 rounded-xl bg-slate-950 text-[10px] text-rose-300 font-mono text-left overflow-x-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar Pantalla Principal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
