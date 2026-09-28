import React, { useState } from 'react';
import { 
  History, 
  X, 
  Droplet, 
  Footprints, 
  Eye, 
  Armchair, 
  Download, 
  Trash2, 
  Lock, 
  Wind,
  CalendarCheck2 
} from 'lucide-react';
import { ActivityLog, ReminderType } from '../types';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
  onClearLogs: () => void;
  onOpenBreathingSession: () => void;
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  onOpenBreathingSession,
}) => {
  const [filter, setFilter] = useState<'all' | 'water' | 'stand' | 'screen'>('all');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  const exportCsv = () => {
    const headers = 'ID,Type,Timestamp,Amount,Note,Source\n';
    const rows = logs
      .map(
        (l) =>
          `"${l.id}","${l.type}","${l.timestamp}","${l.value}","${(l.note || '').replace(/"/g, '""')}","${l.source}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ergoflow-activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLogMeta = (log: ActivityLog) => {
    switch (log.type) {
      case 'water':
        return {
          icon: <Droplet className="w-4 h-4 text-blue-600 fill-blue-600/20" />,
          title: `Hydration (${log.value} ml)`,
          color: 'text-blue-700',
          bg: 'bg-blue-50 border-blue-200',
        };
      case 'stand':
        return {
          icon: <Footprints className="w-4 h-4 text-emerald-600" />,
          title: `Stand & Walk Break (${log.value} min)`,
          color: 'text-emerald-700',
          bg: 'bg-emerald-50 border-emerald-200',
        };
      case 'screen':
        return {
          icon: log.note?.includes('Breathing') ? (
            <Wind className="w-4 h-4 text-teal-600" />
          ) : (
            <Eye className="w-4 h-4 text-indigo-600" />
          ),
          title: log.note?.includes('Breathing') ? `Guided Breathing (2 min)` : `20-20-20 Eye Rest (${log.value}s)`,
          color: 'text-indigo-700',
          bg: 'bg-indigo-50 border-indigo-200',
        };
      default:
        return {
          icon: <Armchair className="w-4 h-4 text-orange-500" />,
          title: `Sedentary Reset`,
          color: 'text-orange-700',
          bg: 'bg-orange-50 border-orange-200',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl text-slate-900 space-y-4 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs flex-shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-slate-900">Workday Activity Logs</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Automated verification strictly based on 9:00 AM – 6:00 PM scheduled times
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification & Anti-Manual Integrity Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl sm:rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
          <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11px] sm:text-xs">
            <strong className="text-slate-800">Strict Schedule Lock Active:</strong> Manual logging (+1) is disabled. Breaks are calculated and verified exclusively when the scheduled time slot arrives during office hours (9:00 AM – 6:00 PM).
          </div>
        </div>

        {/* Toolbar: Filters & Export */}
        <div className="flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl sm:rounded-2xl overflow-x-auto max-w-full">
            {(['all', 'water', 'stand', 'screen'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`py-1 px-2.5 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  filter === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? 'All Activities' : t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenBreathingSession();
              }}
              className="py-1 px-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-bold flex items-center gap-1.5 hover:bg-teal-100 transition-colors"
            >
              <Wind className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Start Guided Breathing</span>
              <span className="sm:hidden">Breathing</span>
            </button>

            <button
              onClick={exportCsv}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              title="Export as CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline Log List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-slate-100 rounded-2xl bg-slate-50">
              No logs recorded for this category yet.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const meta = getLogMeta(log);
              const dateObj = new Date(log.timestamp);
              const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateFormatted = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div
                  key={log.id}
                  className="p-2.5 sm:p-3 bg-slate-50/70 hover:bg-slate-100/80 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center justify-between gap-2.5 transition-colors"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${meta.bg}`}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">{meta.title}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-emerald-700 font-bold flex items-center gap-0.5">
                          <CalendarCheck2 className="w-2.5 h-2.5" />
                          <span>Scheduled Slot</span>
                        </span>
                      </div>
                      {log.note && (
                        <p className="text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">{log.note}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 text-slate-500 font-mono text-[10px] sm:text-[11px]">
                    <div className="font-bold text-slate-700">{timeFormatted}</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400">{dateFormatted}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 flex-shrink-0">
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Total Activities Logged: <strong>{logs.length}</strong>
          </span>
          <button
            onClick={onClearLogs}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

      </div>
    </div>
  );
};
