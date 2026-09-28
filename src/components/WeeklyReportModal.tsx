import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  X, 
  Award, 
  Droplet, 
  Footprints, 
  Eye, 
  Sparkles 
} from 'lucide-react';
import { DaySummary, UserSettings, StreakInfo } from '../types';
import { generateWeeklyHealthPdf } from '../utils/pdfGenerator';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyData: DaySummary[];
  settings: UserSettings;
  streak: StreakInfo;
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({
  isOpen,
  onClose,
  weeklyData,
  settings,
  streak,
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const totalWater = weeklyData.reduce((acc, d) => acc + d.waterMl, 0);
  const totalStandBreaks = weeklyData.reduce((acc, d) => acc + d.standBreaks, 0);
  const totalStandMins = weeklyData.reduce((acc, d) => acc + d.standMinutes, 0);
  const totalScreenRests = weeklyData.reduce((acc, d) => acc + d.screenRests, 0);
  const avgHealthScore = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((acc, d) => acc + d.healthScore, 0) / weeklyData.length)
    : 85;

  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      generateWeeklyHealthPdf(weeklyData, settings, streak);
    } catch (e) {
      console.error('PDF error:', e);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl text-slate-900 space-y-5 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Weekly Health & Sedentary Report</h2>
              <p className="text-xs text-slate-500">
                Official occupational ergonomics summary for office hours (9:00 AM – 6:00 PM)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          
          {/* Executive KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between text-xs text-teal-700 mb-1">
                <span className="font-semibold">Avg Health Score</span>
                <Award className="w-3.5 h-3.5" />
              </div>
              <span className="text-2xl font-black text-slate-900">{avgHealthScore}</span>
              <span className="text-xs text-slate-500 block mt-0.5">/ 100 Optimal</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
                <span className="font-semibold">Total Water</span>
                <Droplet className="w-3.5 h-3.5" />
              </div>
              <span className="text-2xl font-black text-slate-900">{(totalWater / 1000).toFixed(1)} L</span>
              <span className="text-xs text-slate-500 block mt-0.5">~{Math.round(totalWater / 250)} glasses</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
                <span className="font-semibold">Stand Breaks</span>
                <Footprints className="w-3.5 h-3.5" />
              </div>
              <span className="text-2xl font-black text-slate-900">{totalStandBreaks}</span>
              <span className="text-xs text-slate-500 block mt-0.5">{totalStandMins} active mins</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between text-xs text-indigo-700 mb-1">
                <span className="font-semibold">20-20-20 Rests</span>
                <Eye className="w-3.5 h-3.5" />
              </div>
              <span className="text-2xl font-black text-slate-900">{totalScreenRests}</span>
              <span className="text-xs text-slate-500 block mt-0.5">Eye relief count</span>
            </div>

          </div>

          {/* 7-Day Performance Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              7-Day Performance Log
            </span>

            <div className="overflow-x-auto border border-slate-200/90 rounded-2xl shadow-xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Water (ml)</th>
                    <th className="py-2.5 px-3">Stand Breaks</th>
                    <th className="py-2.5 px-3">Walk Time</th>
                    <th className="py-2.5 px-3">Eye Rests</th>
                    <th className="py-2.5 px-3">Desk Sitting</th>
                    <th className="py-2.5 px-3">Health Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {weeklyData.map((day, idx) => {
                    const dName = new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{dName}</td>
                        <td className="py-2.5 px-3 text-blue-700 font-medium">{day.waterMl} ml</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-medium">{day.standBreaks} breaks</td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">{day.standMinutes} mins</td>
                        <td className="py-2.5 px-3 text-indigo-700 font-medium">{day.screenRests} times</td>
                        <td className="py-2.5 px-3 text-orange-700 font-medium">{(day.sedentaryMinutes / 60).toFixed(1)} hrs</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {day.healthScore}/100
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ergonomic & Sedentary Insights */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Doctor & Ergonomic Impact Summary
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              By standing and walking every 45 minutes during 9:00 AM – 6:00 PM, you interrupted prolonged static muscle tension, lowered postural load on L4/L5 lumbar intervertebral discs, and stimulated peripheral leg circulation.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 flex-shrink-0">
          <div className="text-xs text-slate-500">
            Formatted for standard A4 PDF printout with vector typography & charts
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-xs transition-all active:scale-98 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Generating PDF...' : 'Download Weekly PDF Report'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
