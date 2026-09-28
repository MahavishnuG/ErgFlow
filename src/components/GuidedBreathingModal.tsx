import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Eye, 
  Sparkles, 
  Wind,
  Volume2,
  VolumeX,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioManager } from '../utils/audio';

interface GuidedBreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  soundEnabled: boolean;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export const GuidedBreathingModal: React.FC<GuidedBreathingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  soundEnabled,
}) => {
  const TOTAL_DURATION_SECONDS = 120; // 2 minutes
  const [remainingSeconds, setRemainingSeconds] = useState(TOTAL_DURATION_SECONDS);
  const [isRunning, setIsRunning] = useState(true);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [cycleCount, setCycleCount] = useState(1);
  const [audioMuted, setAudioMuted] = useState(!soundEnabled);
  const [isCompleted, setIsCompleted] = useState(false);

  const phaseTimerRef = useRef<number>(0);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setRemainingSeconds(TOTAL_DURATION_SECONDS);
      setIsRunning(true);
      setPhase('inhale');
      setPhaseSeconds(4);
      setCycleCount(1);
      setIsCompleted(false);
      phaseTimerRef.current = 0;
      if (!audioMuted) {
        audioManager.playZen(0.5);
      }
    }
  }, [isOpen]);

  // Main 1-second interval
  useEffect(() => {
    if (!isOpen || !isRunning || isCompleted) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          handleSessionFinished();
          return 0;
        }
        return prev - 1;
      });

      phaseTimerRef.current += 1;
      const cyclePos = phaseTimerRef.current % 16; // 4s + 4s + 4s + 4s = 16s cycle

      if (cyclePos === 0) {
        setPhase('inhale');
        setPhaseSeconds(4);
        setCycleCount((c) => c + 1);
        if (!audioMuted) audioManager.playZen(0.4);
      } else if (cyclePos === 4) {
        setPhase('hold');
        setPhaseSeconds(4);
      } else if (cyclePos === 8) {
        setPhase('exhale');
        setPhaseSeconds(4);
        if (!audioMuted) audioManager.playDroplet(0.4);
      } else if (cyclePos === 12) {
        setPhase('rest');
        setPhaseSeconds(4);
      }

      setPhaseSeconds(4 - (cyclePos % 4));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning, isCompleted, audioMuted]);

  const handleSessionFinished = () => {
    setIsCompleted(true);
    setIsRunning(false);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    if (!audioMuted) {
      audioManager.playChime(0.6);
    }
    onComplete();
  };

  if (!isOpen) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const phaseDetails: {
    [key in BreathPhase]: {
      label: string;
      instruction: string;
      animClass: string;
      colorText: string;
      bgColor: string;
    };
  } = {
    inhale: {
      label: 'Inhale',
      instruction: 'Inhale deeply and gently through your nose...',
      animClass: 'animate-breath-inhale',
      colorText: 'text-teal-600',
      bgColor: 'bg-teal-50 border-teal-200',
    },
    hold: {
      label: 'Hold',
      instruction: 'Hold breath softly. Relax your shoulders and jaw.',
      animClass: 'animate-breath-hold',
      colorText: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
    },
    exhale: {
      label: 'Exhale',
      instruction: 'Exhale smoothly and slowly through your mouth...',
      animClass: 'animate-breath-exhale',
      colorText: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-200',
    },
    rest: {
      label: 'Rest',
      instruction: 'Rest at empty lungs. Soften eye muscles completely.',
      animClass: 'animate-breath-rest',
      colorText: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
    },
  };

  const currentPhase = phaseDetails[phase];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-900 flex flex-col items-center text-center space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Top bar controls */}
        <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              2-Minute Guided Breathing Session
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setAudioMuted(!audioMuted)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={audioMuted ? 'Unmute chime' : 'Mute chime'}
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close session"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Eye Rest Header Prompt */}
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 flex items-center justify-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <span>Ocular Decompression & Box Breathing</span>
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Close your eyes or gaze 20 feet away into distance. Let your ciliary muscles relax.
          </p>
        </div>

        {/* Animated Visual Guide (CSS Keyframe Lotus/Orb) */}
        <div className="relative w-56 h-56 flex items-center justify-center my-2">
          
          {/* Subtle Outer Pulsing Halo */}
          <div className="absolute inset-0 rounded-full bg-teal-50 border border-teal-100 opacity-70"></div>
          
          {/* Main Keyframe Animated Breathing Orb */}
          <div 
            className={`w-40 h-40 rounded-full bg-gradient-to-tr from-teal-400 via-sky-400 to-indigo-500 flex items-center justify-center shadow-lg transition-all duration-300 ${
              isRunning && !isCompleted ? currentPhase.animClass : 'scale-90 opacity-90'
            }`}
          >
            {/* Center Core */}
            <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center shadow-inner p-2 text-center">
              <span className={`text-base font-black uppercase tracking-wider ${currentPhase.colorText}`}>
                {isCompleted ? 'Done!' : currentPhase.label}
              </span>
              {!isCompleted && (
                <span className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                  {phaseSeconds}s
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Phase Instruction & Cue */}
        <div className="space-y-1 w-full">
          <p className="text-sm font-semibold text-slate-700 min-h-[22px]">
            {isCompleted ? '🎉 2-minute mindful eye rest completed!' : currentPhase.instruction}
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-slate-500 font-medium">
            <span>Cycle {cycleCount} of 7</span>
            <span>•</span>
            <span className="font-mono font-bold text-slate-800">{timeFormatted} Remaining</span>
          </div>
        </div>

        {/* Completed Feedback Banner */}
        {isCompleted && (
          <div className="w-full p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
            <span>Eye break logged! Ocular tension released.</span>
          </div>
        )}

        {/* Controls Footer */}
        <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-center gap-3">
          {!isCompleted ? (
            <>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                onClick={handleSessionFinished}
                className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Complete Session</span>
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              Back to Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
