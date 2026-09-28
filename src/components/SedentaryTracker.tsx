import React from 'react';
import { 
  Armchair, 
  Activity, 
  Sparkles
} from 'lucide-react';

interface SedentaryTrackerProps {
  continuousSittingMinutes: number;
  totalSittingMinutesToday: number;
  totalActiveMinutesToday: number;
  isCurrentlySitting: boolean;
  onToggleSittingState: () => void;
  maxContinuousSedentaryMins: number;
}

export const SedentaryTracker: React.FC<SedentaryTrackerProps> = ({
  continuousSittingMinutes,
  totalSittingMinutesToday,
  totalActiveMinutesToday,
  isCurrentlySitting,
  onToggleSittingState,
  maxContinuousSedentaryMins,
}) => {
  const riskPercentage = Math.min(100, (continuousSittingMinutes / maxContinuousSedentaryMins) * 100);
  
  let riskStatus = {
    label: 'Normal',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    barColor: 'bg-emerald-500',
  };

  if (continuousSittingMinutes >= maxContinuousSedentaryMins) {
    riskStatus = {
      label: 'Chair Limit Reached',
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      barColor: 'bg-rose-500',
    };
  } else if (continuousSittingMinutes >= maxContinuousSedentaryMins * 0.7) {
    riskStatus = {
      label: 'Approaching Limit',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      barColor: 'bg-amber-500',
    };
  }

  const sittingHours = (totalSittingMinutesToday / 60).toFixed(1);
  const activeMinutes = totalActiveMinutesToday;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left: Big Sitting Meter */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs flex-shrink-0">
                <Armchair className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Chair Sitting Meter
                  </h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${riskStatus.bg} ${riskStatus.color} ${riskStatus.border}`}>
                    {riskStatus.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Threshold: {maxContinuousSedentaryMins}m max continuous sitting
                </p>
              </div>
            </div>

            {/* Time Seated */}
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 leading-none">
                {continuousSittingMinutes}m
              </span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                {isCurrentlySitting ? 'Seated Now' : 'Standing'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${riskStatus.barColor}`}
                style={{ width: `${riskPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-semibold font-mono">
              <span>0m</span>
              <span>{Math.round(maxContinuousSedentaryMins * 0.7)}m</span>
              <span className="text-rose-600 font-bold">{maxContinuousSedentaryMins}m Max</span>
            </div>
          </div>
        </div>

        {/* Right: Daily Totals & Simple Toggle */}
        <div className="lg:w-80 flex flex-col justify-between gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Today Seated</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">{sittingHours} hrs</span>
            </div>
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100">
              <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">Active Walk</span>
              <span className="text-2xl font-black text-emerald-700 font-mono mt-0.5 block">{activeMinutes} mins</span>
            </div>
          </div>

          <button
            onClick={onToggleSittingState}
            className={`w-full py-3 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98 ${
              isCurrentlySitting
                ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
            }`}
          >
            <span>{isCurrentlySitting ? 'Switch to Standing Mode' : 'Switch to Desk Chair Mode'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
