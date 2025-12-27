import React, { useState } from 'react';
import { InboxItem, Category } from '../types';
import { calculateDaysRemaining, cn } from '../utils';
import { Trash2, Calendar, ArrowRightCircle, CheckCircle, AlertCircle, Bell, Briefcase, User, BookOpen, Lock, Share2, Sparkles } from 'lucide-react';

interface InboxProps {
  items: InboxItem[];
  onAction: (id: string, action: 'complete' | 'delete' | 'schedule' | 'nextAction') => void;
  categories?: Category[];
}

const Inbox: React.FC<InboxProps> = ({ items, onAction, categories }) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'work' | 'personal' | 'learning'>('notifications');

  // Filter items based on active tab
  const filteredItems = items.filter(item => {
    if (item.status !== 'pending') return false;

    if (activeTab === 'notifications') {
        return item.type === 'notification';
    }

    // For other tabs, we are filtering notes based on categories.
    // Assuming category IDs match: 'work', 'personal', 'learning' or using names.
    // For this demo, let's assume we map tabs to specific ID patterns or just filter notes that are NOT notifications.
    if (item.type !== 'note') return false;

    // Hardcoded logic for MVP tabs based on prompt requirements
    // Real app would match item.categoryId with category lists.
    // Here we simulate by assuming some items are tagged.
    // If no category is assigned, we might show them in Personal or Work by default or an 'All' tab.
    // For strict compliance with prompt:
    const catName = categories?.find(c => c.id === item.categoryId)?.name.toLowerCase();
    
    if (activeTab === 'work') return catName === 'work';
    if (activeTab === 'personal') return catName === 'personal' || !catName; // Default to personal if untagged
    if (activeTab === 'learning') return catName === 'learning';
    
    return true;
  });

  const unreadCount = items.filter(i => i.type === 'notification' && !i.isRead).length;

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
      <button
        onClick={() => setActiveTab(id)}
        className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all relative",
            activeTab === id 
                ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-black" 
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        )}
      >
        <Icon className="w-4 h-4" />
        {label}
        {id === 'notifications' && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-black rounded-full"></span>
        )}
      </button>
  );

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Inbox</h2>
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
            <TabButton id="notifications" label="Notifications" icon={Bell} />
            <TabButton id="work" label="Work" icon={Briefcase} />
            <TabButton id="personal" label="Personal" icon={User} />
            <TabButton id="learning" label="Learning" icon={BookOpen} />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-slate-100 rounded-2xl dark:border-slate-800">
            <p className="text-slate-400">No pending items in {activeTab}.</p>
        </div>
      ) : (
        <div className="grid gap-4">
            {filteredItems.map((item) => {
            const daysLeft = calculateDaysRemaining(item.deadline);
            const isUrgent = daysLeft <= 2;
            const isUnreadNotification = item.type === 'notification' && !item.isRead;

            return (
                <div 
                key={item.id} 
                className={cn(
                    "bg-white rounded-xl p-6 shadow-sm border transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group dark:bg-slate-900",
                    isUnreadNotification ? "border-l-4 border-l-red-500 border-y-slate-100 border-r-slate-100 dark:border-y-slate-800 dark:border-r-slate-800" : "border-slate-100 dark:border-slate-800 hover:shadow-md"
                )}
                >
                <div className="flex-1 space-y-2 relative">
                    {isUnreadNotification && (
                        <div className="absolute -left-10 top-1 w-2 h-2 rounded-full bg-red-500" title="Unread"></div>
                    )}
                    
                    {/* Read-Only Content */}
                    <p className="text-lg text-slate-800 font-medium leading-relaxed dark:text-slate-200 cursor-default select-text">
                        {item.noteContent}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs">
                    {item.type === 'note' && (
                        <span className={cn(
                            "px-2 py-1 rounded-md font-medium flex items-center gap-1",
                            isUrgent ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                            <AlertCircle className="w-3 h-3" />
                            {daysLeft} days remaining
                        </span>
                    )}
                    <span className="text-slate-400">
                        {item.type === 'notification' ? 'Received' : 'Created'} {item.createdAt.toLocaleDateString()}
                    </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Share / Export Options */}
                    {item.type === 'note' && (
                        <div className="flex items-center mr-2 pr-2 border-r border-slate-100 dark:border-slate-800">
                             <button 
                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Sync to Google/Notion (Free)"
                             >
                                <Share2 className="w-4 h-4" />
                             </button>
                             <button 
                                className="p-2 text-slate-300 hover:text-amber-500 transition-colors relative group/paid"
                                title="AI Enhanced Report (Paid)"
                             >
                                <Sparkles className="w-4 h-4" />
                                <Lock className="w-2 h-2 absolute top-1 right-1" />
                             </button>
                        </div>
                    )}

                    <button
                        onClick={() => onAction(item.id, 'schedule')}
                        className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors dark:hover:bg-slate-800"
                        title="Schedule"
                    >
                        <Calendar className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => onAction(item.id, 'nextAction')}
                        className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors dark:hover:bg-slate-800"
                        title="Act"
                    >
                        <ArrowRightCircle className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => onAction(item.id, 'complete')}
                        className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-green-600 transition-colors dark:hover:bg-slate-800"
                        title="Done"
                    >
                        <CheckCircle className="w-5 h-5" />
                    </button>
                    
                    <button
                        onClick={() => onAction(item.id, 'delete')}
                        className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-red-500 transition-colors dark:hover:bg-slate-800"
                        title="Delete"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
                </div>
            );
            })}
        </div>
      )}
    </div>
  );
};

export default Inbox;