import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  Droplet, 
  Footprints, 
  Eye, 
  Armchair, 
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AICoachAdvice, UserSettings, ActivityLog } from '../types';

interface AICoachCardProps {
  settings: UserSettings;
  logs: ActivityLog[];
  todayWaterMl: number;
  todayStandBreaks: number;
  todayActiveMins: number;
  todayScreenRests: number;
  totalSittingMins: number;
  continuousSittingMins: number;
  healthScore: number;
  currentStreak: number;
  onApplyAdjustments: (newGoals: UserSettings['goals'], newIntervals: UserSettings['intervals']) => void;
}

export const AICoachCard: React.FC<AICoachCardProps> = ({
  settings,
  logs,
  todayWaterMl,
  todayStandBreaks,
  todayActiveMins,
  todayScreenRests,
  totalSittingMins,
  continuousSittingMins,
  healthScore,
  currentStreak,
  onApplyAdjustments,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advice, setAdvice] = useState<AICoachAdvice | null>(() => {
    try {
      const saved = localStorage.getItem('ergoflow_ai_advice_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [applied, setApplied] = useState(false);

  const fetchAICoachAdvice = async () => {
    try {
      setLoading(true);
      setError(null);
      setApplied(false);

      const payload = {
        activityLogs: logs.slice(0, 15),
        currentGoals: settings.goals,
        currentStats: {
          todayWaterMl,
          todayStandBreaks,
          todayActiveMins,
          todayScreenRests,
          totalSittingMins,
          continuousSittingMins,
          healthScore,
          currentStreak,
        },
      };

      const res = await fetch('/api/ai-wellness-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('AI analysis service temporarily unavailable');
      }

      const data: AICoachAdvice = await res.json();
      data.generatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAdvice(data);
      localStorage.setItem('ergoflow_ai_advice_v1', JSON.stringify(data));
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      setError('Unable to analyze right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!advice) return;

    const newGoals: UserSettings['goals'] = {
      waterMl: advice.suggestedAdjustments.recommendedWaterMl,
      standBreaks: advice.suggestedAdjustments.recommendedStandBreaks,
      standMinutes: Math.round(advice.suggestedAdjustments.recommendedStandBreaks * 3),
      screenRests: advice.suggestedAdjustments.recommendedScreenRests,
      maxContinuousSedentaryMins: advice.suggestedAdjustments.recommendedMaxContinuousSedentaryMins,
    };

    const newIntervals: UserSettings['intervals'] = {
      water: advice.recommendedBreakIntervals.waterMinutes,
      stand: advice.recommendedBreakIntervals.standMinutes,
      screen: advice.recommendedBreakIntervals.screenMinutes,
    };

    onApplyAdjustments(newGoals, newIntervals);
    setApplied(true);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all relative overflow-hidden space-y-4">
      
      {/* Google gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 via-emerald-400 to-amber-400" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">AI Wellness Coach</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Gemini
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Smart workday activity analysis</p>
          </div>
        </div>

        <button
          onClick={fetchAICoachAdvice}
          disabled={loading}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing...' : advice ? 'Refresh Advice' : 'Analyze Workday Activity'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Populated Coach Insights */}
      {advice && !loading && (
        <div className="space-y-4 animate-in fade-in pt-1">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <h4 className="text-base font-black text-slate-900">"{advice.coachTitle}"</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{advice.overallEvaluation}</p>
          </div>

          {/* Micro-Adjustments */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
              <span className="text-[10px] font-bold text-blue-700 uppercase block">Water Target</span>
              <span className="text-lg font-black text-blue-900 font-mono">
                {advice.suggestedAdjustments.recommendedWaterMl} ml
              </span>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">Stand Breaks</span>
              <span className="text-lg font-black text-emerald-900 font-mono">
                {advice.suggestedAdjustments.recommendedStandBreaks} breaks
              </span>
            </div>
            <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
              <span className="text-[10px] font-bold text-indigo-700 uppercase block">Eye Rests</span>
              <span className="text-lg font-black text-indigo-900 font-mono">
                {advice.suggestedAdjustments.recommendedScreenRests} rests
              </span>
            </div>
            <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-100">
              <span className="text-[10px] font-bold text-rose-700 uppercase block">Chair Limit</span>
              <span className="text-lg font-black text-rose-900 font-mono">
                {advice.suggestedAdjustments.recommendedMaxContinuousSedentaryMins}m
              </span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleApply}
            disabled={applied}
            className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
              applied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98'
            }`}
          >
            {applied ? <Check className="w-4 h-4 stroke-[3]" /> : <ArrowRight className="w-4 h-4" />}
            <span>{applied ? 'Adjustments Applied to Settings' : 'Apply Coach Adjustments'}</span>
          </button>
        </div>
      )}

    </div>
  );
};
