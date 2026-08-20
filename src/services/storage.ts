import type { Exercise, Routine, WorkoutSession } from '../types/workout';
import type { UserProfile, WeeklyCheckIn } from '../types/tracking';
import type { ShoppingItem, WeeklyDietPlan } from '../types/nutrition';
import { DEFAULT_EXERCISES } from '../data/defaultExercises';
import { calculateAllMetrics } from './calculations';
import { generateWeeklyDietPlan } from './mealPlanGenerator';
import { generateShoppingListFromPlan } from './shoppingListGenerator';

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
    name: 'Empuje (Push Day) - Pecho, Hombro y Tríceps',
    description: 'Enfocado en hipertrofia y fuerza de empujes horizontales y verticales.',
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
    name: 'Tirón (Pull Day) - Espalda, Deltoides Post. y Bíceps',
    description: 'Desarrollo de amplitud de dorsales, densidad y flexores de codo.',
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
    name: 'Pierna Completa (Leg Day) - Fuerza e Hipertrofia',
    description: 'Sentadillas pesadas, prensa inclinada y trabajo aislado de cadena posterior.',
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
  heightCm: 178,
  trainingDaysPerWeek: 4,
  activityLevel: 'moderate',
  goal: 'deficit_moderate' // -500 kcal
};

// Revisiones semanales de ejemplo
const DEFAULT_CHECKINS: WeeklyCheckIn[] = [
  {
    id: 'chk_1',
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    weekNumber: 1,
    weightKg: 80.4,
    waistCircumferenceCm: 86.0,
    chestCm: 104.0,
    armCm: 37.5,
    thighCm: 59.0,
    bodyFatPercentage: 18.2,
    notes: 'Inicio del plan de definición. Buena energía en entrenamientos.',
    energyLevel: 4,
    trainingCompliance: 100
  },
  {
    id: 'chk_2',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    weekNumber: 2,
    weightKg: 79.6,
    waistCircumferenceCm: 85.0,
    chestCm: 103.5,
    armCm: 37.5,
    thighCm: 58.5,
    bodyFatPercentage: 17.5,
    notes: 'Pérdida constante de grasa abdominal, manteniendo pesos en barra.',
    energyLevel: 4,
    trainingCompliance: 100
  },
  {
    id: 'chk_3',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    weekNumber: 3,
    weightKg: 78.9,
    waistCircumferenceCm: 84.2,
    chestCm: 103.5,
    armCm: 37.6,
    thighCm: 58.2,
    bodyFatPercentage: 16.8,
    notes: 'Excelente definición visual. Cintura bajando de forma notable.',
    energyLevel: 5,
    trainingCompliance: 100
  }
];

export const storageService = {
  // Ejercicios
  getExercises(): Exercise[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(DEFAULT_EXERCISES));
      return DEFAULT_EXERCISES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_EXERCISES;
    }
  },
  saveExercises(exercises: Exercise[]): void {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  },

  // Rutinas
  getRoutines(): Routine[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(DEFAULT_ROUTINES));
      return DEFAULT_ROUTINES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_ROUTINES;
    }
  },
  saveRoutines(routines: Routine[]): void {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  },

  // Historial de Entrenamientos
  getWorkoutHistory(): WorkoutSession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
  saveWorkoutHistory(history: WorkoutSession[]): void {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
  },

  // Sesión Activa de Entrenamiento
  getActiveSession(): WorkoutSession | null {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  saveActiveSession(session: WorkoutSession | null): void {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
    }
  },

  // Perfil de Usuario
  getUserProfile(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_USER_PROFILE));
      return DEFAULT_USER_PROFILE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },
  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  // Revisiones Semanales
  getWeeklyCheckIns(): WeeklyCheckIn[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_CHECKINS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WEEKLY_CHECKINS, JSON.stringify(DEFAULT_CHECKINS));
      return DEFAULT_CHECKINS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CHECKINS;
    }
  },
  saveWeeklyCheckIns(checkIns: WeeklyCheckIn[]): void {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_CHECKINS, JSON.stringify(checkIns));
  },

  // Plan Dietético Semanal
  getWeeklyDietPlan(): WeeklyDietPlan {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_DIET_PLAN);
    if (!raw) {
      const profile = this.getUserProfile();
      const metrics = calculateAllMetrics(profile);
      const initialPlan = generateWeeklyDietPlan(metrics);
      localStorage.setItem(STORAGE_KEYS.WEEKLY_DIET_PLAN, JSON.stringify(initialPlan));
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
    localStorage.setItem(STORAGE_KEYS.WEEKLY_DIET_PLAN, JSON.stringify(plan));
  },

  // Lista de la Compra
  getShoppingList(): ShoppingItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
    if (!raw) {
      const dietPlan = this.getWeeklyDietPlan();
      const initialShopping = generateShoppingListFromPlan(dietPlan);
      localStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(initialShopping));
      return initialShopping;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
  saveShoppingList(items: ShoppingItem[]): void {
    localStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(items));
  }
};
