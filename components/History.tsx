import React, { useState } from 'react';
import { SessionHistoryItem, TimerMode } from '../types';
import { Clock, Calendar, Search } from 'lucide-react';
import { cn } from '../utils';

interface HistoryProps {
  history: SessionHistoryItem[];
}

const History: React.FC<HistoryProps> = ({ history }) => {
  const [filterMode, setFilterMode] = useState<'ALL' | TimerMode>('ALL');
  
  // Calculate date 7 days ago for default filter
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);
  
  const [startDate, setStartDate] = useState<string>(defaultStartDate.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const filteredHistory = history.filter(item => {
    const itemDate = new Date(item.startTime);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include full end day

    const dateMatch = itemDate >= start && itemDate <= end;
    const modeMatch = filterMode === 'ALL' || item.mode === filterMode;

    return dateMatch && modeMatch;
  });

  const totalMinutes = filteredHistory.reduce((acc, curr) => acc + curr.duration, 0);

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col md:flex-row gap-6 items-end md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 dark:text-slate-400">From</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 dark:text-slate-400">To</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-xs font-semibold text-slate-500 mb-1 dark:text-slate-400">Session Type</label>
              <select 
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as 'ALL' | TimerMode)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              >
                <option value="ALL">All Types</option>
                <option value={TimerMode.FOCUS}>Deep Focus</option>
                <option value={TimerMode.SHORT_BREAK}>Short Break</option>
                <option value={TimerMode.LONG_BREAK}>Long Break</option>
              </select>
            </div>
          </div>
          
          <div className="text-right">
             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Time</p>
             <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
             </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Date & Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Duration</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">Notes Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredHistory.length > 0 ? filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{item.startTime.toLocaleDateString()}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                            {item.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                            {item.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold",
                        item.mode === TimerMode.FOCUS ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        item.mode === TimerMode.SHORT_BREAK ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" :
                        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                        {item.mode === TimerMode.FOCUS ? 'Focus' : item.mode === TimerMode.SHORT_BREAK ? 'Short Break' : 'Long Break'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    {item.duration} min
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {item.noteSnapshot || <span className="text-slate-300 dark:text-slate-600 italic">No notes</span>}
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        No sessions found for this period.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;