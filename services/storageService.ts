import { SessionStats, UserState } from '../types';

const STORAGE_KEY = 'respiro_sessions_v1';
const CRISIS_PLAN_KEY = 'respiro_crisis_plan_v1';

export interface SavedSession {
  id: string;
  timestamp: number;
  durationSeconds: number;
  patternName: string;
  vagalScore: number;
}

export interface UserAggregatedStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  lastSessionDate: number | null;
  averageVagalScore: number;
}

export const saveSession = (session: SavedSession) => {
  if (typeof window === 'undefined') return;
  
  const existing = getHistory();
  const updated = [session, ...existing]; // Prepend new session
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getHistory = (): SavedSession[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const saveCrisisPlan = (plan: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CRISIS_PLAN_KEY, plan);
};

export const getCrisisPlan = (): string => {
  if (typeof window === 'undefined') return "";
  return localStorage.getItem(CRISIS_PLAN_KEY) || "";
};

export const getAggregatedStats = (): UserAggregatedStats => {
  const sessions = getHistory();
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationSeconds / 60), 0);
  
  // Calculate Streak (consecutive days)
  // Simplified logic: Check if sessions exist in consecutive 24h windows
  let currentStreak = 0;
  if (sessions.length > 0) {
    const sorted = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
    const today = new Date().setHours(0,0,0,0);
    const lastSessionDay = new Date(sorted[0].timestamp).setHours(0,0,0,0);
    
    if (lastSessionDay === today || lastSessionDay === today - 86400000) {
        currentStreak = 1;
        let checkDate = lastSessionDay;
        
        for (let i = 1; i < sorted.length; i++) {
             const sessionDate = new Date(sorted[i].timestamp).setHours(0,0,0,0);
             if (sessionDate === checkDate) continue; // Same day multiple sessions
             if (sessionDate === checkDate - 86400000) {
                 currentStreak++;
                 checkDate = sessionDate;
             } else {
                 break;
             }
        }
    }
  }

  const avgScore = sessions.length > 0 
    ? sessions.reduce((acc, s) => acc + s.vagalScore, 0) / sessions.length
    : 0;

  return {
    totalSessions,
    totalMinutes: Math.floor(totalMinutes),
    currentStreak,
    lastSessionDate: sessions.length > 0 ? sessions[0].timestamp : null,
    averageVagalScore: Math.round(avgScore)
  };
};