import React, { useState } from 'react';
import { X, Send, Sparkles, Loader2, PenLine, Clock } from 'lucide-react';
import { Category, TimerMode } from '../types';
import { cn, formatTime } from '../utils';
import { GoogleGenAI } from "@google/genai";

interface QuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (content: string, categoryId?: string) => void;
  timeLeft: number;
  timerMode: TimerMode;
}

const QuickCapture: React.FC<QuickCaptureProps> = ({ isOpen, onClose, categories, onSave, timeLeft, timerMode }) => {
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!note.trim()) return;
    onSave(note, selectedCategory);
    setNote('');
    onClose();
  };

  const handleAskAI = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate 3 short, punchy, and actionable bullet points to help me start a new project or improve productivity right now. Keep it under 50 words.",
      });
      
      const text = response.text;
      if (text) {
        setNote(prev => prev + (prev ? '\n\n' : '') + "✨ AI Ideas:\n" + text);
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert("Unable to connect to AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop - Lighter to see background timer */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose}
      />

      {/* Mini Timer Preview (Floating above modal) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md border border-white/10 text-white px-6 py-2 rounded-full flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 pointer-events-none">
         <Clock className={cn("w-4 h-4", 
             timerMode === TimerMode.FOCUS ? "text-pomo-light" : "text-emerald-400"
         )} />
         <span className="font-mono text-xl font-bold tracking-widest">{formatTime(timeLeft)}</span>
         <span className="text-[10px] uppercase tracking-wider opacity-70">
            {timerMode === TimerMode.FOCUS ? 'Focus' : 'Break'}
         </span>
      </div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
           <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <PenLine className="w-5 h-5 text-pomo" />
                <h3>Quick Capture</h3>
            </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind? Capture tasks, ideas, or distractions..."
            className="w-full h-40 bg-slate-50 border-0 rounded-xl p-4 text-slate-700 focus:outline-none focus:ring-1 focus:ring-pomo/20 resize-none dark:bg-slate-800 dark:text-slate-300 placeholder:text-slate-400"
            autoFocus
          />

          <div className="flex items-center justify-between">
              <button 
                onClick={handleAskAI}
                disabled={isAiLoading}
                className={cn(
                    "text-xs font-medium flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg",
                    isAiLoading ? "text-slate-400" : "text-violet-600 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/20 dark:hover:bg-violet-900/30"
                )}
            >
                {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI Assist
            </button>

            <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 outline-none focus:border-pomo dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            >
                <option value="">No Category</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
             <button 
                onClick={handleSave}
                disabled={!note.trim()}
                className="bg-pomo text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-pomo/20 hover:bg-pomo-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                <Send className="w-4 h-4" />
                Save Note
            </button>
        </div>
      </div>
    </div>
  );
};

export default QuickCapture;