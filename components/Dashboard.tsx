import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { UserCredits } from '../types';
import { Download, Share2, CreditCard } from 'lucide-react';

interface DashboardProps {
  credits: UserCredits;
  onExport: (type: 'notion' | 'sheets' | 'pdf' | 'md') => void;
}

const data = [
  { name: 'Mon', minutes: 125 },
  { name: 'Tue', minutes: 200 },
  { name: 'Wed', minutes: 150 },
  { name: 'Thu', minutes: 300 },
  { name: 'Fri', minutes: 180 },
  { name: 'Sat', minutes: 50 },
  { name: 'Sun', minutes: 100 },
];

const Dashboard: React.FC<DashboardProps> = ({ credits, onExport }) => {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group dark:bg-black dark:border dark:border-slate-800">
            <div className="absolute top-0 right-0 p-32 bg-red-600/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-red-600/20 transition-all"></div>
            <div className="relative z-10">
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Export Credits</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{credits.available}</span>
                    <span className="text-slate-400">/ ∞</span>
                </div>
                <button className="mt-6 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20">
                    <CreditCard className="w-4 h-4" /> Buy 50 Credits ($10)
                </button>
            </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800">
            <div>
                 <h3 className="text-slate-900 text-lg font-bold mb-1 dark:text-white">Weekly Focus</h3>
                 <p className="text-slate-500 text-sm dark:text-slate-400">You focused for 18.4 hours this week.</p>
            </div>
            <div className="h-32 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} stroke="#94a3b8" />
                        <Tooltip 
                            cursor={{fill: 'var(--tw-prose-invert)'}} 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.minutes > 150 ? '#dc2626' : '#cbd5e1'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 dark:text-white">
                <Download className="w-5 h-5" /> Export Data
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => onExport('pdf')}
                    className="p-4 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50 transition-all text-left group dark:border-slate-700 dark:hover:border-red-500 dark:hover:bg-red-900/20"
                >
                    <span className="block font-bold text-slate-700 group-hover:text-red-700 dark:text-slate-200 dark:group-hover:text-red-400">PDF Report</span>
                    <span className="text-xs text-slate-400 mt-1">1 Credit</span>
                </button>
                <button 
                    onClick={() => onExport('md')}
                    className="p-4 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50 transition-all text-left group dark:border-slate-700 dark:hover:border-red-500 dark:hover:bg-red-900/20"
                >
                    <span className="block font-bold text-slate-700 group-hover:text-red-700 dark:text-slate-200 dark:group-hover:text-red-400">Markdown</span>
                    <span className="text-xs text-slate-400 mt-1">Free</span>
                </button>
                <button 
                    onClick={() => onExport('sheets')}
                    className="p-4 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all text-left group dark:border-slate-700 dark:hover:border-green-500 dark:hover:bg-green-900/20"
                >
                    <span className="block font-bold text-slate-700 group-hover:text-green-700 dark:text-slate-200 dark:group-hover:text-green-400">Google Sheets</span>
                    <span className="text-xs text-slate-400 mt-1">2 Credits</span>
                </button>
                <button className="p-4 rounded-xl border border-slate-200 opacity-50 cursor-not-allowed text-left dark:border-slate-700">
                    <span className="block font-bold text-slate-400 dark:text-slate-500">Image</span>
                    <span className="text-xs text-slate-400 mt-1 dark:text-slate-600">Coming Soon</span>
                </button>
            </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
             <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 dark:text-white">
                <Share2 className="w-5 h-5" /> Integrations
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-xs">N</div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">Notion</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Sync inbox items as pages</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onExport('notion')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Sync Now
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-xs">G</div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">Google Calendar</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Auto-schedule tasks</p>
                        </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium dark:bg-green-900/30 dark:text-green-400">Active</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;