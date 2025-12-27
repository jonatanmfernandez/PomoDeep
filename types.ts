export enum TimerMode {
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind class or hex
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

export interface InboxItem {
  id: string;
  type: 'note' | 'notification'; // Added type
  noteContent: string;
  createdAt: Date;
  deadline: Date;
  status: 'pending' | 'completed' | 'scheduled';
  categoryId?: string;
  nextAction?: string;
  scheduledDate?: Date;
  isRead?: boolean; // Added read status
}

export interface UserCredits {
  available: number;
  used: number;
}

export interface Settings {
  focusDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

export interface SessionHistoryItem {
  id: string;
  startTime: Date;
  endTime: Date;
  mode: TimerMode;
  duration: number; // in minutes
  noteSnapshot?: string;
}

export type View = 'timer' | 'inbox' | 'dashboard' | 'settings' | 'history' | 'categories';