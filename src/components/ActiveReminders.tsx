import React, { useState } from 'react';
import { 
  Droplet, 
  Footprints, 
  Eye, 
  Volume2, 
  Clock, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Wind
} from 'lucide-react';
import { ReminderType, UserSettings } from '../types';
import { IntervalScheduleInfo } from '../utils/storage';

interface ReminderCardProps {
  type: ReminderType;
  title: string;
  intervalMinutes: number;
  remainingSeconds: number;
  scheduleInfo: IntervalScheduleInfo;
  onTriggerTestAlert: (type: ReminderType) => void;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconBg: string;
  strokeColor: string;
  icon: React.ReactNode;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  type,
  title,
  intervalMinutes,
  remainingSeconds,
  scheduleInfo,
  onTriggerTestAlert,
  badgeBg,
  badgeText,
  badgeBorder,
  iconBg,
  strokeColor,
  icon,
  secondaryAction,
}) => {
  const [showSlots, setShowSlots] = useState(false);

  const totalSeconds = intervalMinutes * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100));

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      
      {/* Top row */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${iconBg} shadow-xs flex-shrink-0`}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">{title}</h3>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${badgeBg} ${badgeText} border ${badgeBorder}`}>
                  {intervalMinutes}m
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Next: <strong className="text-slate-800 font-mono">{scheduleInfo.nextSlotTime}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => onTriggerTestAlert(type)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Test chime"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Big Clean Countdown Ring */}
        <div className="my-6 flex items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="7"
                className="text-slate-100"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`${strokeColor} transition-all duration-1000 ease-linear`}
                fill="transparent"
              />
            </svg>

            {/* Large Bold Numbers */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 leading-none">
                {timeFormatted}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                Countdown
              </span>
            </div>
          </div>
        </div>

        {/* Large Stats Display */}
        <div className="flex items-center justify-between py-2 border-t border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Completed Today
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                {scheduleInfo.passedScheduled}
              </span>
              <span className="text-sm font-bold text-slate-400 font-mono">
                / {scheduleInfo.totalScheduled}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowSlots(!showSlots)}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 py-1 px-2.5 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <span>{showSlots ? 'Hide' : 'Slots'}</span>
            {showSlots ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Slots Tray */}
        {showSlots && (
          <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 max-h-40 overflow-y-auto space-y-1.5 animate-in fade-in">
            <div className="grid grid-cols-2 gap-1.5">
              {scheduleInfo.allSlots.map((slot) => {
                const isDone = slot.status === 'done';
                const isActive = slot.status === 'active';

                return (
                  <div
                    key={slot.index}
                    className={`px-2 py-1.5 rounded-xl border text-[11px] font-mono flex items-center justify-between ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                        : isActive
                        ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>{slot.timeFormatted}</span>
                    {isDone ? (
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    ) : (
                      <span className="text-[9px] uppercase font-bold text-slate-400">
                        {isActive ? 'Next' : '—'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Secondary Action (Breathing button for screen) */}
      {secondaryAction && (
        <button
          onClick={secondaryAction.onClick}
          className="mt-4 w-full py-2.5 px-3 rounded-2xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Wind className="w-3.5 h-3.5 text-teal-600" />
          <span>{secondaryAction.label}</span>
        </button>
      )}

    </div>
  );
};

interface ActiveRemindersProps {
  settings: UserSettings;
  remainingTimes: {
    water: number;
    stand: number;
    screen: number;
  };
  schedule: {
    water: IntervalScheduleInfo;
    stand: IntervalScheduleInfo;
    screen: IntervalScheduleInfo;
  };
  onTriggerTestAlert: (type: ReminderType) => void;
  onOpenBreathingSession: () => void;
}

export const ActiveReminders: React.FC<ActiveRemindersProps> = ({
  settings,
  remainingTimes,
  schedule,
  onTriggerTestAlert,
  onOpenBreathingSession,
}) => {
  return (
    <div className="space-y-4">
      
      {/* Clean, Simple Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Automated 9:00 AM – 6:00 PM Workday Breaks
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          Default Active
        </span>
      </div>

      {/* 3 Large, Clean Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Card 1: Water */}
        <ReminderCard
          type="water"
          title="Hydration"
          intervalMinutes={settings.intervals.water}
          remainingSeconds={remainingTimes.water}
          scheduleInfo={schedule.water}
          onTriggerTestAlert={onTriggerTestAlert}
          badgeBg="bg-blue-50"
          badgeText="text-blue-700"
          badgeBorder="border-blue-200"
          iconBg="bg-blue-50"
          strokeColor="text-blue-600"
          icon={<Droplet className="w-6 h-6 text-blue-600 fill-blue-600/30" />}
        />

        {/* Card 2: Stand & Walk */}
        <ReminderCard
          type="stand"
          title="Stand & Walk"
          intervalMinutes={settings.intervals.stand}
          remainingSeconds={remainingTimes.stand}
          scheduleInfo={schedule.stand}
          onTriggerTestAlert={onTriggerTestAlert}
          badgeBg="bg-emerald-50"
          badgeText="text-emerald-700"
          badgeBorder="border-emerald-200"
          iconBg="bg-emerald-50"
          strokeColor="text-emerald-600"
          icon={<Footprints className="w-6 h-6 text-emerald-600" />}
        />

        {/* Card 3: Screen 20-20-20 */}
        <ReminderCard
          type="screen"
          title="Eye Rest"
          intervalMinutes={settings.intervals.screen}
          remainingSeconds={remainingTimes.screen}
          scheduleInfo={schedule.screen}
          onTriggerTestAlert={onTriggerTestAlert}
          badgeBg="bg-indigo-50"
          badgeText="text-indigo-700"
          badgeBorder="border-indigo-200"
          iconBg="bg-indigo-50"
          strokeColor="text-indigo-600"
          icon={<Eye className="w-6 h-6 text-indigo-600" />}
          secondaryAction={{
            label: '2-Minute Guided Breathing',
            onClick: onOpenBreathingSession,
          }}
        />

      </div>

    </div>
  );
};
