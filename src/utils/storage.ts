import { UserSettings, ActivityLog, DaySummary, StreakInfo, ReminderType } from '../types';

export const DEFAULT_SETTINGS: UserSettings = {
  intervals: {
    water: 45, // 45 min
    stand: 45, // 45 min
    screen: 20, // 20 min
  },
  officeHours: {
    startHour: 9, // 9:00 AM
    startMinute: 0,
    endHour: 18, // 6:00 PM (18:00)
    endMinute: 0,
    workDays: [1, 2, 3, 4, 5], // Monday - Friday
    activeOnlyDuringOfficeHours: true,
  },
  goals: {
    waterMl: 2500, // 10 glasses of 250ml
    standBreaks: 10, // 10 stand breaks per 9h workday
    standMinutes: 30, // 30 minutes total active walking/standing
    screenRests: 18, // 18 screen rests (every 20-30 mins)
    maxContinuousSedentaryMins: 45, // warning if sitting > 45 mins
  },
  sound: {
    soundEnabled: true,
    chimeTone: 'chime',
    volume: 0.7,
    voiceAlertEnabled: false,
    browserNotifications: true,
    vibrationEnabled: true,
  },
  userName: 'Alex Rivers',
};

const STORAGE_KEYS = {
  SETTINGS: 'ergoflow_settings_v1',
  LOGS: 'ergoflow_logs_v1',
  DAILY_RECORDS: 'ergoflow_daily_records_v1',
  STREAK: 'ergoflow_streak_v2',
  TIMERS: 'ergoflow_timers_v1',
  SEDENTARY: 'ergoflow_sedentary_v1',
};

// Check if currently inside office timing (e.g. Mon-Fri 09:00 - 18:00)
export const checkIsOfficeHours = (settings: UserSettings): {
  isOfficeHours: boolean;
  reason: string;
  nextStartTime?: string;
  minutesRemaining?: number;
} => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday ...
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = settings.officeHours.startHour * 60 + settings.officeHours.startMinute;
  const endMinutes = settings.officeHours.endHour * 60 + settings.officeHours.endMinute;

  // Check work days
  const isWorkDay = settings.officeHours.workDays.includes(dayOfWeek);

  if (!isWorkDay) {
    return {
      isOfficeHours: false,
      reason: 'Weekend / Non-work day',
      nextStartTime: `${settings.officeHours.startHour}:00 on next workday`,
    };
  }

  if (currentMinutes < startMinutes) {
    const diff = startMinutes - currentMinutes;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return {
      isOfficeHours: false,
      reason: `Office day begins in ${hours > 0 ? `${hours}h ` : ''}${mins}m`,
      nextStartTime: `${String(settings.officeHours.startHour).padStart(2, '0')}:${String(settings.officeHours.startMinute).padStart(2, '0')}`,
    };
  }

  if (currentMinutes >= endMinutes) {
    return {
      isOfficeHours: false,
      reason: 'Workday completed (after 6:00 PM)',
      nextStartTime: `Tomorrow at ${settings.officeHours.startHour}:00`,
    };
  }

  const remaining = endMinutes - currentMinutes;
  return {
    isOfficeHours: true,
    reason: `Workday Active (Ends ${String(settings.officeHours.endHour).padStart(2, '0')}:${String(settings.officeHours.endMinute).padStart(2, '0')})`,
    minutesRemaining: remaining,
  };
};

export interface ScheduledSlotDetail {
  index: number;
  timeFormatted: string;
  status: 'done' | 'active' | 'upcoming';
  minutesFromMidnight: number;
}

export interface IntervalScheduleInfo {
  intervalMinutes: number;
  totalScheduled: number;
  passedScheduled: number;
  allSlots: ScheduledSlotDetail[];
  completedSlots: string[];
  upcomingSlots: string[];
  nextSlotTime: string;
  calculationFormula: string;
}

export interface WorkdayScheduleSummary {
  startFormatted: string;
  endFormatted: string;
  totalOfficeMinutes: number;
  elapsedOfficeMinutes: number;
  water: IntervalScheduleInfo;
  stand: IntervalScheduleInfo;
  screen: IntervalScheduleInfo;
}

// Strictly calculate intervals across office hours (e.g. 9:00 AM - 6:00 PM = 540 min total)
export const calculateWorkdaySchedule = (
  settings: UserSettings,
  forceOfficeMode: boolean = false
): WorkdayScheduleSummary => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = settings.officeHours.startHour * 60 + settings.officeHours.startMinute;
  const endMinutes = settings.officeHours.endHour * 60 + settings.officeHours.endMinute;
  const totalOfficeMinutes = Math.max(60, endMinutes - startMinutes);

  let elapsed = 0;
  if (forceOfficeMode) {
    elapsed = Math.min(totalOfficeMinutes, 180); // 3 hours elapsed in test mode
  } else if (currentMinutes < startMinutes) {
    elapsed = 0;
  } else if (currentMinutes >= endMinutes) {
    elapsed = totalOfficeMinutes;
  } else {
    elapsed = currentMinutes - startMinutes;
  }

  const formatTimeSlot = (minutesFromMidnight: number): string => {
    const h24 = Math.floor(minutesFromMidnight / 60);
    const m = minutesFromMidnight % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  };

  const computeSlots = (intervalMinutes: number): IntervalScheduleInfo => {
    // Total scheduled intervals strictly calculated based on office hours: 540 / interval
    const totalSlots = Math.floor(totalOfficeMinutes / intervalMinutes);
    const allSlots: ScheduledSlotDetail[] = [];
    const completedSlots: string[] = [];
    const upcomingSlots: string[] = [];

    let hasFoundActive = false;

    for (let i = 1; i <= totalSlots; i++) {
      const slotMin = startMinutes + i * intervalMinutes;
      const formatted = formatTimeSlot(slotMin);

      let status: 'done' | 'active' | 'upcoming' = 'upcoming';

      if (slotMin <= startMinutes + elapsed) {
        status = 'done';
        completedSlots.push(formatted);
      } else if (!hasFoundActive) {
        status = 'active';
        hasFoundActive = true;
        upcomingSlots.push(formatted);
      } else {
        status = 'upcoming';
        upcomingSlots.push(formatted);
      }

      allSlots.push({
        index: i,
        timeFormatted: formatted,
        status,
        minutesFromMidnight: slotMin,
      });
    }

    const nextSlotTime = upcomingSlots.length > 0 
      ? upcomingSlots[0] 
      : completedSlots.length > 0 
      ? 'All slots done today' 
      : 'Starts at 9:00 AM';

    const calculationFormula = `${totalOfficeMinutes}m total ÷ ${intervalMinutes}m interval = ${totalSlots} total scheduled breaks`;

    return {
      intervalMinutes,
      totalScheduled: totalSlots,
      passedScheduled: completedSlots.length,
      allSlots,
      completedSlots,
      upcomingSlots,
      nextSlotTime,
      calculationFormula,
    };
  };

  return {
    startFormatted: formatTimeSlot(startMinutes),
    endFormatted: formatTimeSlot(endMinutes),
    totalOfficeMinutes,
    elapsedOfficeMinutes: elapsed,
    water: computeSlots(settings.intervals.water),
    stand: computeSlots(settings.intervals.stand),
    screen: computeSlots(settings.intervals.screen),
  };
};

// Calculate today's date formatted as YYYY-MM-DD
export const getTodayKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Generate seed data for initial 7-day realistic performance
export const generateSeedDailyRecords = (): DaySummary[] => {
  const days: DaySummary[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    if (isWeekend) {
      days.push({
        date: dateStr,
        waterMl: 1500,
        standBreaks: 4,
        standMinutes: 18,
        screenRests: 6,
        sedentaryMinutes: 180,
        goalMet: true,
        healthScore: 78,
      });
    } else {
      // Office workdays
      const water = 2250 + Math.floor(Math.sin(i) * 350);
      const stand = 9 + (i % 3);
      const standMins = stand * 3;
      const screen = 16 + (i % 4);
      const sitting = 380 - (i % 2) * 40;
      const score = Math.min(100, Math.max(70, Math.round(82 + (stand * 1.5) + (water / 400))));

      days.push({
        date: dateStr,
        waterMl: water,
        standBreaks: stand,
        standMinutes: standMins,
        screenRests: screen,
        sedentaryMinutes: sitting,
        goalMet: stand >= 8 && water >= 2000,
        healthScore: score,
      });
    }
  }

  return days;
};

export const getStoredSettings = (): UserSettings => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!item) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(item) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings: UserSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const getStoredLogs = (): ActivityLog[] => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!item) {
      // Seed initial logs for today
      const today = new Date();
      const createTime = (hoursAgo: number) => new Date(today.getTime() - hoursAgo * 3600000).toISOString();
      const initialLogs: ActivityLog[] = [
        { id: '1', type: 'water', timestamp: createTime(3.2), value: 250, note: 'Morning glass upon desk arrival', source: 'auto_reminder' },
        { id: '2', type: 'stand', timestamp: createTime(3.0), value: 3, note: 'Stood & walked to breakroom', source: 'auto_reminder' },
        { id: '3', type: 'screen', timestamp: createTime(2.6), value: 20, note: '20-20-20 eye gaze out the window', source: 'auto_reminder' },
        { id: '4', type: 'water', timestamp: createTime(2.2), value: 250, note: 'Post-meeting water bottle refill', source: 'manual' },
        { id: '5', type: 'stand', timestamp: createTime(1.8), value: 4, note: 'Stood for desk stretch & calf raises', source: 'auto_reminder' },
        { id: '6', type: 'screen', timestamp: createTime(1.3), value: 20, note: 'Blink break & eye palming', source: 'auto_reminder' },
        { id: '7', type: 'water', timestamp: createTime(0.7), value: 250, note: 'Midday hydration', source: 'auto_reminder' },
        { id: '8', type: 'stand', timestamp: createTime(0.4), value: 3, note: 'Quick hallway stride', source: 'auto_reminder' },
      ];
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(item);
  } catch {
    return [];
  }
};

export const saveStoredLogs = (logs: ActivityLog[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 300))); // keep latest 300
  } catch (e) {
    console.error('Failed to save logs:', e);
  }
};

export const getStoredDailyRecords = (): DaySummary[] => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.DAILY_RECORDS);
    if (!item) {
      const initialRecords = generateSeedDailyRecords();
      localStorage.setItem(STORAGE_KEYS.DAILY_RECORDS, JSON.stringify(initialRecords));
      return initialRecords;
    }
    return JSON.parse(item);
  } catch {
    return generateSeedDailyRecords();
  }
};

export const saveStoredDailyRecords = (records: DaySummary[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save daily records:', e);
  }
};

export const getStoredStreak = (): StreakInfo => {
  const today = getTodayKey();
  try {
    const item = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (!item) {
      // Starts strictly at 0 today; tomorrow will be 1
      const initialStreak: StreakInfo = {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: today,
        history: { [today]: true },
      };
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(initialStreak));
      return initialStreak;
    }
    const streakData: StreakInfo = JSON.parse(item);

    // Auto-advance if day has changed
    if (streakData.lastActiveDate && streakData.lastActiveDate !== today) {
      const last = new Date(streakData.lastActiveDate + 'T00:00:00');
      const now = new Date(today + 'T00:00:00');
      const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        // Consecutive day return! Increment by 1 (e.g. 0 -> 1 tomorrow)
        const updatedStreak: StreakInfo = {
          currentStreak: streakData.currentStreak + 1,
          longestStreak: Math.max(streakData.currentStreak + 1, streakData.longestStreak),
          lastActiveDate: today,
          history: { ...streakData.history, [today]: true },
        };
        localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(updatedStreak));
        return updatedStreak;
      } else if (diffDays > 1) {
        // Missed day, resets to 0 for today
        const resetStreak: StreakInfo = {
          currentStreak: 0,
          longestStreak: streakData.longestStreak,
          lastActiveDate: today,
          history: { ...streakData.history, [today]: true },
        };
        localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(resetStreak));
        return resetStreak;
      }
    }

    return streakData;
  } catch {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: today,
      history: { [today]: true },
    };
  }
};

export const saveStoredStreak = (streak: StreakInfo) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  } catch (e) {
    console.error('Failed to save streak:', e);
  }
};

// Check-in helper that maintains the rule: today is 0, tomorrow becomes 1
export const checkInDailyStreak = (currentStreak: StreakInfo): {
  newStreak: StreakInfo;
  alreadyCheckedIn: boolean;
} => {
  const today = getTodayKey();
  
  if (currentStreak.lastActiveDate === today) {
    return { newStreak: currentStreak, alreadyCheckedIn: true };
  }

  const last = new Date(currentStreak.lastActiveDate + 'T00:00:00');
  const now = new Date(today + 'T00:00:00');
  const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 3600 * 24));

  let nextCount = 0;
  if (diffDays === 1) {
    nextCount = currentStreak.currentStreak + 1; // tomorrow becomes 1
  } else {
    nextCount = 0; // reset to 0 today
  }

  const updated: StreakInfo = {
    currentStreak: nextCount,
    longestStreak: Math.max(nextCount, currentStreak.longestStreak),
    lastActiveDate: today,
    history: {
      ...currentStreak.history,
      [today]: true,
    },
  };

  saveStoredStreak(updated);
  return { newStreak: updated, alreadyCheckedIn: false };
};


// Calculate Health Score (0 - 100) based on daily goals attainment and sedentary interruption
export const calculateHealthScore = (
  waterMl: number,
  standBreaks: number,
  screenRests: number,
  sedentaryMinutes: number,
  goals: UserSettings['goals']
): number => {
  const waterRatio = Math.min(1.2, waterMl / Math.max(1, goals.waterMl));
  const standRatio = Math.min(1.2, standBreaks / Math.max(1, goals.standBreaks));
  const screenRatio = Math.min(1.2, screenRests / Math.max(1, goals.screenRests));

  // Sedentary penalty if over 360 mins (6 hrs sitting)
  const sedentaryPenalty = Math.max(0, (sedentaryMinutes - 300) / 20);

  const rawScore = (waterRatio * 35) + (standRatio * 40) + (screenRatio * 25) - sedentaryPenalty;
  return Math.max(10, Math.min(100, Math.round(rawScore)));
};
