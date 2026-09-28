export type ReminderType = 'water' | 'stand' | 'screen';

export interface ReminderConfig {
  id: ReminderType;
  title: string;
  subtitle: string;
  intervalMinutes: number;
  icon: string;
  color: string;
  accentColor: string;
  defaultIncrement: number; // e.g., 250ml for water, 2 min for walk, 20s for screen
  unit: string;
}

export interface UserGoals {
  waterMl: number; // e.g. 2500 ml
  standBreaks: number; // e.g. 10 breaks
  standMinutes: number; // e.g. 30 active mins
  screenRests: number; // e.g. 18 rests
  maxContinuousSedentaryMins: number; // e.g. 45 mins
}

export interface OfficeHoursConfig {
  startHour: number; // 9 = 09:00
  startMinute: number;
  endHour: number; // 18 = 18:00
  endMinute: number;
  workDays: number[]; // 1 = Mon, 2 = Tue, ..., 5 = Fri
  activeOnlyDuringOfficeHours: boolean;
}

export interface SoundConfig {
  soundEnabled: boolean;
  chimeTone: 'droplet' | 'zen' | 'chime' | 'ping';
  volume: number; // 0 to 1
  voiceAlertEnabled: boolean;
  browserNotifications: boolean;
  vibrationEnabled: boolean;
}

export interface UserSettings {
  intervals: {
    water: number; // default 45
    stand: number; // default 45
    screen: number; // default 20
  };
  officeHours: OfficeHoursConfig;
  goals: UserGoals;
  sound: SoundConfig;
  userName: string;
}

export interface ActivityLog {
  id: string;
  type: ReminderType | 'sedentary_reset';
  timestamp: string; // ISO string
  value: number; // ml or minutes or seconds
  note?: string;
  source: 'auto_reminder' | 'manual';
}

export interface DaySummary {
  date: string; // YYYY-MM-DD
  waterMl: number;
  standBreaks: number;
  standMinutes: number;
  screenRests: number;
  sedentaryMinutes: number;
  goalMet: boolean;
  healthScore: number; // 0 - 100
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  history: { [date: string]: boolean };
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
  isHealthBreak?: boolean;
}

export interface AICoachAdvice {
  coachTitle: string;
  overallEvaluation: string;
  ergonomicObservations: string[];
  suggestedAdjustments: {
    recommendedWaterMl: number;
    waterReason: string;
    recommendedStandBreaks: number;
    standReason: string;
    recommendedScreenRests: number;
    screenReason: string;
    recommendedMaxContinuousSedentaryMins: number;
    sedentaryReason: string;
  };
  recommendedBreakIntervals: {
    waterMinutes: number;
    standMinutes: number;
    screenMinutes: number;
  };
  motivationalTip: string;
  generatedAt?: string;
}

