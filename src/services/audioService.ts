// Web Audio API Sound Synthesizer for Gym Timers

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Emite un tono sintético simple con frecuencia y duración
 */
export function playTone(freq: number, durationMs: number, type: OscillatorType = 'sine', volume: number = 0.2): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Fade in and out to avoid clicking
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (durationMs / 1000));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + (durationMs / 1000));
  } catch (err) {
    console.warn('No se pudo reproducir el tono de audio:', err);
  }
}

/**
 * Tono de alerta agradable cuando finaliza el descanso (Tríada ascendente C5-E5-G5)
 */
export function playRestCompleteSound(): void {
  try {
    // 3 tonos rápidos ascendentes
    setTimeout(() => playTone(523.25, 120, 'triangle', 0.25), 0);   // C5
    setTimeout(() => playTone(659.25, 120, 'triangle', 0.25), 130); // E5
    setTimeout(() => playTone(783.99, 280, 'triangle', 0.3), 260);  // G5

    // Vibración en dispositivos compatibles (Android / iPhone)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
  } catch (err) {
    console.warn(err);
  }
}

/**
 * Tono suave para los últimos 3 segundos (3, 2, 1)
 */
export function playCountdownTick(): void {
  playTone(880, 80, 'sine', 0.15);
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
}

/**
 * Sonido de confirmación al completar una serie
 */
export function playSetCompleteSound(): void {
  setTimeout(() => playTone(440, 90, 'sine', 0.2), 0);
  setTimeout(() => playTone(587.33, 140, 'sine', 0.25), 100);
  if ('vibrate' in navigator) {
    navigator.vibrate(80);
  }
}
