import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Exercise, Routine, WorkoutSession, WorkoutExercise, WorkoutSet, RestTimerState } from '../types/workout';
import { storageService } from '../services/storage';
import { playCountdownTick, playRestCompleteSound, playSetCompleteSound } from '../services/audioService';
import { sortRoutinesByDay } from '../services/routineSorter';
import confetti from 'canvas-confetti';

interface LastExerciseHistory {
  lastWeightKg: number;
  lastReps: number;
  lastSetsCount: number;
  lastDateStr?: string;
  bestWeightKg: number;
}

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
  addMultipleExercisesToActiveWorkout: (exerciseIds: string[]) => void;
  removeExerciseFromActiveWorkout: (exerciseIndex: number) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, field: 'weightKg' | 'reps' | 'durationSeconds', value: number) => void;
  completeSet: (exerciseIndex: number, setIndex: number) => void;
  uncompleteSet: (exerciseIndex: number, setIndex: number) => void;
  updateExerciseTargetRest: (exerciseIndex: number, seconds: number) => void;
  getLastExercisePerformance: (exerciseId: string) => LastExerciseHistory | null;
  
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

  // Gestión de Rutinas (CRUD Completo y Ordenación)
  createRoutine: (routine: Omit<Routine, 'id'>) => Routine;
  updateRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  moveRoutine: (id: string, direction: 'up' | 'down') => void;
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

  // Helper para buscar el último rendimiento histórico de un ejercicio
  const getLastExercisePerformance = useCallback((exerciseId: string): LastExerciseHistory | null => {
    if (!workoutHistory || workoutHistory.length === 0) return null;

    let bestWeight = 0;
    let foundLast: { weight: number; reps: number; setsCount: number; dateStr?: string } | null = null;

    // Recorrer de más reciente a más antiguo
    for (const session of workoutHistory) {
      if (!session || !session.exercises) continue;
      const match = session.exercises.find(e => e && e.exerciseId === exerciseId);
      if (match && match.sets && match.sets.length > 0) {
        const completedSets = match.sets.filter(s => s && s.isCompleted);
        const setPool = completedSets.length > 0 ? completedSets : match.sets;
        const lastSet = setPool[setPool.length - 1];

        if (!foundLast && lastSet) {
          foundLast = {
            weight: lastSet.weightKg || 0,
            reps: lastSet.reps || 0,
            setsCount: match.sets.length,
            dateStr: session.date ? new Date(session.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : undefined
          };
        }

        // Buscar el peso máximo histórico
        setPool.forEach(s => {
          if (s && s.weightKg && s.weightKg > bestWeight) bestWeight = s.weightKg;
        });
      }
    }

    if (!foundLast) return null;

    return {
      lastWeightKg: foundLast.weight,
      lastReps: foundLast.reps,
      lastSetsCount: foundLast.setsCount,
      lastDateStr: foundLast.dateStr,
      bestWeightKg: Math.max(bestWeight, foundLast.weight)
    };
  }, [workoutHistory]);

  // Cronómetro del temporizador de descanso
  const restTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (restTimer.isActive && !restTimer.isPaused && restTimer.remainingSeconds > 0) {
      restTimerRef.current = window.setInterval(() => {
        setRestTimer(prev => {
          if (prev.remainingSeconds <= 1) {
            playRestCompleteSound();
            return { ...prev, isActive: false, remainingSeconds: 0 };
          }
          if (prev.remainingSeconds <= 4 && prev.remainingSeconds >= 2) {
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

  // Iniciar entrenamiento con memoria histórica de cargas
  const startWorkout = useCallback((routineId?: string, customName?: string) => {
    const routine = routines.find(r => r.id === routineId);
    let initialExercises: WorkoutExercise[] = [];

    if (routine) {
      initialExercises = (routine.exercises || []).map(tmpl => {
        const exMeta = exercises.find(e => e.id === tmpl.exerciseId);
        const lastPerf = tmpl.exerciseId ? getLastExercisePerformance(tmpl.exerciseId) : null;

        const defaultWeight = lastPerf ? lastPerf.lastWeightKg : (tmpl.defaultWeightKg || 0);
        const defaultReps = lastPerf ? lastPerf.lastReps : (tmpl.defaultReps || 10);
        const setsCount = tmpl.defaultSets || (lastPerf ? lastPerf.lastSetsCount : 4);

        const sets: WorkoutSet[] = Array.from({ length: setsCount }).map((_, idx) => ({
          id: `set_${Date.now()}_${idx}`,
          setNumber: idx + 1,
          weightKg: defaultWeight,
          reps: defaultReps,
          durationSeconds: 0,
          isCompleted: false
        }));

        return {
          exerciseId: tmpl.exerciseId || `ex_${Date.now()}`,
          exerciseName: exMeta ? exMeta.name : (tmpl.exerciseId || 'Ejercicio'),
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
    storageService.saveActiveSession(session);
  }, [routines, exercises, getLastExercisePerformance]);

  // Repetir un entrenamiento del historial
  const repeatWorkoutSession = useCallback((pastSession: WorkoutSession) => {
    const copiedExercises: WorkoutExercise[] = (pastSession.exercises || []).map(ex => {
      const exMeta = exercises.find(e => e.id === ex.exerciseId);
      const lastPerf = getLastExercisePerformance(ex.exerciseId);

      const sets: WorkoutSet[] = (ex.sets || []).map((s, idx) => ({
        id: `set_${Date.now()}_${idx}`,
        setNumber: idx + 1,
        weightKg: lastPerf ? lastPerf.lastWeightKg : s.weightKg,
        reps: lastPerf ? lastPerf.lastReps : s.reps,
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
    storageService.saveActiveSession(newSession);
  }, [exercises, getLastExercisePerformance]);

  const deleteWorkoutSession = useCallback((sessionId: string) => {
    setWorkoutHistory(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      storageService.saveWorkoutHistory(updated);
      return updated;
    });
  }, []);

  // Finalizar entrenamiento de forma segura y síncrona
  const finishWorkout = useCallback(() => {
    if (!activeSession) return;

    let totalVolume = 0;
    let completedSetsCount = 0;

    const safeExercises = (activeSession.exercises || []).map(ex => {
      const safeSets = (ex.sets || []).map(set => {
        if (set && set.isCompleted) {
          totalVolume += ((set.weightKg || 0) * (set.reps || 0));
          completedSetsCount++;
        }
        return {
          id: set?.id || `set_${Date.now()}`,
          setNumber: set?.setNumber || 1,
          weightKg: set?.weightKg || 0,
          reps: set?.reps || 0,
          durationSeconds: set?.durationSeconds || 0,
          isCompleted: !!set?.isCompleted,
          completedAt: set?.completedAt
        };
      });

      return {
        ...ex,
        sets: safeSets
      };
    });

    const endTime = Date.now();
    const duration = Math.max(0, Math.round((endTime - (activeSession.startTime || endTime)) / 1000));

    const completedSession: WorkoutSession = {
      ...activeSession,
      exercises: safeExercises,
      endTime,
      totalDurationSeconds: duration,
      isCompleted: true,
      totalVolumeKg: totalVolume,
      totalSetsCompleted: completedSetsCount
    };

    setWorkoutHistory(prev => {
      const updated = [completedSession, ...prev];
      storageService.saveWorkoutHistory(updated);
      return updated;
    });

    setActiveSession(null);
    storageService.saveActiveSession(null);
    skipRestTimer();

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignorar
    }
  }, [activeSession, skipRestTimer]);

  const cancelWorkout = useCallback(() => {
    setActiveSession(null);
    storageService.saveActiveSession(null);
    skipRestTimer();
  }, [skipRestTimer]);

  // Añadir un ejercicio a la sesión activa
  const addExerciseToActiveWorkout = useCallback((exerciseId: string) => {
    if (!activeSession) return;
    const exMeta = exercises.find(e => e.id === exerciseId);
    if (!exMeta) return;

    const lastPerf = getLastExercisePerformance(exerciseId);
    const initialWeight = lastPerf ? lastPerf.lastWeightKg : 20;
    const initialReps = lastPerf ? lastPerf.lastReps : 10;
    const initialSetsCount = lastPerf ? lastPerf.lastSetsCount : 4;

    const sets: WorkoutSet[] = Array.from({ length: initialSetsCount }).map((_, idx) => ({
      id: `set_${Date.now()}_${idx + 1}`,
      setNumber: idx + 1,
      weightKg: initialWeight,
      reps: initialReps,
      durationSeconds: 0,
      isCompleted: false
    }));

    const newExercise: WorkoutExercise = {
      exerciseId: exMeta.id,
      exerciseName: exMeta.name,
      exerciseCategory: exMeta.category,
      exercisePhotoUrl: exMeta.machinePhotoUrl,
      targetRestSeconds: exMeta.defaultRestSeconds || 60,
      sets
    };

    setActiveSession(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        exercises: [...(prev.exercises || []), newExercise]
      };
      storageService.saveActiveSession(updated);
      return updated;
    });
  }, [activeSession, exercises, getLastExercisePerformance]);

  // Añadir múltiples ejercicios a la vez a la sesión activa
  const addMultipleExercisesToActiveWorkout = useCallback((exerciseIds: string[]) => {
    if (!activeSession) return;
    const newExercises: WorkoutExercise[] = [];

    exerciseIds.forEach(id => {
      const exMeta = exercises.find(e => e.id === id);
      if (!exMeta) return;

      const lastPerf = getLastExercisePerformance(id);
      const initialWeight = lastPerf ? lastPerf.lastWeightKg : 20;
      const initialReps = lastPerf ? lastPerf.lastReps : 10;
      const initialSetsCount = lastPerf ? lastPerf.lastSetsCount : 4;

      const sets: WorkoutSet[] = Array.from({ length: initialSetsCount }).map((_, idx) => ({
        id: `set_${Date.now()}_${idx + 1}`,
        setNumber: idx + 1,
        weightKg: initialWeight,
        reps: initialReps,
        durationSeconds: 0,
        isCompleted: false
      }));

      newExercises.push({
        exerciseId: exMeta.id,
        exerciseName: exMeta.name,
        exerciseCategory: exMeta.category,
        exercisePhotoUrl: exMeta.machinePhotoUrl,
        targetRestSeconds: exMeta.defaultRestSeconds || 60,
        sets
      });
    });

    setActiveSession(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        exercises: [...(prev.exercises || []), ...newExercises]
      };
      storageService.saveActiveSession(updated);
      return updated;
    });
  }, [activeSession, exercises, getLastExercisePerformance]);

  const removeExerciseFromActiveWorkout = useCallback((exerciseIndex: number) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updatedList = [...(prev.exercises || [])];
      updatedList.splice(exerciseIndex, 1);
      const updated = { ...prev, exercises: updatedList };
      storageService.saveActiveSession(updated);
      return updated;
    });
  }, []);

  const addSet = useCallback((exerciseIndex: number) => {
    setActiveSession(prev => {
      if (!prev || !prev.exercises || !prev.exercises[exerciseIndex]) return null;
      const updatedList = [...prev.exercises];
      const targetEx = { ...updatedList[exerciseIndex] };
      const exSets = targetEx.sets || [];
      const lastSet = exSets[exSets.length - 1];

      const newSet: WorkoutSet = {
        id: `set_${Date.now()}_${exSets.length + 1}`,
        setNumber: exSets.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 20,
        reps: lastSet ? lastSet.reps : 10,
        durationSeconds: 0,
        isCompleted: false
      };

      targetEx.sets = [...exSets, newSet];
      updatedList[exerciseIndex] = targetEx;
      const updated = { ...prev, exercises: updatedList };
      storageService.saveActiveSession(updated);
      return updated;
    });
  }, []);

  const removeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setActiveSession(prev => {
      if (!prev || !prev.exercises || !prev.exercises[exerciseIndex]) return null;
      const updatedList = [...prev.exercises];
      const targetEx = { ...updatedList[exerciseIndex] };
      const exSets = targetEx.sets || [];
      if (exSets.length <= 1) return prev;

      targetEx.sets = exSets.filter((_, idx) => idx !== setIndex).map((s, idx) => ({
        ...s,
        setNumber: idx + 1
      }));

      updatedList[exerciseIndex] = targetEx;
      const updated = { ...prev, exercises: updatedList };
      storageService.saveActiveSession(updated);
      return updated;
    });
  }, []);

  const updateSet = useCallback((exerciseIndex: number, setIndex: number, field: 'weightKg' | 'reps' | 'durationSeconds', value: number) => {
    setActiveSession(prev => {
      if (!prev || !prev.exercises || !prev.exercises[exerciseIndex]) return null;
      const updatedList = [...prev.exercises];
      const targetEx = { ...updatedList[exerciseIndex] };
      const updatedSets = [...(targetEx.sets || [])];
      
      if (!updatedSets[setIndex]) return prev;

      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: Math.max(0, value)
      };

      targetEx.sets = updatedSets;
      updatedList[exerciseIndex] = targetEx;
      const updated = { ...prev, exercises: updatedList };
      storageService.saveActiveSession(updated);
      return updated;
    });
  }, []);

  // Completar Serie
  const completeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    if (!activeSession || !activeSession.exercises || !activeSession.exercises[exerciseIndex]) return;
    const targetEx = activeSession.exercises[exerciseIndex];

    setActiveSession(prev => {
      if (!prev || !prev.exercises || !prev.exercises[exerciseIndex]) return null;
      const updatedList = [...prev.exercises];
      const currentEx = { ...updatedList[exerciseIndex] };
      const updatedSets = [...(currentEx.sets || [])];

      if (!updatedSets[setIndex]) return prev;

      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        isCompleted: true,
        completedAt: new Date().toISOString()
      };

      currentEx.sets = updatedSets;
      updatedList[exerciseIndex] = currentEx;
      const updated = { ...prev, exercises: updatedList };
      storageService.saveActiveSession(updated);
      return updated;
    });

    playSetCompleteSound();

    const restSec = targetEx.targetRestSeconds || 60;
    startRestTimer(restSec, targetEx.exerciseName, setIndex + 1);
  }, [activeSession, startRestTimer]);

  const uncompleteSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setActiveSession(prev => {
      if (!prev || !prev.exercises || !prev.exercises[exerciseIndex]) return null;
      const updatedList = [...prev.exercises];
      const currentEx = { ...updatedList[exerciseIndex] };
      const updatedSets = [...(currentEx.sets || [])];

      if (!updatedSets[setIndex]) return prev;

      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        isCompleted: false,
        completedAt: undefined
      };

      currentEx.sets = updatedSets;
      updatedList[exerciseIndex] = currentEx;
      const updated = { ...prev, exercises: updatedList };
      storageService.saveActiveSession(updated);
      return updated;
    });
  }, []);

  const updateExerciseTargetRest = useCallback((exerciseIndex: number, seconds: number) => {
    setActiveSession(prev => {
      if (!prev || !prev.exercises || !prev.exercises[exerciseIndex]) return null;
      const updatedList = [...prev.exercises];
      updatedList[exerciseIndex] = {
        ...updatedList[exerciseIndex],
        targetRestSeconds: seconds
      };
      const updated = { ...prev, exercises: updatedList };
      storageService.saveActiveSession(updated);
      return updated;
    });
  }, []);

  // Actualizar avatar/foto de la máquina para un ejercicio
  const updateExerciseMachinePhoto = useCallback((exerciseId: string, photoUrl: string) => {
    setExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, machinePhotoUrl: photoUrl } : ex));

    setActiveSession(prev => {
      if (!prev || !prev.exercises) return null;
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
    setRoutines(prev => {
      const updated = sortRoutinesByDay([...prev, newRoutine]);
      storageService.saveRoutines(updated);
      return updated;
    });
    return newRoutine;
  }, []);

  const updateRoutine = useCallback((updatedRoutine: Routine) => {
    setRoutines(prev => {
      const updated = sortRoutinesByDay(prev.map(r => r.id === updatedRoutine.id ? updatedRoutine : r));
      storageService.saveRoutines(updated);
      return updated;
    });
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines(prev => {
      const updated = prev.filter(r => r.id !== id);
      storageService.saveRoutines(updated);
      return updated;
    });
  }, []);

  const moveRoutine = useCallback((id: string, direction: 'up' | 'down') => {
    setRoutines(prev => {
      const index = prev.findIndex(r => r.id === id);
      if (index < 0) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);

      // Re-indexar orderIndex explícitamente para persistir el orden manual
      const reindexed = updated.map((r, idx) => ({
        ...r,
        orderIndex: idx + 1
      }));

      storageService.saveRoutines(reindexed);
      return reindexed;
    });
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
      addMultipleExercisesToActiveWorkout,
      removeExerciseFromActiveWorkout,
      addSet,
      removeSet,
      updateSet,
      completeSet,
      uncompleteSet,
      updateExerciseTargetRest,
      getLastExercisePerformance,
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
      deleteRoutine,
      moveRoutine
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
