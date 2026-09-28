import React from 'react';
import { 
  Flame, 
  Check, 
  Award, 
  Lock 
} from 'lucide-react';
import { StreakInfo } from '../types';

interface StreakCardProps {
  streak: StreakInfo;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  streak,
}) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = daysOfWeek[d.getDay()];
    const isToday = i === 6;
    const isDone = Boolean(streak.history[dateStr]);

    return {
      date: dateStr,
      dayName,
      isToday,
      isDone,
    };
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Streak Main Indicator */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-xs flex-shrink-0">
            <Flame className="w-8 h-8 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {streak.currentStreak} Day Streak
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200">
                {streak.currentStreak === 0 ? 'Day 0 Today' : `Day ${streak.currentStreak}`}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Daily login streak • Advances to 1 tomorrow upon return
            </p>
          </div>
        </div>

        <div className="self-start sm:self-auto px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
          <span>Today Verified</span>
        </div>

      </div>

      {/* 7-Day Visual Tracker */}
      <div className="grid grid-cols-7 gap-2">
        {recentDays.map((d, index) => (
          <div 
            key={index}
            className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl border text-center transition-all ${
              d.isToday
                ? 'bg-orange-50 border-orange-200 text-orange-800 shadow-xs font-bold'
                : d.isDone
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider mb-1">
              {d.dayName}
            </span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              d.isToday 
                ? 'bg-orange-500 text-white' 
                : d.isDone 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-200 text-slate-500'
            }`}>
              {d.isToday ? '0' : d.isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '—'}
            </div>
            <span className="text-[10px] mt-1 font-semibold">
              {d.isToday ? 'Today' : d.isDone ? 'Done' : '—'}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};
