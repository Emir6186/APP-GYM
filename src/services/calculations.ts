import type { UserProfile, CalculatedMetrics, FitnessGoal, WeightRoadmapStep, ProgressAudit, WeeklyCheckIn } from '../types/tracking';

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

  // Modulación basada en los días reales de entrenamiento
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
 * Realiza el cálculo completo de métricas metabólicas, macronutrientes y escalada de progreso
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

  // Cálculo de Escalada de Progreso
  const targetWeight = profile.targetWeightKg || profile.weightKg;
  const totalWeightDeltaKg = Number((targetWeight - profile.weightKg).toFixed(1));

  let recommendedWeeklyRateKg = 0.5; // Por defecto déficit saludable
  if (diff > 0) {
    recommendedWeeklyRateKg = 0.3; // Volumen magro saludable
  } else if (diff === 0) {
    recommendedWeeklyRateKg = 0.0;
  }

  const absDelta = Math.abs(totalWeightDeltaKg);
  const estimatedWeeksToGoal = recommendedWeeklyRateKg > 0 ? Math.ceil(absDelta / recommendedWeeklyRateKg) : 0;

  return {
    bmr,
    tdee,
    targetCalories,
    calorieDiff: diff,
    proteinGrams,
    carbsGrams,
    fatGrams,
    waterLiters,
    fiberGrams,
    totalWeightDeltaKg,
    estimatedWeeksToGoal,
    recommendedWeeklyRateKg
  };
}

/**
 * Genera los hitos semanales proyectados de la escalada de progreso (Roadmap)
 */
export function generateWeightRoadmap(profile: UserProfile): WeightRoadmapStep[] {
  const currentWeight = profile.weightKg;
  const targetWeight = profile.targetWeightKg || currentWeight;
  const delta = targetWeight - currentWeight;

  if (Math.abs(delta) < 0.2) {
    return [
      {
        weekNumber: 1,
        projectedWeightKg: currentWeight,
        dateStr: 'Meta actual (Mantenimiento)'
      }
    ];
  }

  const isLoss = delta < 0;
  const weeklyRate = isLoss ? 0.5 : 0.3;
  const totalWeeks = Math.min(24, Math.max(1, Math.ceil(Math.abs(delta) / weeklyRate)));

  const steps: WeightRoadmapStep[] = [];
  const now = new Date();

  for (let i = 1; i <= totalWeeks; i++) {
    const projected = isLoss
      ? Math.max(targetWeight, Number((currentWeight - i * weeklyRate).toFixed(1)))
      : Math.min(targetWeight, Number((currentWeight + i * weeklyRate).toFixed(1)));

    const futureDate = new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const dateFormatted = futureDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

    steps.push({
      weekNumber: i,
      projectedWeightKg: projected,
      dateStr: dateFormatted
    });

    if (projected === targetWeight) break;
  }

  return steps;
}

/**
 * Audita el progreso semanal y genera recomendaciones nutricionales adaptativas
 */
export function auditWeeklyProgress(
  currentCheckIn: WeeklyCheckIn,
  previousCheckIn?: WeeklyCheckIn,
  goal: FitnessGoal = 'deficit_moderate'
): ProgressAudit {
  if (!previousCheckIn) {
    return {
      status: 'on_track',
      title: 'Punto de Partida Establecido',
      message: 'Primer registro guardado. En la próxima revisión semanal compararemos tu evolución para ajustar la dieta si fuera necesario.',
      recommendedCalorieDelta: 0,
      weeklyLossOrGainKg: 0
    };
  }

  const weightChange = Number((currentCheckIn.weightKg - previousCheckIn.weightKg).toFixed(2));
  const waistChange = Number((currentCheckIn.waistCircumferenceCm - previousCheckIn.waistCircumferenceCm).toFixed(1));
  const isDeficit = goal.startsWith('deficit');
  const isSurplus = goal.startsWith('surplus');

  if (isDeficit) {
    // Objetivo: Pérdida de Grasa
    if (weightChange <= -0.3 && weightChange >= -0.9) {
      // Ritmo perfecto
      return {
        status: 'optimal',
        title: '¡Ritmo Óptimo de Definición! 🔥',
        message: `Has bajado ${Math.abs(weightChange)} kg y ${waistChange <= 0 ? Math.abs(waistChange) + ' cm de cintura' : 'manteniendo medidas'}. La quema de grasa es constante sin sacrificar músculo. ¡Mantén las calorías actuales!`,
        recommendedCalorieDelta: 0,
        weeklyLossOrGainKg: weightChange
      };
    } else if (weightChange > -0.2) {
      // Pérdida muy lenta o estancamiento
      return {
        status: 'slow',
        title: 'Progreso Lento o Estancamiento 📉',
        message: `El cambio de peso (${weightChange > 0 ? '+' + weightChange : weightChange} kg) es menor al esperado. Recomendación: Reducir ~150 kcal/día o aumentar 2.000 pasos diarios para reactivar el déficit.`,
        recommendedCalorieDelta: -150,
        weeklyLossOrGainKg: weightChange
      };
    } else {
      // Pérdida demasiado rápida (> 1.0 kg/sem)
      return {
        status: 'fast',
        title: 'Pérdida Muy Acelerada ⚠️',
        message: `Has bajado ${Math.abs(weightChange)} kg en una sola semana. Una bajada tan drástica puede quemar masa muscular. Recomendación: Aumentar +150 kcal/día para un ritmo sostenible.`,
        recommendedCalorieDelta: 150,
        weeklyLossOrGainKg: weightChange
      };
    }
  } else if (isSurplus) {
    // Objetivo: Ganancia Muscular (Volumen)
    if (weightChange >= 0.2 && weightChange <= 0.5) {
      return {
        status: 'optimal',
        title: '¡Volumen Magro Excelente! 💪',
        message: `Has ganado +${weightChange} kg a un ritmo limpio minimizando acumulación de grasa. ¡Continúa con tu plan actual!`,
        recommendedCalorieDelta: 0,
        weeklyLossOrGainKg: weightChange
      };
    } else if (weightChange < 0.1) {
      return {
        status: 'slow',
        title: 'Ganancia de Masa Estancada 📈',
        message: `No se registra incremento de peso (+${weightChange} kg). Tu metabolismo está gastando más de lo previsto. Recomendación: Sumar +150-200 kcal/día.`,
        recommendedCalorieDelta: 150,
        weeklyLossOrGainKg: weightChange
      };
    } else {
      return {
        status: 'fast',
        title: 'Ganancia de Peso Excesiva ⚠️',
        message: `Has subido +${weightChange} kg. El cuerpo solo puede sintetizar cierta cantidad de músculo por semana; el resto será grasa. Recomendación: Ajustar -150 kcal/día.`,
        recommendedCalorieDelta: -150,
        weeklyLossOrGainKg: weightChange
      };
    }
  }

  // Mantenimiento
  return {
    status: 'optimal',
    title: 'Peso Estable ⚖️',
    message: `Tu peso se mantiene en equilibrio (${weightChange > 0 ? '+' + weightChange : weightChange} kg). Tu ingesta calórica coincide con tu gasto.`,
    recommendedCalorieDelta: 0,
    weeklyLossOrGainKg: weightChange
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
