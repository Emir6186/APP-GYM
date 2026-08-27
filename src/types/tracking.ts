export type Gender = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete';

export type FitnessGoal = 
  | 'deficit_aggressive'  // -750 kcal
  | 'deficit_moderate'    // -500 kcal
  | 'deficit_mild'        // -300 kcal
  | 'maintenance'         // 0 kcal
  | 'surplus_lean'        // +300 kcal
  | 'surplus_aggressive'; // +500 kcal

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  weightKg: number;              // Peso actual
  startWeightKg: number;         // Peso de comienzo
  targetWeightKg: number;        // Peso al que se quiere llegar (Objetivo)
  heightCm: number;
  trainingDaysPerWeek: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  startDate?: string;
}

export interface CalculatedMetrics {
  bmr: number;            // Tasa Metabólica Basal (kcal)
  tdee: number;           // Gasto Energético Total Diario (kcal)
  targetCalories: number; // Calorías objetivo ajustadas al objetivo
  calorieDiff: number;    // Diferencia respecto a mantenimiento (-500, +300, etc.)
  proteinGrams: number;   // Gramos de proteína diarios
  carbsGrams: number;     // Gramos de carbohidratos diarios
  fatGrams: number;       // Gramos de grasas diarias
  waterLiters: number;    // Litros recomendados de agua al día
  fiberGrams: number;     // Gramos de fibra
  
  // Escalada de progreso estimada
  totalWeightDeltaKg: number;       // Kg a perder o ganar (target - current)
  estimatedWeeksToGoal: number;     // Semanas estimadas para llegar a la meta
  recommendedWeeklyRateKg: number;  // Ritmo saludable recomendado por semana (ej. 0.5 kg)
}

export interface WeightRoadmapStep {
  weekNumber: number;
  projectedWeightKg: number;
  dateStr: string;
}

export interface ProgressAudit {
  status: 'optimal' | 'slow' | 'fast' | 'on_track';
  title: string;
  message: string;
  recommendedCalorieDelta: number; // -150, +150, 0
  weeklyLossOrGainKg: number;
}

export interface WeeklyCheckIn {
  id: string;
  date: string;              // ISO String
  weekNumber: number;
  weightKg: number;
  waistCircumferenceCm: number; // Ancho/perímetro de cintura (clave para medir grasa visceral)
  chestCm?: number;
  hipsCm?: number;
  armCm?: number;
  thighCm?: number;
  bodyFatPercentage?: number;
  photoUrl?: string;         // Foto de control semanal
  notes?: string;
  energyLevel?: number;      // 1-5
  trainingCompliance?: number; // % cumplido
  auditResult?: ProgressAudit;
}
