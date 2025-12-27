import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Timer from './components/Timer';
import Inbox from './components/Inbox';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Categories from './components/Categories';
import QuickCapture from './components/QuickCapture';
import { View, TimerMode, InboxItem, Settings, UserCredits, SessionHistoryItem, Category } from './types';
import { generateId, cn } from './utils';
import { Moon, Sun } from 'lucide-react';

// Mock Data
const INITIAL_SETTINGS: Settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Work', color: 'bg-red-500' },
  { id: 'c2', name: 'Personal', color: 'bg-blue-500' },
  { id: 'c3', name: 'Learning', color: 'bg-emerald-500' },
];

const INITIAL_INBOX: InboxItem[] = [
  {
    id: '1',
    type: 'note',
    noteContent: 'Research API endpoints for Notion integration',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'pending',
    categoryId: 'c1' // Work
  },
  {
    id: '2',
    type: 'note',
    noteContent: 'Buy groceries for the week',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'pending',
    categoryId: 'c2' // Personal
  },
  {
    id: '3',
    type: 'notification',
    noteContent: 'Payment Successful: Pro Plan renewed for October.',
    createdAt: new Date(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'pending',
    isRead: false
  }
];

const App: React.FC = () => {
  // Navigation & Data State
  const [currentView, setCurrentView] = useState<View>('timer');
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [currentNote, setCurrentNote] = useState<string>(''); 
  const [inbox, setInbox] = useState<InboxItem[]>(INITIAL_INBOX);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [credits, setCredits] = useState<UserCredits>({ available: 10, used: 145 });
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);

  // Timer State (Lifted from Timer.tsx)
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const startTimeRef = useRef<Date | null>(null);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      if (newVal) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newVal;
    });
  };

  // --- Timer Logic (Lifted) ---
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  // Update timer when settings change (if not active)
  useEffect(() => {
    if (!isActive) {
      let duration = settings.focusDuration;
      if (mode === TimerMode.SHORT_BREAK) duration = settings.shortBreakDuration;
      if (mode === TimerMode.LONG_BREAK) duration = settings.longBreakDuration;
      setTimeLeft(duration * 60);
    }
  }, [mode, settings, isActive]);

  const handleSessionComplete = useCallback((completedMode: TimerMode) => {
    const duration = completedMode === TimerMode.FOCUS ? settings.focusDuration : 
                     completedMode === TimerMode.SHORT_BREAK ? settings.shortBreakDuration : 
                     settings.longBreakDuration;
    
    const newHistoryItem: SessionHistoryItem = {
        id: generateId(),
        startTime: new Date(Date.now() - duration * 60 * 1000),
        endTime: new Date(),
        mode: completedMode,
        duration: duration,
        noteSnapshot: completedMode === TimerMode.FOCUS ? currentNote : undefined
    };

    setHistory(prev => [newHistoryItem, ...prev]);
    
    if (currentNote.trim()) {
        saveNoteToInbox(currentNote);
        setCurrentNote('');
    }
  }, [currentNote, settings]);

  const switchMode = useCallback(() => {
    if (mode === TimerMode.FOCUS) {
      const newCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newCompleted);
      
      let nextMode = TimerMode.SHORT_BREAK;
      // After 4 cycles (or whatever setting is), take a long break
      if (newCompleted > 0 && newCompleted % settings.longBreakInterval === 0) {
        nextMode = TimerMode.LONG_BREAK;
      }
      setMode(nextMode);
      sendNotification("Time for a break!", `Focus session complete. Starting ${nextMode === TimerMode.LONG_BREAK ? 'Long' : 'Short'} Break.`);
    } else {
      setMode(TimerMode.FOCUS);
      sendNotification("Break Over", "Time to get back to deep work!");
    }
  }, [mode, sessionsCompleted, settings.longBreakInterval]);

  // The Tick
  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handleSessionComplete(mode);
      switchMode();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, handleSessionComplete, switchMode]);

  const toggleTimer = () => {
    const willBeActive = !isActive;
    if (willBeActive && mode === TimerMode.FOCUS) {
      sendNotification("Deep Work Started", "Stay focused.");
      startTimeRef.current = new Date();
    }
    setIsActive(willBeActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    let duration = settings.focusDuration;
    if (mode === TimerMode.SHORT_BREAK) duration = settings.shortBreakDuration;
    if (mode === TimerMode.LONG_BREAK) duration = settings.longBreakDuration;
    setTimeLeft(duration * 60);
  };
  
  // Specific function to switch and start a new mode immediately
  const startSession = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    
    let duration = settings.focusDuration;
    if (newMode === TimerMode.SHORT_BREAK) duration = settings.shortBreakDuration;
    if (newMode === TimerMode.LONG_BREAK) duration = settings.longBreakDuration;
    
    setTimeLeft(duration * 60);
    
    // Slight delay to ensure state updates before starting
    setTimeout(() => {
        setIsActive(true);
        if (newMode === TimerMode.FOCUS) {
            startTimeRef.current = new Date();
        }
    }, 0);
  };

  // ---------------------------

  // Cron Job Simulation
  useEffect(() => {
    const checkExpiration = () => {
      const now = new Date();
      setInbox(prev => prev.filter(item => item.deadline > now));
    };
    const interval = setInterval(checkExpiration, 60000);
    return () => clearInterval(interval);
  }, []);

  const saveNoteToInbox = (content: string, categoryId?: string) => {
      const newItem: InboxItem = {
        id: generateId(),
        type: 'note',
        noteContent: content,
        createdAt: new Date(),
        deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), 
        status: 'pending',
        categoryId: categoryId
      };
      setInbox(prev => [newItem, ...prev]);
  };

  const handleInboxAction = (id: string, action: 'complete' | 'delete' | 'schedule' | 'nextAction') => {
    if (action === 'delete') {
      setInbox(prev => prev.filter(i => i.id !== id));
    } else {
        setInbox(prev => prev.map(i => i.id === id ? { ...i, status: action === 'schedule' ? 'scheduled' : 'completed', isRead: true } : i));
        if (action === 'schedule') alert('Opened Google Calendar Integration Mock');
        if (action === 'nextAction') alert('Opened Next Action Definition Mock');
    }
  };

  const handleExport = (type: string) => {
      if (credits.available > 0) {
          setCredits(prev => ({ ...prev, available: prev.available - 1, used: prev.used + 1}));
          alert(`Exporting to ${type}... Credit deducted.`);
      } else {
          alert('Insufficient credits. Please upgrade.');
      }
  };

  const handleOpenNewWindow = () => {
      const width = 1000;
      const height = 800;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      window.open(window.location.href, '_blank', `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`);
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    if (!isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
    }
  };

  const handleQuickCaptureOpen = () => {
      setIsQuickCaptureOpen(true);
      setIsSidebarCollapsed(true);
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-black font-sans transition-colors duration-300 relative overflow-hidden">
      
      {/* Quick Capture Modal (Global) - Now receives timer state */}
      <QuickCapture 
        isOpen={isQuickCaptureOpen} 
        onClose={() => setIsQuickCaptureOpen(false)}
        categories={categories}
        onSave={saveNoteToInbox}
        timeLeft={timeLeft} // Pass timer data
        timerMode={mode}    // Pass timer data
      />

      {/* Backdrop for Sidebar */}
      {!isSidebarCollapsed && (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {/* Main Content Area */}
      <main 
        className={cn(
            "flex-1 p-8 overflow-y-auto min-h-screen transition-all duration-300 ease-in-out",
            "w-full max-w-7xl mx-auto"
        )}
      >
        {/* Header: Adjusted padding to prevent Dark Mode button overlap with Fixed Menu button on mobile */}
        <header className="mb-8 flex justify-between items-center pr-16 md:pr-0 relative z-0">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pomo rounded-xl flex items-center justify-center shadow-lg shadow-pomo/30 flex-shrink-0 text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                        Pomo<span className="text-pomo">Deep</span>
                    </h1>
                    <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-1">Focus OS</p>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                  title="Toggle Dark Mode"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
             </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Timer now receives state via props, making it a controlled component */}
            {currentView === 'timer' && (
            <Timer 
                settings={settings}
                activeMode={mode} // Renamed for clarity
                startSession={startSession} // New Prop
                timeLeft={timeLeft}
                isActive={isActive}
                toggleTimer={toggleTimer}
                resetTimer={resetTimer}
                sessionsCompleted={sessionsCompleted}
                currentNote={currentNote}
                onNoteChange={setCurrentNote}
                categories={categories}
                onSaveNote={saveNoteToInbox}
            />
            )}

            {currentView === 'inbox' && (
            <Inbox items={inbox} onAction={handleInboxAction} categories={categories} />
            )}
            
            {currentView === 'categories' && (
            <Categories 
                categories={categories} 
                onAdd={(c) => setCategories(prev => [...prev, c])}
                onDelete={(id) => setCategories(prev => prev.filter(c => c.id !== id))}
            />
            )}

            {currentView === 'dashboard' && (
            <Dashboard credits={credits} onExport={handleExport} />
            )}

            {currentView === 'history' && (
            <History history={history} />
            )}

            {currentView === 'settings' && (
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <h3 className="text-lg font-bold mb-6 dark:text-white">Timer Configuration</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Deep Work Duration (min)</label>
                            <input 
                                type="range" 
                                min="15" 
                                max="60" 
                                value={settings.focusDuration}
                                onChange={(e) => setSettings({...settings, focusDuration: parseInt(e.target.value)})}
                                className="w-full accent-pomo cursor-pointer" 
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>15m</span>
                                <span className="font-bold text-pomo">{settings.focusDuration}m</span>
                                <span>60m</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                             <div>
                                <h4 className="font-medium text-slate-900 dark:text-white">Deep Work Extension</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Enable 1 hour deep work sessions</p>
                             </div>
                             <button 
                                onClick={() => setSettings(prev => ({...prev, focusDuration: prev.focusDuration === 60 ? 25 : 60}))}
                                className={
                                    `w-12 h-6 rounded-full transition-colors relative ${settings.focusDuration === 60 ? 'bg-pomo' : 'bg-slate-200 dark:bg-slate-700'}`
                                }
                             >
                                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.focusDuration === 60 ? 'translate-x-6' : ''}`} />
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>

      {/* Right Sidebar - Fixed Overlay */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={handleViewChange} 
        badgeCount={inbox.filter(i => i.status === 'pending' && i.type === 'notification' && !i.isRead).length}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenNewWindow={handleOpenNewWindow}
        onQuickCapture={handleQuickCaptureOpen}
      />
    </div>
  );
};

export default App;