import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Exercise, Routine, WorkoutSession, WorkoutExercise, WorkoutSet, RestTimerState } from '../types/workout';
import { storageService } from '../services/storage';
import { playCountdownTick, playRestCompleteSound, playSetCompleteSound } from '../services/audioService';
import confetti from 'canvas-confetti';

interface WorkoutContextType {
  exercises: Exercise[];
  routines: Routine[];
  workoutHistory: WorkoutSession[];
  activeSession: WorkoutSession | null;
  restTimer: RestTimerState;
  
  // Acciones de entrenamiento
  startWorkout: (routineId?: string, customName?: string) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  repeatWorkoutSession: (session: WorkoutSession) => void;
  deleteWorkoutSession: (sessionId: string) => void;
  addExerciseToActiveWorkout: (exerciseId: string) => void;
  removeExerciseFromActiveWorkout: (exerciseIndex: number) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, field: 'weightKg' | 'reps' | 'durationSeconds', value: number) => void;
  completeSet: (exerciseIndex: number, setIndex: number) => void;
  uncompleteSet: (exerciseIndex: number, setIndex: number) => void;
  updateExerciseTargetRest: (exerciseIndex: number, seconds: number) => void;
  
  // Acciones del Temporizador de Descanso
  startRestTimer: (seconds: number, exerciseName: string, setNumber: number) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  addRestSeconds: (seconds: number) => void;
  skipRestTimer: () => void;

  // Gestión de Ejercicios y Cámara / Avatar
  updateExerciseMachinePhoto: (exerciseId: string, photoUrl: string) => void;
  createExercise: (newEx: Omit<Exercise, 'id'>) => Exercise;
  updateExercise: (updatedEx: Exercise) => void;
  deleteExercise: (exerciseId: string) => void;

  // Gestión de Rutinas (CRUD Completo)
  createRoutine: (routine: Omit<Routine, 'id'>) => Routine;
  updateRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exercises, setExercises] = useState<Exercise[]>(() => storageService.getExercises());
  const [routines, setRoutines] = useState<Routine[]>(() => storageService.getRoutines());
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>(() => storageService.getWorkoutHistory());
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(() => storageService.getActiveSession());

  const [restTimer, setRestTimer] = useState<RestTimerState>({
    isActive: false,
    totalSeconds: 60,
    remainingSeconds: 60,
    exerciseName: '',
    setNumber: 1,
    isPaused: false,
    autoStarted: false
  });

  // Guardar en Storage ante cambios
  useEffect(() => {
    storageService.saveExercises(exercises);
  }, [exercises]);

  useEffect(() => {
    storageService.saveRoutines(routines);
  }, [routines]);

  useEffect(() => {
    storageService.saveWorkoutHistory(workoutHistory);
  }, [workoutHistory]);

  useEffect(() => {
    storageService.saveActiveSession(activeSession);
  }, [activeSession]);

  // Cronómetro del temporizador de descanso
  const restTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (restTimer.isActive && !restTimer.isPaused && restTimer.remainingSeconds > 0) {
      restTimerRef.current = window.setInterval(() => {
        setRestTimer(prev => {
          if (prev.remainingSeconds <= 1) {
            // Fin del descanso
            playRestCompleteSound();
            return { ...prev, isActive: false, remainingSeconds: 0 };
          }
          if (prev.remainingSeconds <= 4 && prev.remainingSeconds >= 2) {
            // Aviso de cuenta atrás (3, 2, 1)
            playCountdownTick();
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    } else {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
    }

    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, [restTimer.isActive, restTimer.isPaused, restTimer.remainingSeconds]);

  // Iniciar temporizador de descanso
  const startRestTimer = useCallback((seconds: number, exerciseName: string, setNumber: number) => {
    const sec = Math.max(5, seconds);
    setRestTimer({
      isActive: true,
      totalSeconds: sec,
      remainingSeconds: sec,
      exerciseName,
      setNumber,
      isPaused: false,
      autoStarted: true
    });
  }, []);

  const pauseRestTimer = useCallback(() => {
    setRestTimer(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeRestTimer = useCallback(() => {
    setRestTimer(prev => ({ ...prev, isPaused: false }));
  }, []);

  const addRestSeconds = useCallback((seconds: number) => {
    setRestTimer(prev => ({
      ...prev,
      totalSeconds: prev.totalSeconds + seconds,
      remainingSeconds: Math.max(1, prev.remainingSeconds + seconds)
    }));
  }, []);

  const skipRestTimer = useCallback(() => {
    setRestTimer(prev => ({ ...prev, isActive: false, remainingSeconds: 0 }));
  }, []);

  // Iniciar entrenamiento
  const startWorkout = useCallback((routineId?: string, customName?: string) => {
    const routine = routines.find(r => r.id === routineId);
    let initialExercises: WorkoutExercise[] = [];

    if (routine) {
      initialExercises = routine.exercises.map(tmpl => {
        const exMeta = exercises.find(e => e.id === tmpl.exerciseId);
        const sets: WorkoutSet[] = Array.from({ length: tmpl.defaultSets || 3 }).map((_, idx) => ({
          id: `set_${Date.now()}_${idx}`,
          setNumber: idx + 1,
          weightKg: tmpl.defaultWeightKg || 0,
          reps: tmpl.defaultReps || 10,
          durationSeconds: 0,
          isCompleted: false
        }));

        return {
          exerciseId: tmpl.exerciseId,
          exerciseName: exMeta ? exMeta.name : 'Ejercicio',
          exerciseCategory: exMeta ? exMeta.category : 'Pecho',
          exercisePhotoUrl: exMeta ? exMeta.machinePhotoUrl : undefined,
          targetRestSeconds: tmpl.targetRestSeconds || exMeta?.defaultRestSeconds || 60,
          sets
        };
      });
    }

    const session: WorkoutSession = {
      id: `session_${Date.now()}`,
      routineId,
      name: customName || (routine ? routine.name : 'Entrenamiento Libre'),
      date: new Date().toISOString(),
      startTime: Date.now(),
      totalDurationSeconds: 0,
      exercises: initialExercises,
      isCompleted: false
    };

    setActiveSession(session);
  }, [routines, exercises]);

  // Repetir un entrenamiento del historial
  const repeatWorkoutSession = useCallback((pastSession: WorkoutSession) => {
    const copiedExercises: WorkoutExercise[] = pastSession.exercises.map(ex => {
      const exMeta = exercises.find(e => e.id === ex.exerciseId);
      const sets: WorkoutSet[] = ex.sets.map((s, idx) => ({
        id: `set_${Date.now()}_${idx}`,
        setNumber: idx + 1,
        weightKg: s.weightKg,
        reps: s.reps,
        durationSeconds: 0,
        isCompleted: false
      }));

      return {
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        exerciseCategory: ex.exerciseCategory,
        exercisePhotoUrl: exMeta?.machinePhotoUrl || ex.exercisePhotoUrl,
        targetRestSeconds: ex.targetRestSeconds || 60,
        sets
      };
    });

    const newSession: WorkoutSession = {
      id: `session_${Date.now()}`,
      routineId: pastSession.routineId,
      name: pastSession.name,
      date: new Date().toISOString(),
      startTime: Date.now(),
      totalDurationSeconds: 0,
      exercises: copiedExercises,
      isCompleted: false
    };

    setActiveSession(newSession);
  }, [exercises]);

  const deleteWorkoutSession = useCallback((sessionId: string) => {
    setWorkoutHistory(prev => prev.filter(s => s.id !== sessionId));
  }, []);

  // Finalizar entrenamiento
  const finishWorkout = useCallback(() => {
    if (!activeSession) return;

    let totalVolume = 0;
    let completedSetsCount = 0;

    activeSession.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.isCompleted) {
          totalVolume += (set.weightKg * set.reps);
          completedSetsCount++;
        }
      });
    });

    const endTime = Date.now();
    const duration = Math.round((endTime - activeSession.startTime) / 1000);

    const completedSession: WorkoutSession = {
      ...activeSession,
      endTime,
      totalDurationSeconds: duration,
      isCompleted: true,
      totalVolumeKg: totalVolume,
      totalSetsCompleted: completedSetsCount
    };

    setWorkoutHistory(prev => [completedSession, ...prev]);
    setActiveSession(null);
    skipRestTimer();

    // Animación de celebración con confeti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignorar si falla
    }
  }, [activeSession, skipRestTimer]);

  const cancelWorkout = useCallback(() => {
    setActiveSession(null);
    skipRestTimer();
  }, [skipRestTimer]);

  // Añadir ejercicio a sesión activa
  const addExerciseToActiveWorkout = useCallback((exerciseId: string) => {
    if (!activeSession) return;
    const exMeta = exercises.find(e => e.id === exerciseId);
    if (!exMeta) return;

    const newExercise: WorkoutExercise = {
      exerciseId: exMeta.id,
      exerciseName: exMeta.name,
      exerciseCategory: exMeta.category,
      exercisePhotoUrl: exMeta.machinePhotoUrl,
      targetRestSeconds: exMeta.defaultRestSeconds || 60,
      sets: [
        {
          id: `set_${Date.now()}_1`,
          setNumber: 1,
          weightKg: 20,
          reps: 10,
          durationSeconds: 0,
          isCompleted: false
        }
      ]
    };

    setActiveSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: [...prev.exercises, newExercise]
      };
    });
  }, [activeSession, exercises]);

  const removeExerciseFromActiveWorkout = useCallback((exerciseIndex: number) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = [...prev.exercises];
      updated.splice(exerciseIndex, 1);
      return { ...prev, exercises: updated };
    });
  }, []);

  const addSet = useCallback((exerciseIndex: number) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = [...prev.exercises];
      const targetEx = { ...updated[exerciseIndex] };
      const lastSet = targetEx.sets[targetEx.sets.length - 1];

      const newSet: WorkoutSet = {
        id: `set_${Date.now()}_${targetEx.sets.length + 1}`,
        setNumber: targetEx.sets.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 20,
        reps: lastSet ? lastSet.reps : 10,
        durationSeconds: 0,
        isCompleted: false
      };

      targetEx.sets = [...targetEx.sets, newSet];
      updated[exerciseIndex] = targetEx;
      return { ...prev, exercises: updated };
    });
  }, []);

  const removeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = [...prev.exercises];
      const targetEx = { ...updated[exerciseIndex] };
      if (targetEx.sets.length <= 1) return prev; // Mantener al menos 1 serie

      targetEx.sets = targetEx.sets.filter((_, idx) => idx !== setIndex).map((s, idx) => ({
        ...s,
        setNumber: idx + 1
      }));

      updated[exerciseIndex] = targetEx;
      return { ...prev, exercises: updated };
    });
  }, []);

  const updateSet = useCallback((exerciseIndex: number, setIndex: number, field: 'weightKg' | 'reps' | 'durationSeconds', value: number) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = [...prev.exercises];
      const targetEx = { ...updated[exerciseIndex] };
      const updatedSets = [...targetEx.sets];
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: Math.max(0, value)
      };

      targetEx.sets = updatedSets;
      updated[exerciseIndex] = targetEx;
      return { ...prev, exercises: updated };
    });
  }, []);

  // Completar Serie: Guarda estado, reproduce sonido y lanza el temporizador de descanso
  const completeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    if (!activeSession) return;
    const targetEx = activeSession.exercises[exerciseIndex];
    if (!targetEx) return;

    setActiveSession(prev => {
      if (!prev) return null;
      const updated = [...prev.exercises];
      const currentEx = { ...updated[exerciseIndex] };
      const updatedSets = [...currentEx.sets];

      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        isCompleted: true,
        completedAt: new Date().toISOString()
      };

      currentEx.sets = updatedSets;
      updated[exerciseIndex] = currentEx;
      return { ...prev, exercises: updated };
    });

    playSetCompleteSound();

    // Activar inmediatamente el descanso estipulado
    const restSec = targetEx.targetRestSeconds || 60;
    startRestTimer(restSec, targetEx.exerciseName, setIndex + 1);
  }, [activeSession, startRestTimer]);

  const uncompleteSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = [...prev.exercises];
      const currentEx = { ...updated[exerciseIndex] };
      const updatedSets = [...currentEx.sets];

      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        isCompleted: false,
        completedAt: undefined
      };

      currentEx.sets = updatedSets;
      updated[exerciseIndex] = currentEx;
      return { ...prev, exercises: updated };
    });
  }, []);

  const updateExerciseTargetRest = useCallback((exerciseIndex: number, seconds: number) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = [...prev.exercises];
      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        targetRestSeconds: seconds
      };
      return { ...prev, exercises: updated };
    });
  }, []);

  // Actualizar avatar/foto de la máquina para un ejercicio
  const updateExerciseMachinePhoto = useCallback((exerciseId: string, photoUrl: string) => {
    // Actualizar catálogo de ejercicios
    setExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, machinePhotoUrl: photoUrl } : ex));

    // Si hay una sesión activa con este ejercicio, actualizarla también
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = prev.exercises.map(ex => {
        if (ex.exerciseId === exerciseId) {
          return { ...ex, exercisePhotoUrl: photoUrl };
        }
        return ex;
      });
      return { ...prev, exercises: updated };
    });
  }, []);

  const createExercise = useCallback((newEx: Omit<Exercise, 'id'>): Exercise => {
    const exercise: Exercise = {
      ...newEx,
      id: `ex_custom_${Date.now()}`,
      isCustom: true
    };
    setExercises(prev => [exercise, ...prev]);
    return exercise;
  }, []);

  const updateExercise = useCallback((updatedEx: Exercise) => {
    setExercises(prev => prev.map(ex => ex.id === updatedEx.id ? updatedEx : ex));
  }, []);

  const deleteExercise = useCallback((exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  }, []);

  const createRoutine = useCallback((routine: Omit<Routine, 'id'>): Routine => {
    const newRoutine: Routine = {
      ...routine,
      id: `routine_${Date.now()}`
    };
    setRoutines(prev => [...prev, newRoutine]);
    return newRoutine;
  }, []);

  const updateRoutine = useCallback((updatedRoutine: Routine) => {
    setRoutines(prev => prev.map(r => r.id === updatedRoutine.id ? updatedRoutine : r));
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <WorkoutContext.Provider value={{
      exercises,
      routines,
      workoutHistory,
      activeSession,
      restTimer,
      startWorkout,
      finishWorkout,
      cancelWorkout,
      repeatWorkoutSession,
      deleteWorkoutSession,
      addExerciseToActiveWorkout,
      removeExerciseFromActiveWorkout,
      addSet,
      removeSet,
      updateSet,
      completeSet,
      uncompleteSet,
      updateExerciseTargetRest,
      startRestTimer,
      pauseRestTimer,
      resumeRestTimer,
      addRestSeconds,
      skipRestTimer,
      updateExerciseMachinePhoto,
      createExercise,
      updateExercise,
      deleteExercise,
      createRoutine,
      updateRoutine,
      deleteRoutine
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout debe ser usado dentro de WorkoutProvider');
  }
  return context;
};
