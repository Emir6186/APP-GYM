import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { UserProfile, CalculatedMetrics, WeeklyCheckIn, WeightRoadmapStep } from '../types/tracking';
import { storageService } from '../services/storage';
import { calculateAllMetrics, generateWeightRoadmap, auditWeeklyProgress } from '../services/calculations';

interface TrackingContextType {
  profile: UserProfile;
  metrics: CalculatedMetrics;
  weeklyCheckIns: WeeklyCheckIn[];
  roadmapSteps: WeightRoadmapStep[];
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  addWeeklyCheckIn: (checkIn: Omit<WeeklyCheckIn, 'id'>) => WeeklyCheckIn;
  updateWeeklyCheckIn: (id: string, updated: Partial<WeeklyCheckIn>) => void;
  deleteWeeklyCheckIn: (id: string) => void;
  applyCalorieAdjustment: (deltaCalories: number) => void;
  stats: {
    weightDelta: number;
    waistDelta: number;
    totalWeeks: number;
    startWeight: number;
    currentWeight: number;
    startWaist: number;
    currentWaist: number;
    targetWeight: number;
    remainingToTargetKg: number;
  };
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [weeklyCheckIns, setWeeklyCheckIns] = useState<WeeklyCheckIn[]>(() => storageService.getWeeklyCheckIns());

  // Métricas calculadas dinámicamente según el perfil
  const metrics = useMemo(() => calculateAllMetrics(profile), [profile]);

  // Escalada de progreso semana a semana
  const roadmapSteps = useMemo(() => generateWeightRoadmap(profile), [profile]);

  useEffect(() => {
    storageService.saveUserProfile(profile);
  }, [profile]);

  useEffect(() => {
    storageService.saveWeeklyCheckIns(weeklyCheckIns);
  }, [weeklyCheckIns]);

  const updateProfile = useCallback((newProfile: Partial<UserProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...newProfile
    }));
  }, []);

  const addWeeklyCheckIn = useCallback((checkIn: Omit<WeeklyCheckIn, 'id'>): WeeklyCheckIn => {
    // Buscar la última revisión previa para auditar la evolución
    const previous = weeklyCheckIns.length > 0 ? weeklyCheckIns[0] : undefined;
    const audit = auditWeeklyProgress(
      { ...checkIn, id: 'temp' },
      previous,
      profile.goal
    );

    const newCheckIn: WeeklyCheckIn = {
      ...checkIn,
      id: `checkin_${Date.now()}`,
      auditResult: audit
    };

    setWeeklyCheckIns(prev => {
      const updated = [newCheckIn, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return updated;
    });

    // Actualizar también el peso actual en el perfil si es la revisión más reciente
    setProfile(prev => ({
      ...prev,
      weightKg: checkIn.weightKg
    }));

    return newCheckIn;
  }, [weeklyCheckIns, profile.goal]);

  const updateWeeklyCheckIn = useCallback((id: string, updated: Partial<WeeklyCheckIn>) => {
    setWeeklyCheckIns(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
  }, []);

  const deleteWeeklyCheckIn = useCallback((id: string) => {
    setWeeklyCheckIns(prev => prev.filter(item => item.id !== id));
  }, []);

  const applyCalorieAdjustment = useCallback((deltaCalories: number) => {
    if (deltaCalories === 0) return;
    
    // Ajustar el objetivo del perfil acorde
    if (deltaCalories < 0) {
      if (profile.goal === 'deficit_mild') updateProfile({ goal: 'deficit_moderate' });
      else if (profile.goal === 'deficit_moderate') updateProfile({ goal: 'deficit_aggressive' });
      else if (profile.goal === 'surplus_aggressive') updateProfile({ goal: 'surplus_lean' });
      else if (profile.goal === 'surplus_lean') updateProfile({ goal: 'maintenance' });
    } else {
      if (profile.goal === 'deficit_aggressive') updateProfile({ goal: 'deficit_moderate' });
      else if (profile.goal === 'deficit_moderate') updateProfile({ goal: 'deficit_mild' });
      else if (profile.goal === 'deficit_mild') updateProfile({ goal: 'maintenance' });
      else if (profile.goal === 'maintenance') updateProfile({ goal: 'surplus_lean' });
      else if (profile.goal === 'surplus_lean') updateProfile({ goal: 'surplus_aggressive' });
    }
  }, [profile.goal, updateProfile]);

  // Estadísticas globales de evolución
  const stats = useMemo(() => {
    const target = profile.targetWeightKg || profile.weightKg;
    const startW = profile.startWeightKg || profile.weightKg;

    if (weeklyCheckIns.length === 0) {
      return {
        weightDelta: 0,
        waistDelta: 0,
        totalWeeks: 0,
        startWeight: startW,
        currentWeight: profile.weightKg,
        startWaist: 0,
        currentWaist: 0,
        targetWeight: target,
        remainingToTargetKg: Number((profile.weightKg - target).toFixed(1))
      };
    }

    const sortedAsc = [...weeklyCheckIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const first = sortedAsc[0];
    const latest = sortedAsc[sortedAsc.length - 1];

    return {
      weightDelta: Number((latest.weightKg - (profile.startWeightKg || first.weightKg)).toFixed(1)),
      waistDelta: Number((latest.waistCircumferenceCm - first.waistCircumferenceCm).toFixed(1)),
      totalWeeks: sortedAsc.length,
      startWeight: profile.startWeightKg || first.weightKg,
      currentWeight: latest.weightKg,
      startWaist: first.waistCircumferenceCm,
      currentWaist: latest.waistCircumferenceCm,
      targetWeight: target,
      remainingToTargetKg: Number((latest.weightKg - target).toFixed(1))
    };
  }, [weeklyCheckIns, profile.weightKg, profile.startWeightKg, profile.targetWeightKg]);

  return (
    <TrackingContext.Provider value={{
      profile,
      metrics,
      weeklyCheckIns,
      roadmapSteps,
      updateProfile,
      addWeeklyCheckIn,
      updateWeeklyCheckIn,
      deleteWeeklyCheckIn,
      applyCalorieAdjustment,
      stats
    }}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking debe ser usado dentro de TrackingProvider');
  }
  return context;
};
