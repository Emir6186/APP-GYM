import type { Exercise, Routine, WorkoutSession } from '../types/workout';
import type { UserProfile, WeeklyCheckIn } from '../types/tracking';
import type { ShoppingItem, WeeklyDietPlan } from '../types/nutrition';
import { DEFAULT_EXERCISES } from '../data/defaultExercises';
import { calculateAllMetrics } from './calculations';
import { generateWeeklyDietPlan } from './mealPlanGenerator';
import { generateShoppingListFromPlan } from './shoppingListGenerator';
import { sortRoutinesByDay } from './routineSorter';

const STORAGE_KEYS = {
  EXERCISES: 'fittrack_exercises_v1',
  ROUTINES: 'fittrack_routines_v1',
  WORKOUT_HISTORY: 'fittrack_workout_history_v1',
  ACTIVE_SESSION: 'fittrack_active_session_v1',
  USER_PROFILE: 'fittrack_user_profile_v1',
  WEEKLY_CHECKINS: 'fittrack_weekly_checkins_v1',
  WEEKLY_DIET_PLAN: 'fittrack_diet_plan_v1',
  SHOPPING_LIST: 'fittrack_shopping_list_v1',
};

// Rutinas precargadas iniciales
const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'routine_push',
    name: 'Día 1: Empuje (Push Day) - Pecho, Hombro y Tríceps',
    description: 'Enfocado en hipertrofia y fuerza de empujes horizontales y verticales.',
    dayNumber: 1,
    orderIndex: 1,
    muscleGroups: ['Pecho', 'Hombros', 'Brazos'],
    exercises: [
      { exerciseId: 'ex_bench_press', defaultSets: 4, defaultReps: 8, defaultWeightKg: 70, targetRestSeconds: 90 },
      { exerciseId: 'ex_incline_dumbbell_press', defaultSets: 3, defaultReps: 10, defaultWeightKg: 24, targetRestSeconds: 75 },
      { exerciseId: 'ex_overhead_press', defaultSets: 3, defaultReps: 8, defaultWeightKg: 40, targetRestSeconds: 90 },
      { exerciseId: 'ex_lateral_raises', defaultSets: 4, defaultReps: 12, defaultWeightKg: 10, targetRestSeconds: 45 },
      { exerciseId: 'ex_tricep_rope_pushdown', defaultSets: 3, defaultReps: 12, defaultWeightKg: 25, targetRestSeconds: 60 },
    ]
  },
  {
    id: 'routine_pull',
    name: 'Día 2: Tirón (Pull Day) - Espalda y Bíceps',
    description: 'Desarrollo de amplitud de dorsales, densidad y flexores de codo.',
    dayNumber: 2,
    orderIndex: 2,
    muscleGroups: ['Espalda', 'Hombros', 'Brazos'],
    exercises: [
      { exerciseId: 'ex_deadlift', defaultSets: 3, defaultReps: 6, defaultWeightKg: 110, targetRestSeconds: 120 },
      { exerciseId: 'ex_lat_pulldown', defaultSets: 4, defaultReps: 10, defaultWeightKg: 60, targetRestSeconds: 75 },
      { exerciseId: 'ex_barbell_row', defaultSets: 3, defaultReps: 8, defaultWeightKg: 65, targetRestSeconds: 90 },
      { exerciseId: 'ex_face_pull', defaultSets: 3, defaultReps: 15, defaultWeightKg: 20, targetRestSeconds: 60 },
      { exerciseId: 'ex_bicep_curl_barbell', defaultSets: 3, defaultReps: 10, defaultWeightKg: 30, targetRestSeconds: 60 },
    ]
  },
  {
    id: 'routine_legs',
    name: 'Día 3: Pierna Completa (Leg Day)',
    description: 'Sentadillas pesadas, prensa inclinada y trabajo aislado de cadena posterior.',
    dayNumber: 3,
    orderIndex: 3,
    muscleGroups: ['Piernas', 'Core'],
    exercises: [
      { exerciseId: 'ex_barbell_squat', defaultSets: 4, defaultReps: 8, defaultWeightKg: 85, targetRestSeconds: 120 },
      { exerciseId: 'ex_leg_press', defaultSets: 4, defaultReps: 10, defaultWeightKg: 160, targetRestSeconds: 90 },
      { exerciseId: 'ex_leg_curl', defaultSets: 3, defaultReps: 12, defaultWeightKg: 45, targetRestSeconds: 60 },
      { exerciseId: 'ex_leg_extension', defaultSets: 3, defaultReps: 12, defaultWeightKg: 50, targetRestSeconds: 60 },
      { exerciseId: 'ex_hanging_leg_raise', defaultSets: 3, defaultReps: 15, defaultWeightKg: 0, targetRestSeconds: 45 },
    ]
  }
];

// Perfil por defecto
const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Alex Fitness',
  age: 26,
  gender: 'male',
  weightKg: 78.5,
  startWeightKg: 80.4,
  targetWeightKg: 74.0,
  heightCm: 178,
  trainingDaysPerWeek: 4,
  activityLevel: 'moderate',
  goal: 'deficit_moderate',
  startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
};

// Guardado seguro con control de cuota (QuotaExceededError protection)
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`LocalStorage quota exceeded en ${key}. Optimizando almacenamiento...`, err);
    try {
      storageService.cleanupAndOptimize();
      localStorage.setItem(key, value);
    } catch (retryErr) {
      console.error('Error al guardar tras optimización:', retryErr);
    }
  }
}

export const storageService = {
  // Limpieza y optimización automática de memoria (elimina duplicados pesados)
  cleanupAndOptimize(): void {
    try {
      // 1. Limpiar fotos duplicadas de historial
      const rawHistory = localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory);
        if (Array.isArray(parsed)) {
          const stripped = parsed.map(s => ({
            ...s,
            exercises: (s.exercises || []).map((e: any) => {
              const { exercisePhotoUrl: _, ...rest } = e;
              return rest;
            })
          }));
          localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(stripped));
        }
      }

      // 2. Limpiar sesión activa si está saturada
      const rawActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (rawActive) {
        const parsedActive = JSON.parse(rawActive);
        if (parsedActive && typeof parsedActive === 'object') {
          const strippedActive = {
            ...parsedActive,
            exercises: (parsedActive.exercises || []).map((e: any) => {
              const { exercisePhotoUrl: _, ...rest } = e;
              return rest;
            })
          };
          localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(strippedActive));
        }
      }
    } catch (e) {
      console.warn('Error en cleanupAndOptimize:', e);
    }
  },

  // Ejercicios
  getExercises(): Exercise[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    if (!raw) {
      safeSetItem(STORAGE_KEYS.EXERCISES, JSON.stringify(DEFAULT_EXERCISES));
      return DEFAULT_EXERCISES;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : DEFAULT_EXERCISES;
    } catch {
      return DEFAULT_EXERCISES;
    }
  },
  saveExercises(exercises: Exercise[]): void {
    safeSetItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  },

  // Rutinas sanitizadas y ordenadas por día (1 a 7)
  getRoutines(): Routine[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (!raw) {
      const sortedDefaults = sortRoutinesByDay(DEFAULT_ROUTINES);
      safeSetItem(STORAGE_KEYS.ROUTINES, JSON.stringify(sortedDefaults));
      return sortedDefaults;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return sortRoutinesByDay(DEFAULT_ROUTINES);
      const sanitized = parsed.map(r => ({
        ...r,
        id: r?.id || `routine_${Date.now()}`,
        name: r?.name || 'Rutina',
        dayNumber: r?.dayNumber,
        orderIndex: r?.orderIndex,
        muscleGroups: Array.isArray(r?.muscleGroups) ? r.muscleGroups : ['Pecho'],
        exercises: Array.isArray(r?.exercises) ? r.exercises.map((e: any) => ({
          exerciseId: e?.exerciseId || `ex_${Date.now()}`,
          defaultSets: e?.defaultSets || 4,
          defaultReps: e?.defaultReps || 10,
          defaultWeightKg: e?.defaultWeightKg || 0,
          targetRestSeconds: e?.targetRestSeconds || 60
        })) : []
      }));
      return sortRoutinesByDay(sanitized);
    } catch {
      return sortRoutinesByDay(DEFAULT_ROUTINES);
    }
  },
  saveRoutines(routines: Routine[]): void {
    const sorted = sortRoutinesByDay(routines);
    safeSetItem(STORAGE_KEYS.ROUTINES, JSON.stringify(sorted));
  },

  // Historial de Entrenamientos ultra-optimizado (sin duplicación de fotos)
  getWorkoutHistory(): WorkoutSession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const exList = this.getExercises();

      return parsed.map(s => ({
        ...s,
        id: s?.id || `session_${Date.now()}`,
        name: s?.name || 'Entrenamiento',
        date: s?.date || new Date().toISOString(),
        totalDurationSeconds: s?.totalDurationSeconds || 0,
        exercises: Array.isArray(s?.exercises) ? s.exercises.map((e: any) => {
          const exMeta = exList.find(meta => meta.id === e?.exerciseId);
          return {
            ...e,
            exerciseId: e?.exerciseId || `ex_${Date.now()}`,
            exerciseName: e?.exerciseName || exMeta?.name || 'Ejercicio',
            exerciseCategory: e?.exerciseCategory || exMeta?.category || 'General',
            exercisePhotoUrl: exMeta?.machinePhotoUrl || e?.exercisePhotoUrl,
            targetRestSeconds: e?.targetRestSeconds || 60,
            sets: Array.isArray(e?.sets) ? e.sets : []
          };
        }) : []
      }));
    } catch {
      return [];
    }
  },
  saveWorkoutHistory(history: WorkoutSession[]): void {
    // Optimización: remover fotos inline pesadas de cada sesión del historial para ahorrar 95% de espacio
    const lightweight = history.map(s => ({
      ...s,
      exercises: (s.exercises || []).map(e => {
        const { exercisePhotoUrl: _, ...rest } = e;
        return rest;
      })
    }));
    safeSetItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(lightweight));
  },

  // Sesión Activa de Entrenamiento optimizada
  getActiveSession(): WorkoutSession | null {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      const exList = this.getExercises();

      return {
        ...parsed,
        id: parsed.id || `session_${Date.now()}`,
        name: parsed.name || 'Entrenamiento',
        date: parsed.date || new Date().toISOString(),
        startTime: parsed.startTime || Date.now(),
        totalDurationSeconds: parsed.totalDurationSeconds || 0,
        exercises: Array.isArray(parsed.exercises) ? parsed.exercises.map((e: any) => {
          const exMeta = exList.find(meta => meta.id === e?.exerciseId);
          return {
            ...e,
            exerciseId: e?.exerciseId || `ex_${Date.now()}`,
            exerciseName: e?.exerciseName || exMeta?.name || 'Ejercicio',
            exerciseCategory: e?.exerciseCategory || exMeta?.category || 'General',
            exercisePhotoUrl: exMeta?.machinePhotoUrl || e?.exercisePhotoUrl,
            targetRestSeconds: e?.targetRestSeconds || 60,
            sets: Array.isArray(e?.sets) ? e.sets.map((s: any, sIdx: number) => ({
              id: s?.id || `set_${Date.now()}_${sIdx}`,
              setNumber: s?.setNumber || sIdx + 1,
              weightKg: s?.weightKg || 0,
              reps: s?.reps || 0,
              durationSeconds: s?.durationSeconds || 0,
              isCompleted: !!s?.isCompleted,
              completedAt: s?.completedAt
            })) : []
          };
        }) : []
      };
    } catch {
      return null;
    }
  },
  saveActiveSession(session: WorkoutSession | null): void {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    } else {
      // Optimización ligera
      const lightweight = {
        ...session,
        exercises: (session.exercises || []).map(e => {
          const { exercisePhotoUrl: _, ...rest } = e;
          return rest;
        })
      };
      safeSetItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(lightweight));
    }
  },

  // Perfil de Usuario
  getUserProfile(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) {
      safeSetItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_USER_PROFILE));
      return DEFAULT_USER_PROFILE;
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_USER_PROFILE,
        ...parsed,
        startWeightKg: parsed.startWeightKg ?? parsed.weightKg ?? 80.0,
        targetWeightKg: parsed.targetWeightKg ?? (parsed.weightKg ? parsed.weightKg - 5 : 74.0)
      };
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },
  saveUserProfile(profile: UserProfile): void {
    safeSetItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  // Revisiones Semanales
  getWeeklyCheckIns(): WeeklyCheckIn[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_CHECKINS);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  saveWeeklyCheckIns(checkIns: WeeklyCheckIn[]): void {
    safeSetItem(STORAGE_KEYS.WEEKLY_CHECKINS, JSON.stringify(checkIns));
  },

  // Plan Dietético Semanal
  getWeeklyDietPlan(): WeeklyDietPlan {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_DIET_PLAN);
    if (!raw) {
      const profile = this.getUserProfile();
      const metrics = calculateAllMetrics(profile);
      const initialPlan = generateWeeklyDietPlan(metrics);
      safeSetItem(STORAGE_KEYS.WEEKLY_DIET_PLAN, JSON.stringify(initialPlan));
      return initialPlan;
    }
    try {
      return JSON.parse(raw);
    } catch {
      const profile = this.getUserProfile();
      const metrics = calculateAllMetrics(profile);
      return generateWeeklyDietPlan(metrics);
    }
  },
  saveWeeklyDietPlan(plan: WeeklyDietPlan): void {
    safeSetItem(STORAGE_KEYS.WEEKLY_DIET_PLAN, JSON.stringify(plan));
  },

  // Lista de la Compra
  getShoppingList(): ShoppingItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
    if (!raw) {
      const dietPlan = this.getWeeklyDietPlan();
      const initialShopping = generateShoppingListFromPlan(dietPlan);
      safeSetItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(initialShopping));
      return initialShopping;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  saveShoppingList(items: ShoppingItem[]): void {
    safeSetItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(items));
  }
};
