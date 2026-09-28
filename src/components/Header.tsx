import React from 'react';
import { 
  Flame, 
  Calendar, 
  FileText, 
  Settings, 
  History, 
  Clock 
} from 'lucide-react';
import { UserSettings, StreakInfo } from '../types';

interface HeaderProps {
  settings: UserSettings;
  streak: StreakInfo;
  isOfficeHours: boolean;
  officeHoursReason: string;
  forceOfficeMode: boolean;
  onToggleForceOfficeMode: () => void;
  onOpenSettings: () => void;
  onOpenCalendar: () => void;
  onOpenReport: () => void;
  onOpenLogs: () => void;
  isGoogleConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  streak,
  isOfficeHours,
  officeHoursReason,
  forceOfficeMode,
  onToggleForceOfficeMode,
  onOpenSettings,
  onOpenCalendar,
  onOpenReport,
  onOpenLogs,
  isGoogleConnected,
}) => {
  const activeStatus = isOfficeHours || forceOfficeMode;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo, Brand & Perfectly Aligned Nearby Time */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 shadow-sm flex-shrink-0">
              <div className="w-full h-full bg-white rounded-[13px] sm:rounded-[14px] flex items-center justify-center">
                <span className="text-lg sm:text-2xl font-black bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  E
                </span>
              </div>
            </div>

            {/* ErgoFlow Title + Perfectly Aligned Nearby Office Timing */}
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                  ErgoFlow
                </h1>
                
                {/* Desktop-only badge */}
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                  <Clock className="w-3 h-3" />
                  <span>9:00 AM – 6:00 PM</span>
                </span>
              </div>

              {/* Mobile & Tablet: Perfectly aligned live timing indicator right beneath/beside ErgoFlow */}
              <div className="flex items-center gap-1.5 mt-1 sm:mt-0.5 text-[11px] sm:text-xs">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  {activeStatus && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${activeStatus ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </span>
                
                <span className={`font-semibold truncate ${activeStatus ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {activeStatus ? '9:00 AM – 6:00 PM Active' : 'Off-Hours Standby'}
                </span>

                {!isOfficeHours && (
                  <button
                    onClick={onToggleForceOfficeMode}
                    className="ml-0.5 text-[10px] font-bold underline text-amber-800 hover:text-amber-950 transition-colors"
                  >
                    {forceOfficeMode ? 'Exit' : 'Test'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Streak & Nav Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            
            {/* Streak Counter Pill */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-black shadow-xs">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 fill-orange-500 flex-shrink-0" />
              <span>{streak.currentStreak}d</span>
              <span className="hidden sm:inline font-bold">Streak</span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={onOpenCalendar}
                className={`px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isGoogleConnected
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Calendar</span>
              </button>

              <button
                onClick={onOpenReport}
                className="px-3 py-2 rounded-2xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 transition-all shadow-xs"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>PDF Report</span>
              </button>

              <button
                onClick={onOpenLogs}
                className="px-3 py-2 rounded-2xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition-all"
              >
                <History className="w-4 h-4 text-slate-600" />
                <span>Logs</span>
              </button>
            </div>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 sm:p-2.5 rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
              title="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
