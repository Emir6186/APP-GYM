import React from 'react';
import { X, Dumbbell } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title: string;
  subtitle?: string;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Botón flotante de cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-xl transition"
        title="Cerrar vista ampliada"
      >
        <X className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Contenedor de la imagen */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl space-y-3 p-3 text-center"
      >
        <div className="relative w-full aspect-square sm:aspect-4/3 rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-800">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-contain select-none"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500">
              <Dumbbell className="w-16 h-16 mb-2" />
              <span className="text-sm">Sin imagen de máquina</span>
            </div>
          )}
        </div>

        <div className="px-2 pb-2">
          <h3 className="text-base font-bold text-slate-100">{title}</h3>
          {subtitle && (
            <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 mt-1 font-medium">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
