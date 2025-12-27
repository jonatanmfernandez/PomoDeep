import React from 'react';
import { View } from '../types';
import { Timer, Inbox as InboxIcon, BarChart2, Settings, History, ChevronRight, Tags, ExternalLink, Menu, PenLine, User, CreditCard } from 'lucide-react';
import { cn } from '../utils';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  badgeCount?: number;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  onOpenNewWindow: () => void;
  onQuickCapture: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, badgeCount, isCollapsed, toggleSidebar, onOpenNewWindow, onQuickCapture }) => {
  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => onChangeView(view)}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all relative overflow-hidden group/item",
        isCollapsed ? "justify-center" : "justify-start",
        currentView === view 
          ? "bg-pomo text-white shadow-lg shadow-pomo/30 dark:bg-pomo dark:text-white" 
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", currentView === view ? "text-white" : "text-current group-hover/item:text-pomo")} />
      
      {!isCollapsed && (
        <span className="font-medium whitespace-nowrap animate-in fade-in duration-200 text-sm">{label}</span>
      )}
      
      {view === 'inbox' && badgeCount && badgeCount > 0 && (
        <span className={cn(
            "absolute rounded-full bg-pomo border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-bold text-white",
            isCollapsed ? "top-2 right-2 w-3 h-3 p-0.5" : "right-3 top-1/2 -translate-y-1/2 min-w-[1.25rem] h-5 px-1"
        )}>
            {isCollapsed ? '' : badgeCount}
        </span>
      )}
    </button>
  );

  return (
    <>
    {/* Floating Toggle Button */}
    <button 
        onClick={toggleSidebar}
        className={cn(
            "fixed top-6 right-6 z-50 p-2 bg-white dark:bg-slate-900 rounded-full shadow-md border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-pomo transition-all duration-300",
            !isCollapsed && "opacity-0 pointer-events-none"
        )}
    >
        <Menu className="w-6 h-6" />
    </button>

    <div 
        className={cn(
            "h-screen bg-white flex flex-col fixed right-0 top-0 z-50 transition-all duration-300 ease-in-out dark:bg-slate-950 shadow-2xl border-l border-slate-100 dark:border-slate-900",
            isCollapsed ? "translate-x-full opacity-0 pointer-events-none w-0" : "translate-x-0 w-72 opacity-100 p-6"
        )}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menu</span>
            <button onClick={toggleSidebar} className="p-1 hover:bg-slate-100 rounded-md dark:hover:bg-slate-800 text-slate-400">
                <ChevronRight className="w-5 h-5" />
            </button>
      </div>

      {/* Quick Capture Button (Menu Bar) */}
      <div className="mb-6">
          <button 
            onClick={() => { onQuickCapture(); if(window.innerWidth < 768) toggleSidebar(); }}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md dark:bg-white dark:text-black dark:hover:bg-slate-200"
          >
            <PenLine className="w-4 h-4" />
            <span className="font-semibold text-sm">Quick Capture</span>
          </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        <NavItem view="timer" icon={Timer} label="Focus Timer" />
        <NavItem view="inbox" icon={InboxIcon} label="Inbox" />
        <NavItem view="categories" icon={Tags} label="Categories" />
        <NavItem view="dashboard" icon={BarChart2} label="Dashboard" />
        <NavItem view="history" icon={History} label="History" />
        <NavItem view="settings" icon={Settings} label="Settings" />
      </nav>

      {/* Footer / User Profile */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
         
         <button 
           onClick={onOpenNewWindow}
           className="w-full flex items-center gap-4 px-4 py-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all justify-start group"
           title="Open in new window (App Mode)"
         >
            <ExternalLink className="w-4 h-4 group-hover:text-blue-600" />
            <span className="font-medium whitespace-nowrap text-xs">Pop-out App</span>
         </button>

         {/* User Profile Card */}
         <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                 <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Alex Designer</p>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <User className="w-3 h-3" />
                    <span>Free Plan</span>
                </div>
            </div>
            <button className="text-slate-400 hover:text-pomo transition-colors" title="Manage Subscription">
                <CreditCard className="w-4 h-4" />
            </button>
         </div>

      </div>
    </div>
    </>
  );
};

export default Sidebar;