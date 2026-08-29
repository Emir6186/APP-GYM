import type { Routine } from '../types/workout';

const WEEKDAYS_MAP: Record<string, number> = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  miércoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  sábado: 6,
  domingo: 7,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7
};

/**
 * Detecta y extrae el número de día (1 a 7 o más) de cualquier rutina
 */
export function extractRoutineDayNumber(routine: Routine): number {
  if (routine.dayNumber && routine.dayNumber >= 1) {
    return routine.dayNumber;
  }

  const name = (routine.name || '').trim().toLowerCase();

  // 1. Patrón Día / Dia / Day / D seguido de número (ej: "Día 1", "Dia 2", "D3", "Day 4", "Dia 1: Pecho")
  const dayMatch = name.match(/(?:d[ií]a|day|d)\s*([1-9]\d*)\b/i);
  if (dayMatch) {
    return parseInt(dayMatch[1], 10);
  }

  // 2. Patrón de número al inicio (ej: "1. Pecho", "2 - Espalda", "3: Piernas", "1 Pecho")
  const leadingNumMatch = name.match(/^([1-9]\d*)\s*[\.\:\-\s]/);
  if (leadingNumMatch) {
    return parseInt(leadingNumMatch[1], 10);
  }

  // 3. Patrón de día de la semana (ej: "Lunes - Pecho", "Martes - Espalda")
  for (const [dayName, dayNum] of Object.entries(WEEKDAYS_MAP)) {
    if (name.includes(dayName)) {
      return dayNum;
    }
  }

  // 4. Patrón de Rutina / Sesión / Entrenamiento + número (ej: "Rutina 1", "Sesión 2")
  const wordNumMatch = name.match(/(?:rutina|entrenamiento|sesi[oó]n|bloque)\s*([1-9]\d*)/i);
  if (wordNumMatch) {
    return parseInt(wordNumMatch[1], 10);
  }

  // 5. Rutinas predeterminadas clásicas
  if (name.includes('push') || name.includes('empuje')) return 1;
  if (name.includes('pull') || name.includes('tirón') || name.includes('tiron')) return 2;
  if (name.includes('leg') || name.includes('pierna')) return 3;

  return 999;
}

/**
 * Ordena una lista de rutinas de forma inteligente del Día 1 al Día 7
 */
export function sortRoutinesByDay(routines: Routine[]): Routine[] {
  if (!Array.isArray(routines)) return [];

  return [...routines].sort((a, b) => {
    const dayA = extractRoutineDayNumber(a);
    const dayB = extractRoutineDayNumber(b);

    if (dayA !== dayB) {
      return dayA - dayB;
    }

    const orderA = a.orderIndex ?? 999;
    const orderB = b.orderIndex ?? 999;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return (a.name || '').localeCompare(b.name || '');
  });
}
