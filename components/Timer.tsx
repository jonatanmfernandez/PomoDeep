import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, Coffee, Lock } from 'lucide-react';
import { TimerMode, Settings, Category } from '../types';
import { formatTime, cn } from '../utils';

interface TimerProps {
  settings: Settings;
  activeMode: TimerMode; // The mode currently running in App state
  startSession: (mode: TimerMode) => void; // Function to force switch and start
  timeLeft: number;
  isActive: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  sessionsCompleted: number;
  onNoteChange: (note: string) => void;
  currentNote: string;
  categories: Category[];
  onSaveNote: (content: string, categoryId?: string) => void;
}

const Timer: React.FC<TimerProps> = ({ 
  settings, 
  activeMode, 
  startSession, 
  timeLeft, 
  isActive, 
  toggleTimer, 
  resetTimer, 
  sessionsCompleted, 
  onNoteChange, 
  currentNote, 
  categories, 
  onSaveNote 
}) => {
  
  // Local view state: Which tab is the user looking at?
  const [viewMode, setViewMode] = useState<TimerMode>(activeMode);

  // If the global active mode changes (e.g. timer finishes and auto-switches), sync the view
  useEffect(() => {
    setViewMode(activeMode);
  }, [activeMode]);

  // Determine what to display based on whether we are looking at the active timer
  const isViewingActive = viewMode === activeMode;

  const getDurationForMode = (m: TimerMode) => {
      switch(m) {
          case TimerMode.FOCUS: return settings.focusDuration;
          case TimerMode.SHORT_BREAK: return settings.shortBreakDuration;
          case TimerMode.LONG_BREAK: return settings.longBreakDuration;
      }
  };

  const displayDuration = getDurationForMode(viewMode);
  
  // If viewing active, show real countdown. If previewing another tab, show that tab's full duration.
  const displayTime = isViewingActive ? timeLeft : displayDuration * 60;
  const totalTime = displayDuration * 60;

  // Progress Logic
  // If previewing (inactive), show full circle (0 progress).
  // If active, show actual progress.
  const progressRatio = isViewingActive ? displayTime / totalTime : 1; 
  const strokeDashoffset = 100 - (progressRatio * 100);
  
  // Growth Scale (Subtle breathing effect only when actually active and viewing it)
  const growthScale = isActive && isViewingActive && viewMode === TimerMode.FOCUS ? 1.05 : 1;

  // Theme configuration based on VIEW mode (changes immediately on tab click)
  const getTheme = (m: TimerMode) => {
    switch(m) {
      case TimerMode.SHORT_BREAK:
        return {
          primary: 'text-emerald-600',
          stroke: 'text-emerald-400',
          btnBg: 'bg-emerald-600',
          btnText: 'text-white',
          glow: 'shadow-emerald-600/30',
          pillActive: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
        };
      case TimerMode.LONG_BREAK:
        return {
          primary: 'text-violet-600',
          stroke: 'text-violet-400',
          btnBg: 'bg-violet-600',
          btnText: 'text-white',
          glow: 'shadow-violet-600/30',
          pillActive: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200'
        };
      default: // FOCUS (Dark Red)
        return {
          primary: 'text-pomo', 
          stroke: 'text-pomo-light',
          btnBg: 'bg-pomo',
          btnText: 'text-white',
          glow: 'shadow-pomo/30',
          pillActive: 'bg-red-100 text-pomo-dark dark:bg-red-900/40 dark:text-red-200'
        };
    }
  };

  const theme = getTheme(viewMode);

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto py-8">
      
        {/* Mode Indicator Tabs */}
        <div className="flex bg-white p-1 rounded-full shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700 relative z-20 mb-12">
            <button
            onClick={() => setViewMode(TimerMode.FOCUS)}
            className={cn("px-6 py-2 rounded-full text-sm font-medium transition-all", viewMode === TimerMode.FOCUS ? theme.pillActive : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")}
            >
            Deep Focus
            </button>
            <button
            onClick={() => setViewMode(TimerMode.SHORT_BREAK)}
            className={cn("px-6 py-2 rounded-full text-sm font-medium transition-all", viewMode === TimerMode.SHORT_BREAK ? theme.pillActive : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")}
            >
            Short Break
            </button>
            <button
            onClick={() => setViewMode(TimerMode.LONG_BREAK)}
            className={cn("px-6 py-2 rounded-full text-sm font-medium transition-all", viewMode === TimerMode.LONG_BREAK ? theme.pillActive : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")}
            >
            Long Break
            </button>
        </div>

        {/* Timer Display Container */}
        <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center mb-12">
            
            {/* Background Circle */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none overflow-visible">
            {/* Track - Thin & Faint */}
            <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="currentColor"
                strokeWidth="1"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
            />
            {/* Progress Indicator - The colored glowing part */}
            {/* strokeLinecap="round" adds the rounded tip natively to the stroke */}
            <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="currentColor"
                strokeWidth="6" 
                fill="transparent"
                pathLength={100}
                strokeDasharray="100" 
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" 
                className={cn("transition-all duration-1000 ease-linear timer-glow", 
                theme.stroke
                )}
            />
            </svg>

            {/* Minimalist Timer Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
            <span 
                className={cn(
                    "font-sans font-light tracking-tight tabular-nums leading-none transition-transform duration-1000 ease-in-out select-none", 
                    theme.primary
                )}
                style={{ 
                    fontSize: 'clamp(4rem, 12vw, 8rem)',
                    transform: `scale(${growthScale})` 
                }}
            >
                {formatTime(displayTime)}
            </span>
            <span className="text-slate-400 mt-2 font-medium uppercase tracking-[0.2em] text-[10px] dark:text-slate-500 opacity-60">
                {isActive && isViewingActive ? (viewMode === TimerMode.FOCUS ? 'Focusing...' : 'Resting...') : 'Ready'}
            </span>
            </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8 relative z-20 mb-8">
            {/* Hide reset button if we are previewing a different mode (confusing to reset active timer from here) */}
            <button
            onClick={resetTimer}
            className={cn(
                "w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-all dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 hover:scale-105 active:scale-95",
                !isViewingActive && "opacity-0 pointer-events-none" 
            )}
            title="Reset Timer"
            >
            <RotateCcw className="w-6 h-6" />
            </button>

            <button
            onClick={() => {
                if (isActive) {
                    if (isViewingActive) {
                        toggleTimer(); // Pause current
                    } else {
                        // Do nothing (Locked) - Optional: Alert user
                    }
                } else {
                    if (isViewingActive) {
                        toggleTimer(); // Start current
                    } else {
                        // Switch to this mode and start
                        startSession(viewMode);
                    }
                }
            }}
            disabled={isActive && !isViewingActive} // Disable click if another timer is running
            className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95",
                isActive && isViewingActive 
                    ? "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300" 
                    : `${theme.btnBg} ${theme.btnText} shadow-xl ${theme.glow}`,
                isActive && !isViewingActive && "opacity-50 cursor-not-allowed grayscale"
            )}
            title={isActive ? (isViewingActive ? "Pause" : "Another timer is running") : "Start"}
            >
            {isActive ? (
                isViewingActive ? <Pause className="w-8 h-8" /> : <Lock className="w-6 h-6" />
            ) : (
                <Play className="w-8 h-8 ml-1" />
            )}
            </button>
        </div>

         {/* Session Stats */}
        <div className="flex gap-4 text-sm text-slate-500 bg-white px-6 py-3 rounded-full border border-slate-100 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 relative z-20">
            <div className="flex items-center gap-2">
                <Zap className={cn("w-4 h-4", theme.primary)} />
                <span>{sessionsCompleted}</span>
            </div>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-600"></div>
            <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-slate-400" />
                <span>Next: {(sessionsCompleted + 1) % settings.longBreakInterval === 0 ? 'Long' : 'Short'}</span>
            </div>
        </div>
    </div>
  );
};

export default Timer;