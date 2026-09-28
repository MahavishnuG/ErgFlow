import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  X, 
  Check, 
  Download, 
  Clock, 
  Plus, 
  RefreshCw, 
  LogOut, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleCalendarEvent, UserSettings } from '../types';
import { 
  googleSignIn, 
  logout, 
  fetchTodayCalendarEvents, 
  addHealthBreakEventToCalendar 
} from '../services/firebaseAuth';
import { generateIcsCalendar } from '../utils/calendarExport';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  user: User | null;
  onAuthChange: (user: User | null) => void;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  settings,
  user,
  onAuthChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCalendarEvents();
    }
  }, [isOpen, user]);

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchTodayCalendarEvents();
      setEvents(data);
    } catch {
      // Handled gracefully in service
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const res = await googleSignIn();
      onAuthChange(res.user);
      setSuccessMsg('Google Calendar connected');
      await loadCalendarEvents();
    } catch {
      // Gracefully handled
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onAuthChange(null);
      setEvents([]);
      setSuccessMsg(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadIcs = () => {
    const icsData = generateIcsCalendar(settings);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ergoflow-workday-schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMsg('Downloaded .ics schedule for Google Calendar');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Google Calendar</h2>
              <p className="text-xs text-slate-500">9:00 AM – 6:00 PM Workday Schedule Sync</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 font-bold hover:underline text-[11px]">
              Dismiss
            </button>
          </div>
        )}

        {/* Account Status Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Google Account
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-2.5 h-2.5 rounded-full ${user ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className="text-sm font-bold text-slate-900">
                {user ? (user.displayName || user.email) : 'Not Connected'}
              </span>
            </div>
          </div>

          <div>
            {user ? (
              <button
                onClick={handleSignOut}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-98 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
                <span>Connect Google Calendar</span>
              </button>
            )}
          </div>
        </div>

        {/* 1-Click Universal .ICS Download */}
        <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-blue-950">Add Schedule to Google Calendar (.ics)</h4>
            <p className="text-[11px] text-blue-800 mt-0.5">Download and open in Google Calendar with one click</p>
          </div>
          <button
            onClick={handleDownloadIcs}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs flex-shrink-0 transition-all active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .ics</span>
          </button>
        </div>

        {/* Scheduled Calendar Events List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Today's Workday Schedule</span>
            <span className="text-slate-400 font-normal">9:00 AM – 6:00 PM</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2 text-xs"
              >
                <span className="font-semibold text-slate-800 truncate">{evt.summary}</span>
                <span className="text-[11px] text-slate-500 font-mono flex-shrink-0">
                  {evt.start?.dateTime
                    ? new Date(evt.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
