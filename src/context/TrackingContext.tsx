import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { UserProfile, CalculatedMetrics, WeeklyCheckIn } from '../types/tracking';
import { storageService } from '../services/storage';
import { calculateAllMetrics } from '../services/calculations';

interface TrackingContextType {
  profile: UserProfile;
  metrics: CalculatedMetrics;
  weeklyCheckIns: WeeklyCheckIn[];
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  addWeeklyCheckIn: (checkIn: Omit<WeeklyCheckIn, 'id'>) => WeeklyCheckIn;
  updateWeeklyCheckIn: (id: string, updated: Partial<WeeklyCheckIn>) => void;
  deleteWeeklyCheckIn: (id: string) => void;
  stats: {
    weightDelta: number;
    waistDelta: number;
    totalWeeks: number;
    startWeight: number;
    currentWeight: number;
    startWaist: number;
    currentWaist: number;
  };
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [weeklyCheckIns, setWeeklyCheckIns] = useState<WeeklyCheckIn[]>(() => storageService.getWeeklyCheckIns());

  // Métricas calculadas dinámicamente según el perfil
  const metrics = useMemo(() => calculateAllMetrics(profile), [profile]);

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
    const newCheckIn: WeeklyCheckIn = {
      ...checkIn,
      id: `checkin_${Date.now()}`
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
  }, []);

  const updateWeeklyCheckIn = useCallback((id: string, updated: Partial<WeeklyCheckIn>) => {
    setWeeklyCheckIns(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
  }, []);

  const deleteWeeklyCheckIn = useCallback((id: string) => {
    setWeeklyCheckIns(prev => prev.filter(item => item.id !== id));
  }, []);

  // Estadísticas globales de evolución
  const stats = useMemo(() => {
    if (weeklyCheckIns.length === 0) {
      return {
        weightDelta: 0,
        waistDelta: 0,
        totalWeeks: 0,
        startWeight: profile.weightKg,
        currentWeight: profile.weightKg,
        startWaist: 0,
        currentWaist: 0,
      };
    }

    const sortedAsc = [...weeklyCheckIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const first = sortedAsc[0];
    const latest = sortedAsc[sortedAsc.length - 1];

    return {
      weightDelta: Number((latest.weightKg - first.weightKg).toFixed(1)),
      waistDelta: Number((latest.waistCircumferenceCm - first.waistCircumferenceCm).toFixed(1)),
      totalWeeks: sortedAsc.length,
      startWeight: first.weightKg,
      currentWeight: latest.weightKg,
      startWaist: first.waistCircumferenceCm,
      currentWaist: latest.waistCircumferenceCm,
    };
  }, [weeklyCheckIns, profile.weightKg]);

  return (
    <TrackingContext.Provider value={{
      profile,
      metrics,
      weeklyCheckIns,
      updateProfile,
      addWeeklyCheckIn,
      updateWeeklyCheckIn,
      deleteWeeklyCheckIn,
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
