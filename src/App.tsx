import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { User } from 'firebase/auth';
import { 
  UserSettings, 
  ReminderType, 
  ActivityLog, 
  DaySummary, 
  StreakInfo 
} from './types';
import { 
  DEFAULT_SETTINGS, 
  checkIsOfficeHours, 
  getStoredSettings, 
  saveStoredSettings, 
  getStoredLogs, 
  saveStoredLogs, 
  getStoredDailyRecords, 
  getStoredStreak, 
  calculateWorkdaySchedule,
  getTodayKey,
  calculateHealthScore 
} from './utils/storage';
import { audioManager } from './utils/audio';
import { initAuth } from './services/firebaseAuth';

// Components
import { Header } from './components/Header';
import { ActiveReminders } from './components/ActiveReminders';
import { SedentaryTracker } from './components/SedentaryTracker';
import { AICoachCard } from './components/AICoachCard';
import { DailyStats } from './components/DailyStats';
import { StreakCard } from './components/StreakCard';
import { ReminderAlertModal } from './components/ReminderAlertModal';
import { SettingsModal } from './components/SettingsModal';
import { CalendarSyncModal } from './components/CalendarSyncModal';
import { WeeklyReportModal } from './components/WeeklyReportModal';
import { ActivityLogModal } from './components/ActivityLogModal';
import { GuidedBreathingModal } from './components/GuidedBreathingModal';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  // 1. Settings & User
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings);
  const [user, setUser] = useState<User | null>(null);

  // 2. Office Timing state
  const [forceOfficeMode, setForceOfficeMode] = useState<boolean>(false);
  const [officeStatus, setOfficeStatus] = useState(() => checkIsOfficeHours(settings));

  // 3. Workday Schedule (Strictly calculated across 9:00 AM - 6:00 PM)
  const [schedule, setSchedule] = useState(() => calculateWorkdaySchedule(settings, forceOfficeMode));
  const [extraCompleted, setExtraCompleted] = useState<{
    water: number;
    stand: number;
    screen: number;
  }>({ water: 0, stand: 0, screen: 0 });

  // 4. Timers state
  const [remainingTimes, setRemainingTimes] = useState<{
    water: number;
    stand: number;
    screen: number;
  }>(() => ({
    water: settings.intervals.water * 60,
    stand: settings.intervals.stand * 60,
    screen: settings.intervals.screen * 60,
  }));

  const [timerRunning, setTimerRunning] = useState<{
    water: boolean;
    stand: boolean;
    screen: boolean;
  }>({
    water: true,
    stand: true,
    screen: true,
  });

  // 5. Sedentary Tracking State
  const [continuousSittingMinutes, setContinuousSittingMinutes] = useState<number>(20);
  const [isCurrentlySitting, setIsCurrentlySitting] = useState<boolean>(true);

  // 6. Logs & Daily streak (Starts at 0 today; advances to 1 tomorrow)
  const [logs, setLogs] = useState<ActivityLog[]>(getStoredLogs);
  const [dailyRecords, setDailyRecords] = useState<DaySummary[]>(getStoredDailyRecords);
  const [streak, setStreak] = useState<StreakInfo>(getStoredStreak);

  // 7. Modals
  const [activeAlert, setActiveAlert] = useState<ReminderType | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [showBreathingModal, setShowBreathingModal] = useState<boolean>(false);

  const sedentarySecCounterRef = useRef<number>(0);

  // Initialize Firebase Auth listener on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (authSuccessUser) => {
        setUser(authSuccessUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Update office status & strictly calculated schedule
  useEffect(() => {
    const updateSchedule = () => {
      setOfficeStatus(checkIsOfficeHours(settings));
      setSchedule(calculateWorkdaySchedule(settings, forceOfficeMode));
    };

    updateSchedule();
    const interval = setInterval(updateSchedule, 10000);
    return () => clearInterval(interval);
  }, [settings, forceOfficeMode]);

  const isOfficeHoursActive = officeStatus.isOfficeHours || forceOfficeMode;

  // Real-time schedule merging automated timeline and verified user breaks
  const effectiveSchedule = {
    ...schedule,
    water: {
      ...schedule.water,
      passedScheduled: Math.min(schedule.water.totalScheduled, schedule.water.passedScheduled + extraCompleted.water),
      allSlots: schedule.water.allSlots.map((slot, idx) => ({
        ...slot,
        status: (idx < schedule.water.passedScheduled + extraCompleted.water ? 'done' : slot.status) as 'done' | 'active' | 'upcoming',
      })),
    },
    stand: {
      ...schedule.stand,
      passedScheduled: Math.min(schedule.stand.totalScheduled, schedule.stand.passedScheduled + extraCompleted.stand),
      allSlots: schedule.stand.allSlots.map((slot, idx) => ({
        ...slot,
        status: (idx < schedule.stand.passedScheduled + extraCompleted.stand ? 'done' : slot.status) as 'done' | 'active' | 'upcoming',
      })),
    },
    screen: {
      ...schedule.screen,
      passedScheduled: Math.min(schedule.screen.totalScheduled, schedule.screen.passedScheduled + extraCompleted.screen),
      allSlots: schedule.screen.allSlots.map((slot, idx) => ({
        ...slot,
        status: (idx < schedule.screen.passedScheduled + extraCompleted.screen ? 'done' : slot.status) as 'done' | 'active' | 'upcoming',
      })),
    },
  };

  // Real-time biometric metrics derived from effective schedule
  const scheduledWaterMl = effectiveSchedule.water.passedScheduled * 250;
  const scheduledStandBreaks = effectiveSchedule.stand.passedScheduled;
  const scheduledActiveMins = Math.round(effectiveSchedule.stand.passedScheduled * 2.5);
  const scheduledScreenRests = effectiveSchedule.screen.passedScheduled;
  const scheduledSittingMins = Math.max(0, effectiveSchedule.elapsedOfficeMinutes - scheduledActiveMins);

  // Main 1-second countdown clock for reminders & continuous sitting
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isOfficeHoursActive) return;

      // Handle continuous sitting counter
      sedentarySecCounterRef.current += 1;
      if (sedentarySecCounterRef.current >= 60) {
        sedentarySecCounterRef.current = 0;
        if (isCurrentlySitting) {
          setContinuousSittingMinutes((prev) => {
            const next = prev + 1;
            if (next === settings.goals.maxContinuousSedentaryMins) {
              triggerAlert('stand');
            }
            return next;
          });
        }
      }

      // Decrement individual timers
      setRemainingTimes((prev) => {
        const next = { ...prev };

        if (timerRunning.water) {
          if (next.water <= 1) {
            triggerAlert('water');
            next.water = settings.intervals.water * 60;
            recordScheduledSlot('water');
          } else {
            next.water -= 1;
          }
        }

        if (timerRunning.stand) {
          if (next.stand <= 1) {
            triggerAlert('stand');
            next.stand = settings.intervals.stand * 60;
            recordScheduledSlot('stand');
          } else {
            next.stand -= 1;
          }
        }

        if (timerRunning.screen) {
          if (next.screen <= 1) {
            triggerAlert('screen');
            next.screen = settings.intervals.screen * 60;
            recordScheduledSlot('screen');
          } else {
            next.screen -= 1;
          }
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOfficeHoursActive, timerRunning, settings, isCurrentlySitting]);

  // Automated recording when scheduled slot arrives (Zero manual entry permitted)
  const recordScheduledSlot = (type: ReminderType, customNote?: string) => {
    const amounts = {
      water: 250,
      stand: 2,
      screen: 20,
    };
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog: ActivityLog = {
      id: String(Date.now()),
      type,
      timestamp: now.toISOString(),
      value: amounts[type],
      note: customNote || `Automated scheduled interval (${timeFormatted} slot)`,
      source: 'auto_reminder',
    };

    setLogs((prev) => {
      const updated = [newLog, ...prev];
      saveStoredLogs(updated);
      return updated;
    });

    if (type === 'stand') {
      setContinuousSittingMinutes(0);
      setIsCurrentlySitting(false);
    }
  };

  // Called when user clicks to enter and completes break in the alert popup
  const handleConfirmBreak = (type: ReminderType) => {
    recordScheduledSlot(type);
    setExtraCompleted((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    setRemainingTimes((prev) => ({
      ...prev,
      [type]: settings.intervals[type] * 60,
    }));
    setActiveAlert(null);
    audioManager.playTone(settings.sound.chimeTone, settings.sound.volume);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // Trigger alert
  const triggerAlert = (type: ReminderType) => {
    setActiveAlert(type);

    if (settings.sound.soundEnabled) {
      audioManager.playTone(settings.sound.chimeTone, settings.sound.volume);
    }

    if (settings.sound.voiceAlertEnabled) {
      const messages = {
        water: 'Scheduled hydration time. Drink your scheduled glass of water.',
        stand: 'Scheduled stand break. Leave your chair and walk.',
        screen: '20-20-20 eye rest. Look 20 feet away for 20 seconds.',
      };
      audioManager.speak(messages[type]);
    }

    if (settings.sound.vibrationEnabled) {
      audioManager.vibrate([200, 100, 200, 100, 300]);
    }

    if (
      settings.sound.browserNotifications &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      const titles = {
        water: '💧 Scheduled Hydration (Office 9–6)',
        stand: '🚶 Scheduled Stand Break',
        screen: '👀 Scheduled 20-20-20 Eye Rest',
      };
      const bodies = {
        water: 'Take your scheduled glass of water to refresh your focus.',
        stand: 'Scheduled interval reached. Step away from your desk for 2 minutes.',
        screen: 'Gaze 20 feet away for 20 seconds to ease optical muscle fatigue.',
      };
      new Notification(titles[type], {
        body: bodies[type],
        icon: '/favicon.ico',
      });
    }
  };

  // Timer controls
  const handleToggleTimer = (type: ReminderType) => {
    setTimerRunning((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleResetTimer = (type: ReminderType) => {
    setRemainingTimes((prev) => ({
      ...prev,
      [type]: settings.intervals[type] * 60,
    }));
  };

  const handleSnooze = (type: ReminderType, minutes: number) => {
    setRemainingTimes((prev) => ({
      ...prev,
      [type]: minutes * 60,
    }));
    setActiveAlert(null);
  };

  // Posture mode toggle
  const handleToggleSittingState = () => {
    setIsCurrentlySitting((prev) => {
      const next = !prev;
      if (!next) {
        setContinuousSittingMinutes(0);
      }
      return next;
    });
  };

  // Save Settings
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    setRemainingTimes({
      water: newSettings.intervals.water * 60,
      stand: newSettings.intervals.stand * 60,
      screen: newSettings.intervals.screen * 60,
    });
    setSchedule(calculateWorkdaySchedule(newSettings, forceOfficeMode));
  };

  // Apply AI Wellness Coach suggested micro-adjustments
  const handleApplyAIAdjustments = (
    newGoals: UserSettings['goals'],
    newIntervals: UserSettings['intervals']
  ) => {
    const updatedSettings: UserSettings = {
      ...settings,
      goals: newGoals,
      intervals: newIntervals,
    };
    handleSaveSettings(updatedSettings);
  };

  // Calculate real-time health score strictly from scheduled metrics
  const currentHealthScore = calculateHealthScore(
    scheduledWaterMl,
    scheduledStandBreaks,
    scheduledScreenRests,
    scheduledSittingMins,
    settings.goals
  );

  // Smooth scroll helper for mobile navigation
  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Sticky Mobile-Optimized Clean White Header */}
      <Header
        settings={settings}
        streak={streak}
        isOfficeHours={officeStatus.isOfficeHours}
        officeHoursReason={officeStatus.reason}
        forceOfficeMode={forceOfficeMode}
        onToggleForceOfficeMode={() => setForceOfficeMode(!forceOfficeMode)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenCalendar={() => setShowCalendar(true)}
        onOpenReport={() => setShowReport(true)}
        onOpenLogs={() => setShowLogs(true)}
        isGoogleConnected={!!user}
      />

      {/* Main App Container (with mobile safe bottom padding so navigation never overlaps) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 pb-28 md:pb-8">
        
        {/* Off-hours banner */}
        {!isOfficeHoursActive && (
          <div className="p-3.5 sm:p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0"></span>
              <span>
                <strong>Off-Hours Standby:</strong> Workday schedule runs 9:00 AM – 6:00 PM.
              </span>
            </div>
            <button
              onClick={() => setForceOfficeMode(true)}
              className="py-1.5 px-3.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold self-start sm:self-auto transition-colors"
            >
              Test 9–6 Mode
            </button>
          </div>
        )}

        {/* 1. Primary Active Reminder Cards */}
        <section id="section-reminders" className="scroll-mt-20">
          <ActiveReminders
            settings={settings}
            remainingTimes={remainingTimes}
            schedule={{ water: effectiveSchedule.water, stand: effectiveSchedule.stand, screen: effectiveSchedule.screen }}
            onTriggerTestAlert={triggerAlert}
            onOpenBreathingSession={() => setShowBreathingModal(true)}
          />
        </section>

        {/* Guided Breathing Quick Session Banner */}
        <div className="bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200/80 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <span className="text-lg">🧘</span>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                2-Minute Guided Breathing
              </h4>
              <p className="text-xs text-slate-500">
                Soothe eye strain and restore mental focus
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBreathingModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all active:scale-98 self-start sm:self-auto flex-shrink-0"
          >
            Start Breathing
          </button>
        </div>

        {/* 2. Sedentary Desk Chair Time Monitor */}
        <section id="section-sedentary" className="scroll-mt-20">
          <SedentaryTracker
            continuousSittingMinutes={continuousSittingMinutes}
            totalSittingMinutesToday={scheduledSittingMins}
            totalActiveMinutesToday={scheduledActiveMins}
            isCurrentlySitting={isCurrentlySitting}
            onToggleSittingState={handleToggleSittingState}
            maxContinuousSedentaryMins={settings.goals.maxContinuousSedentaryMins}
          />
        </section>

        {/* 3. AI Wellness Coach (Gemini API) */}
        <section id="section-ai-coach" className="scroll-mt-20">
          <AICoachCard
            settings={settings}
            logs={logs}
            todayWaterMl={scheduledWaterMl}
            todayStandBreaks={scheduledStandBreaks}
            todayActiveMins={scheduledActiveMins}
            todayScreenRests={scheduledScreenRests}
            totalSittingMins={scheduledSittingMins}
            continuousSittingMins={continuousSittingMinutes}
            healthScore={currentHealthScore}
            currentStreak={streak.currentStreak}
            onApplyAdjustments={handleApplyAIAdjustments}
          />
        </section>

        {/* 4. Strictly Calculated Scheduled Progress & Goals (No manual entry) */}
        <section id="section-stats" className="scroll-mt-20">
          <DailyStats
            waterMl={scheduledWaterMl}
            standBreaks={scheduledStandBreaks}
            standMinutes={scheduledActiveMins}
            screenRests={scheduledScreenRests}
            sedentaryMinutes={scheduledSittingMins}
            goals={settings.goals}
            healthScore={currentHealthScore}
            schedule={effectiveSchedule}
            onOpenGoalSettings={() => setShowSettings(true)}
          />
        </section>

        {/* 5. Daily Streak Tracker (0 Today, 1 Tomorrow) */}
        <section id="section-streak" className="scroll-mt-20">
          <StreakCard
            streak={streak}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            ErgoFlow • Automated Sedentary Prevention & Workday Activity Companion (9:00 AM – 6:00 PM)
          </p>
          <div className="flex items-center gap-4 text-slate-500 font-semibold">
            <button onClick={() => setShowCalendar(true)} className="hover:text-blue-600 transition-colors">
              Calendar Sync
            </button>
            <span>•</span>
            <button onClick={() => setShowReport(true)} className="hover:text-emerald-600 transition-colors">
              Weekly PDF Report
            </button>
            <span>•</span>
            <button onClick={() => setShowSettings(true)} className="hover:text-slate-800 transition-colors">
              Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (< md screens) */}
      <MobileBottomNav
        onOpenBreathing={() => setShowBreathingModal(true)}
        onOpenCalendar={() => setShowCalendar(true)}
        onOpenReport={() => setShowReport(true)}
        onOpenLogs={() => setShowLogs(true)}
        onScrollToSection={handleScrollToSection}
      />

      {/* Prominent Reminder Alert Popup */}
      <ReminderAlertModal
        type={activeAlert}
        onConfirmBreak={handleConfirmBreak}
        onDismiss={() => setActiveAlert(null)}
      />

      {/* Customization Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Google Calendar Sync & .ics Export Modal */}
      <CalendarSyncModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        settings={settings}
        user={user}
        onAuthChange={setUser}
      />

      {/* Weekly Report & PDF Export Modal */}
      <WeeklyReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        weeklyData={dailyRecords}
        settings={settings}
        streak={streak}
      />

      {/* Activity Logs Timeline Modal */}
      <ActivityLogModal
        isOpen={showLogs}
        onClose={() => setShowLogs(false)}
        logs={logs}
        onClearLogs={() => {
          setLogs([]);
          saveStoredLogs([]);
        }}
        onOpenBreathingSession={() => setShowBreathingModal(true)}
      />

      {/* 2-Minute Guided Breathing Session Modal */}
      <GuidedBreathingModal
        isOpen={showBreathingModal}
        onClose={() => setShowBreathingModal(false)}
        onComplete={() => {
          recordScheduledSlot('screen', 'Completed 2-minute Guided Breathing session');
          setShowBreathingModal(false);
        }}
        soundEnabled={settings.sound.soundEnabled}
      />

    </div>
  );
}
