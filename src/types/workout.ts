export type MuscleGroup = 'Pecho' | 'Espalda' | 'Piernas' | 'Hombros' | 'Brazos' | 'Core' | 'Cardio';

export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup;
  defaultRestSeconds: number;
  machinePhotoUrl?: string; // Avatar/foto de la máquina tomada con la cámara
  description?: string;
  isCustom?: boolean;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  durationSeconds: number; // Tiempo empleado en realizar la serie
  isCompleted: boolean;
  completedAt?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  exerciseCategory: MuscleGroup;
  exercisePhotoUrl?: string;
  targetRestSeconds: number;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  routineId?: string;
  name: string;
  date: string;
  startTime: number;
  endTime?: number;
  totalDurationSeconds: number;
  exercises: WorkoutExercise[];
  isCompleted: boolean;
  totalVolumeKg?: number;
  totalSetsCompleted?: number;
}

export interface RoutineExerciseTemplate {
  exerciseId: string;
  defaultSets: number;
  defaultReps: number;
  defaultWeightKg: number;
  targetRestSeconds: number;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  muscleGroups: MuscleGroup[];
  exercises: RoutineExerciseTemplate[];
  icon?: string;
}

export interface RestTimerState {
  isActive: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  exerciseName: string;
  setNumber: number;
  isPaused: boolean;
  autoStarted: boolean;
}
