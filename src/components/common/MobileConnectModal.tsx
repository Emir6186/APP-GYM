import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { Modal } from './Modal';

interface MobileConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileConnectModal: React.FC<MobileConnectModalProps> = ({
  isOpen,
  onClose
}) => {
  const [networkUrl, setNetworkUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Detectamos el puerto real o usamos 5180
    const port = window.location.port || '5180';
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      setNetworkUrl(`http://172.20.10.5:${port}`);
    } else {
      setNetworkUrl(`http://${hostname}:${port}`);
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(networkUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📱 Conectar con tu Móvil"
      subtitle="Abre FitTrack Pro directamente en tu teléfono"
      maxWidth="md"
    >
      <div className="space-y-5 text-center">
        {/* Contenedor del Código QR */}
        <div className="p-5 bg-white rounded-3xl inline-block shadow-2xl mx-auto border-4 border-emerald-500/30">
          <QRCodeSVG
            value={networkUrl || 'http://172.20.10.5:5180'}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* URL y Botón Copiar */}
        <div className="space-y-2">
          <p className="text-xs text-slate-300">
            Escanea el código QR con la cámara de tu móvil o accede a esta dirección:
          </p>

          <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono-numbers font-bold text-emerald-400 select-all truncate text-center">
              {networkUrl || 'http://172.20.10.5:5180'}
            </div>
            <button
              onClick={handleCopy}
              className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
                copied
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
              title="Copiar URL"
            >
              {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Instrucciones de Instalación en el Móvil */}
        <div className="text-left bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Cómo instalar como App nativa:</span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <p>Abre el enlace en <strong>Safari (iPhone)</strong> o <strong>Chrome (Android)</strong>.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <p>Pulsa el botón de <strong>Compartir</strong> (o los 3 puntos en Android).</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <p>Selecciona <strong>"Añadir a la pantalla de inicio"</strong> para tener el icono de la app en pantalla completa.</p>
            </div>
          </div>
        </div>

        {/* Botón Listo */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition"
        >
          ¡Entendido!
        </button>
      </div>
    </Modal>
  );
};
