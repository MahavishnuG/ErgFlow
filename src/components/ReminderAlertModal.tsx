import React, { useState } from 'react';
import { 
  Droplet, 
  Footprints, 
  Eye, 
  Check, 
  AlarmClock, 
  X, 
  Lock,
  Sparkles,
  RefreshCw 
} from 'lucide-react';
import { ReminderType } from '../types';

interface ReminderAlertModalProps {
  type: ReminderType | null;
  onConfirmBreak: (type: ReminderType) => void;
  onDismiss: () => void;
}

export const ReminderAlertModal: React.FC<ReminderAlertModalProps> = ({
  type,
  onConfirmBreak,
  onDismiss,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!type) return null;

  const contentMap: {
    [key in ReminderType]: {
      title: string;
      headline: string;
      subtitle: string;
      icon: React.ReactNode;
      colorBg: string;
      colorBorder: string;
      buttonBg: string;
    };
  } = {
    water: {
      title: 'Hydration Time Reached',
      headline: 'Time to drink your scheduled glass of water',
      subtitle: '9:00 AM – 6:00 PM Office Schedule Interval',
      icon: <Droplet className="w-10 h-10 text-blue-600 fill-blue-600/30 animate-bounce" />,
      colorBg: 'bg-white',
      colorBorder: 'border-blue-200',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    stand: {
      title: 'Stand & Move Time Reached',
      headline: 'Time to leave your desk chair and walk',
      subtitle: '9:00 AM – 6:00 PM Office Schedule Interval',
      icon: <Footprints className="w-10 h-10 text-emerald-600 animate-pulse" />,
      colorBg: 'bg-white',
      colorBorder: 'border-emerald-200',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    screen: {
      title: '20-20-20 Eye Rest Reached',
      headline: 'Look 20 feet away to relax your eyes',
      subtitle: '9:00 AM – 6:00 PM Office Schedule Interval',
      icon: <Eye className="w-10 h-10 text-indigo-600 animate-pulse" />,
      colorBg: 'bg-white',
      colorBorder: 'border-indigo-200',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
  };

  const current = contentMap[type];

  // User clicks to enter: after 1 second, it marks progress as done and closes
  const handleClickToEnter = () => {
    if (isProcessing || isDone) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      onConfirmBreak(type);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-sm sm:max-w-md rounded-3xl border ${current.colorBorder} ${current.colorBg} p-6 sm:p-8 shadow-2xl text-slate-900 text-center space-y-5 max-h-[92vh] overflow-y-auto`}>
        
        {/* Dismiss corner button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Dismiss alert"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center pt-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs">
            {current.icon}
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-emerald-700">
            {current.title}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {current.headline}
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            {current.subtitle}
          </p>
        </div>

        {/* 1-Second Click to Enter Progress Action */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleClickToEnter}
            disabled={isProcessing || isDone}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 min-h-[50px] ${
              isDone
                ? 'bg-emerald-600 text-white'
                : isProcessing
                ? 'bg-blue-700 text-white cursor-wait'
                : current.buttonBg
            }`}
          >
            {isDone ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Break Recorded & Progress Done!</span>
              </>
            ) : isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Recording Progress...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Click to Enter (Complete Break)</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 font-medium">
            Click to enter and advance your workday progress
          </p>
        </div>

      </div>
    </div>
  );
};
