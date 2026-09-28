import React from 'react';
import { 
  Clock, 
  Wind, 
  Bot, 
  Calendar, 
  FileText, 
  History 
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenBreathing: () => void;
  onOpenCalendar: () => void;
  onOpenReport: () => void;
  onOpenLogs: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenBreathing,
  onOpenCalendar,
  onOpenReport,
  onOpenLogs,
  onScrollToSection,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-1 py-1 flex items-center justify-around safe-bottom">
      
      {/* 1. Reminders */}
      <button
        onClick={() => onScrollToSection('section-reminders')}
        className="flex flex-col items-center justify-center p-1 rounded-xl text-slate-600 hover:text-blue-600 active:scale-95 transition-all flex-1 min-w-0"
      >
        <Clock className="w-4 h-4 mb-0.5" />
        <span className="text-[9px] font-bold truncate">Schedule</span>
      </button>

      {/* 2. Guided Breathing */}
      <button
        onClick={onOpenBreathing}
        className="flex flex-col items-center justify-center p-1 rounded-xl text-teal-700 hover:text-teal-800 active:scale-95 transition-all flex-1 min-w-0"
      >
        <Wind className="w-4 h-4 mb-0.5 text-teal-600" />
        <span className="text-[9px] font-bold truncate">Breathe</span>
      </button>

      {/* 3. AI Coach */}
      <button
        onClick={() => onScrollToSection('section-ai-coach')}
        className="flex flex-col items-center justify-center p-1 rounded-xl text-indigo-600 hover:text-indigo-700 active:scale-95 transition-all flex-1 min-w-0"
      >
        <Bot className="w-4 h-4 mb-0.5" />
        <span className="text-[9px] font-bold truncate">AI Coach</span>
      </button>

      {/* 4. Calendar Sync */}
      <button
        onClick={onOpenCalendar}
        className="flex flex-col items-center justify-center p-1 rounded-xl text-slate-600 hover:text-blue-600 active:scale-95 transition-all flex-1 min-w-0"
      >
        <Calendar className="w-4 h-4 mb-0.5" />
        <span className="text-[9px] font-bold truncate">Calendar</span>
      </button>

      {/* 5. PDF Report */}
      <button
        onClick={onOpenReport}
        className="flex flex-col items-center justify-center p-1 rounded-xl text-slate-600 hover:text-emerald-600 active:scale-95 transition-all flex-1 min-w-0"
      >
        <FileText className="w-4 h-4 mb-0.5" />
        <span className="text-[9px] font-bold truncate">Report</span>
      </button>

      {/* 6. Activity Logs */}
      <button
        onClick={onOpenLogs}
        className="flex flex-col items-center justify-center p-1 rounded-xl text-slate-600 hover:text-slate-900 active:scale-95 transition-all flex-1 min-w-0"
      >
        <History className="w-4 h-4 mb-0.5" />
        <span className="text-[9px] font-bold truncate">Logs</span>
      </button>

    </nav>
  );
};
