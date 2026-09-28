import React from 'react';
import { 
  Droplet, 
  Footprints, 
  Eye, 
  Award, 
  Clock, 
  Target,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Cell 
} from 'recharts';
import { UserGoals } from '../types';
import { WorkdayScheduleSummary } from '../utils/storage';

interface DailyStatsProps {
  waterMl: number;
  standBreaks: number;
  standMinutes: number;
  screenRests: number;
  sedentaryMinutes: number;
  goals: UserGoals;
  healthScore: number;
  schedule: WorkdayScheduleSummary;
  onOpenGoalSettings: () => void;
}

// Custom clean white tooltip matching Google Stitch theme
const CustomWaterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xl text-xs space-y-1">
        <div className="font-bold text-slate-900 flex items-center gap-1.5">
          <Droplet className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
          <span>Slot #{data.index}: {data.time}</span>
        </div>
        <div className="text-slate-600 font-mono">
          Intake: <strong className="text-blue-700">{data.intake} ml</strong>
        </div>
        <div className="text-[10px] text-slate-400">
          Status: <strong className={data.isDone ? 'text-emerald-600' : 'text-slate-500'}>
            {data.isDone ? 'Completed' : 'Upcoming'}
          </strong>
        </div>
      </div>
    );
  }
  return null;
};

export const DailyStats: React.FC<DailyStatsProps> = ({
  waterMl,
  standBreaks,
  standMinutes,
  screenRests,
  sedentaryMinutes,
  goals,
  healthScore,
  schedule,
  onOpenGoalSettings,
}) => {
  const waterPct = Math.min(100, Math.round((schedule.water.passedScheduled / Math.max(1, schedule.water.totalScheduled)) * 100));
  const standPct = Math.min(100, Math.round((schedule.stand.passedScheduled / Math.max(1, schedule.stand.totalScheduled)) * 100));
  const screenPct = Math.min(100, Math.round((schedule.screen.passedScheduled / Math.max(1, schedule.screen.totalScheduled)) * 100));

  const currentWaterMl = schedule.water.passedScheduled * 250;
  const goalWaterMl = goals.waterMl || 2500;
  const goalPct = Math.min(100, Math.round((currentWaterMl / goalWaterMl) * 100));

  // Build chart dataset for scheduled breaks across the 9:00 AM – 6:00 PM workday
  const chartData = schedule.water.allSlots.map((slot) => {
    const isDone = slot.status === 'done';
    return {
      index: slot.index,
      time: slot.timeFormatted.replace(' ', ''),
      intake: isDone ? 250 : 0,
      cumulative: slot.index * 250,
      isDone,
      status: slot.status,
    };
  });

  return (
    <section className="space-y-4">
      
      {/* Clean Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Daily Progress
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Office Workday 9:00 AM – 6:00 PM
          </p>
        </div>

        <button
          onClick={onOpenGoalSettings}
          className="text-xs text-blue-600 hover:text-blue-700 font-bold py-1 px-3 rounded-xl hover:bg-blue-50 transition-colors"
        >
          Timing Settings
        </button>
      </div>

      {/* 4 Large Clean Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        
        {/* Card 1: Hydration */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <Droplet className="w-4 h-4 fill-blue-600 text-blue-600" />
                Water
              </span>
              <span className="text-xs font-black text-slate-400 font-mono">{waterPct}%</span>
            </div>

            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                {schedule.water.passedScheduled}
              </span>
              <span className="text-sm font-bold text-slate-400 font-mono">
                / {schedule.water.totalScheduled}
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${waterPct}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Next:</span>
            <span className="font-bold text-slate-800 font-mono">{schedule.water.nextSlotTime}</span>
          </div>
        </div>

        {/* Card 2: Stand */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-emerald-600" />
                Stand & Walk
              </span>
              <span className="text-xs font-black text-slate-400 font-mono">{standPct}%</span>
            </div>

            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                {schedule.stand.passedScheduled}
              </span>
              <span className="text-sm font-bold text-slate-400 font-mono">
                / {schedule.stand.totalScheduled}
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${standPct}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Next:</span>
            <span className="font-bold text-slate-800 font-mono">{schedule.stand.nextSlotTime}</span>
          </div>
        </div>

        {/* Card 3: Eye Rest */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-600" />
                Eye Rest
              </span>
              <span className="text-xs font-black text-slate-400 font-mono">{screenPct}%</span>
            </div>

            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                {schedule.screen.passedScheduled}
              </span>
              <span className="text-sm font-bold text-slate-400 font-mono">
                / {schedule.screen.totalScheduled}
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${screenPct}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Next:</span>
            <span className="font-bold text-slate-800 font-mono">{schedule.screen.nextSlotTime}</span>
          </div>
        </div>

        {/* Card 4: Health Score */}
        <div className="bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Health Score
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {healthScore >= 80 ? 'Optimal' : 'Active'}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                {healthScore}
              </span>
              <span className="text-sm font-bold text-slate-400 font-mono">
                / 100
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800 font-bold">
            <span>Workday Compliance</span>
            <span>{healthScore >= 75 ? 'On Track' : 'In Progress'}</span>
          </div>
        </div>

      </div>

      {/* RECHARTS: Water Intake Progress vs Daily Goal Bar Chart */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4">
        
        {/* Bar Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs flex-shrink-0">
              <Droplet className="w-5 h-5 fill-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Water Intake vs Daily Goal
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {goalPct}% of Goal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {currentWaterMl} ml reached of {goalWaterMl} ml target ({schedule.water.passedScheduled} of {schedule.water.totalScheduled} breaks)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold self-start sm:self-auto">
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-3 h-3 rounded-md bg-blue-600" />
              <span>Completed Break</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-3 rounded-md bg-slate-200" />
              <span>Scheduled Slot</span>
            </span>
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="w-full h-48 sm:h-56 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                axisLine={{ stroke: '#f1f5f9' }}
                tickLine={false}
                interval={0}
              />
              <YAxis 
                domain={[0, 300]}
                ticks={[0, 100, 200, 250]}
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomWaterTooltip />} />
              <ReferenceLine y={250} stroke="#cbd5e1" strokeDasharray="3 3" />
              <Bar 
                dataKey="intake" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={32}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isDone ? '#2563eb' : '#e2e8f0'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </section>
  );
};
