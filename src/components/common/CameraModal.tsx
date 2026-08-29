import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, Upload, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  onPhotoSaved: (photoUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  exerciseName,
  onPhotoSaved
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Iniciar flujo de cámara
  const startCamera = async (mode: 'environment' | 'user') => {
    setIsLoadingCamera(true);
    setErrorMsg(null);

    // Detener flujo previo si existe
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso directo a la cámara. Puedes subir una foto desde tu galería.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 480 },
          height: { ideal: 480 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: unknown) {
      console.warn('Error al acceder a la cámara:', err);
      setErrorMsg('No se pudo acceder a la cámara (permiso denegado o no disponible). Puedes usar el botón de subir foto o seleccionar de tu galería.');
    } finally {
      setIsLoadingCamera(false);
    }
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera(facingMode);
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Cambiar entre cámara trasera y delantera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capturar foto del fotograma del video y comprimir a tamaño ligero (250x250, ~15KB)
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);

    canvas.width = 250;
    canvas.height = 250;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Recortar cuadrado centrado
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    ctx.drawImage(video, startX, startY, size, size, 0, 0, 250, 250);

    // Calidad 0.6 para tamaño ultra ligero (10-15KB)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
    setCapturedImage(dataUrl);

    // Detener stream para ahorrar batería
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Manejar subida de archivo desde galería/cámara nativa con compresión ligera
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 250;
        canvas.height = 250;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, 250, 250);
          setCapturedImage(canvas.toDataURL('image/jpeg', 0.6));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleSave = () => {
    if (capturedImage) {
      onPhotoSaved(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Foto de la Máquina / Avatar"
      subtitle={`Asignar avatar a: ${exerciseName}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Contenedor de Vista Previa / Video */}
        <div className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Foto capturada"
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <>
              {errorMsg ? (
                <div className="p-6 text-center text-slate-400 space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-sm">{errorMsg}</p>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {isLoadingCamera && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-slate-300">Iniciando cámara...</span>
                      </div>
                    </div>
                  )}

                  {/* Guía visual del visor */}
                  <div className="absolute inset-8 border-2 border-dashed border-emerald-400/50 rounded-2xl pointer-events-none flex items-center justify-center">
                    <span className="text-[11px] text-emerald-300/80 bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur">
                      Enfoca la máquina de gym
                    </span>
                  </div>

                  {/* Botón de girar cámara */}
                  <button
                    onClick={toggleFacingMode}
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-slate-900/80 text-slate-200 backdrop-blur border border-slate-700/70 hover:bg-slate-800"
                    title="Girar cámara"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </>
              )}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Repetir Foto
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
              >
                <Check className="w-4 h-4" />
                Guardar Avatar
              </button>
            </>
          ) : (
            <>
              {/* Botón Subir Foto / Galería */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700"
              >
                <Upload className="w-4 h-4" />
                Galería / Archivo
              </button>

              {/* Botón Disparador de Foto */}
              <button
                onClick={takePhoto}
                disabled={isLoadingCamera || !!errorMsg}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm transition shadow-lg ${
                  isLoadingCamera || !!errorMsg
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                }`}
              >
                <Camera className="w-5 h-5" />
                Tomar Foto
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
