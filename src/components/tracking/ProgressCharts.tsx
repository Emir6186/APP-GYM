import React, { useState } from 'react';
import { TrendingDown, TrendingUp, Scale, Ruler } from 'lucide-react';
import type { WeeklyCheckIn } from '../../types/tracking';

interface ProgressChartsProps {
  checkIns: WeeklyCheckIn[];
}

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ checkIns }) => {
  const [metric, setMetric] = useState<'weight' | 'waist'>('weight');

  // Ordenar cronológicamente (más antiguo a más reciente)
  const sorted = [...checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sorted.length < 2) {
    return (
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
        <p className="text-xs">Registra al menos 2 revisiones semanales para visualizar la curva de evolución.</p>
      </div>
    );
  }

  const values = sorted.map(c => metric === 'weight' ? c.weightKg : c.waistCircumferenceCm);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const width = 320;
  const height = 130;
  const padding = 25;

  const points = sorted.map((c, i) => {
    const val = metric === 'weight' ? c.weightKg : c.waistCircumferenceCm;
    const x = padding + (i / (sorted.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
    return { x, y, val, date: new Date(c.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), week: c.weekNumber };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const delta = Number((values[values.length - 1] - values[0]).toFixed(1));
  const isGoodLoss = delta < 0;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-xl">
      {/* Selector de Métrica */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setMetric('weight')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              metric === 'weight'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Peso (kg)
          </button>

          <button
            onClick={() => setMetric('waist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              metric === 'waist'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            Cintura (cm)
          </button>
        </div>

        {/* Delta Total */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold font-mono-numbers border ${
          isGoodLoss 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
          {isGoodLoss ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
          <span>{delta > 0 ? `+${delta}` : delta} {metric === 'weight' ? 'kg' : 'cm'}</span>
        </div>
      </div>

      {/* Gráfico SVG */}
      <div className="w-full overflow-hidden flex justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Área sombreada */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Línea principal */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Puntos y etiquetas */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                className="fill-slate-950 stroke-emerald-400 stroke-2"
              />
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                className="fill-slate-200 text-[10px] font-bold font-mono"
              >
                {p.val}
              </text>
              <text
                x={p.x}
                y={height - 5}
                textAnchor="middle"
                className="fill-slate-500 text-[9px]"
              >
                {p.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
