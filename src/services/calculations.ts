import type { UserProfile, CalculatedMetrics, FitnessGoal } from '../types/tracking';

/**
 * Calcula la Tasa Metabólica Basal (TMB / BMR) usando la fórmula de Mifflin-St Jeor
 * Hombres: TMB = (10 × peso en kg) + (6.25 × altura en cm) - (5 × edad en años) + 5
 * Mujeres: TMB = (10 × peso en kg) + (6.25 × altura en cm) - (5 × edad en años) - 161
 */
export function calculateBMR(profile: UserProfile): number {
  const { weightKg, heightCm, age, gender } = profile;
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  return gender === 'male' ? Math.round(base + 5) : Math.round(base - 161);
}

/**
 * Obtiene el multiplicador de actividad física según nivel y días de entreno
 */
export function getActivityMultiplier(profile: UserProfile): number {
  const { activityLevel, trainingDaysPerWeek } = profile;

  // Ajuste base por nivel de actividad
  let multiplier = 1.2;
  switch (activityLevel) {
    case 'sedentary': multiplier = 1.2; break;
    case 'light': multiplier = 1.35; break;
    case 'moderate': multiplier = 1.5; break;
    case 'very_active': multiplier = 1.7; break;
    case 'athlete': multiplier = 1.9; break;
  }

  // Pequeña modulación basada en los días reales de entrenamiento
  if (trainingDaysPerWeek >= 5 && multiplier < 1.55) {
    multiplier = 1.55;
  } else if (trainingDaysPerWeek <= 2 && multiplier > 1.4) {
    multiplier = 1.375;
  }

  return multiplier;
}

/**
 * Obtiene el ajuste calórico según el objetivo seleccionado
 */
export function getCalorieAdjustment(goal: FitnessGoal): number {
  switch (goal) {
    case 'deficit_aggressive': return -750;
    case 'deficit_moderate': return -500;
    case 'deficit_mild': return -300;
    case 'maintenance': return 0;
    case 'surplus_lean': return 300;
    case 'surplus_aggressive': return 500;
    default: return 0;
  }
}

/**
 * Realiza el cálculo completo de métricas metabólicas y macronutrientes
 */
export function calculateAllMetrics(profile: UserProfile): CalculatedMetrics {
  const bmr = calculateBMR(profile);
  const multiplier = getActivityMultiplier(profile);
  const tdee = Math.round(bmr * multiplier);
  const diff = getCalorieAdjustment(profile.goal);
  const targetCalories = Math.max(1200, tdee + diff);

  // Proteínas: 2.0g por kg (en déficit sube a 2.2g para proteger masa muscular)
  const isDeficit = diff < 0;
  const proteinMultiplier = isDeficit ? 2.2 : 2.0;
  const proteinGrams = Math.round(profile.weightKg * proteinMultiplier);
  const proteinCalories = proteinGrams * 4;

  // Grasas: ~0.9g por kg (esenciales para salud hormonal)
  const fatMultiplier = 0.9;
  const fatGrams = Math.round(profile.weightKg * fatMultiplier);
  const fatCalories = fatGrams * 9;

  // Carbohidratos: el resto de calorías necesarias
  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const carbsGrams = Math.round(remainingCalories / 4);

  // Agua recomendada: 35ml/kg + 500ml por sesión de entreno
  const waterLiters = Number(((profile.weightKg * 0.035) + 0.5).toFixed(1));

  // Fibra: 14g por cada 1000 kcal
  const fiberGrams = Math.round((targetCalories / 1000) * 14);

  return {
    bmr,
    tdee,
    targetCalories,
    calorieDiff: diff,
    proteinGrams,
    carbsGrams,
    fatGrams,
    waterLiters,
    fiberGrams
  };
}

/**
 * Fórmula de Epley para estimar el 1RM (Repetición Máxima)
 * 1RM = Peso × (1 + Reps / 30)
 */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30));
}

/**
 * Formatea segundos a MM:SS
 */
export function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
