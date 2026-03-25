import React, { useContext } from 'react';
import { Target, CheckCircle2, Flame, BarChart3 } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const AnalyticsPanel = () => {
  const { events } = useContext(AppContext);

  const totalEvents = events.length;
  const completedEvents = events.filter(e => {
    if (e.subtasks && e.subtasks.length > 0) return e.subtasks.every(s => s.completed);
    return !!e.completed;
  }).length;

  const progress = totalEvents === 0 ? 0 : Math.round((completedEvents / totalEvents) * 100);

  return (
    <div className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl mb-6 flex flex-col md:flex-row items-center justify-between gap-6 border-blue-500/20">
      <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[var(--card-border)]" />
            <circle 
              cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
              className="text-blue-500 transition-all duration-1000 ease-out"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col text-[var(--text)]">
            <span className="text-sm sm:text-base font-black">{progress}%</span>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <BarChart3 size={16} />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Weekly Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text)]">Mission Progress</h2>
          <p className="text-[10px] sm:text-xs text-[var(--muted)] font-bold uppercase tracking-widest mt-1">
            {completedEvents} of {totalEvents} Objectives Completed
          </p>
        </div>
      </div>

      <div className="flex gap-3 sm:gap-4 w-full md:w-auto overflow-x-auto scrollbar-hide pb-2 md:pb-0">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-3 rounded-2xl flex-1 min-w-[100px] flex flex-col items-center text-center gap-2 transition-transform hover:scale-105">
          <Target className="text-amber-500" size={20} />
          <span className="text-lg sm:text-xl font-black text-[var(--text)]">{events.filter(e => e.priority).length}</span>
          <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-[var(--muted)]">Priority</span>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-3 rounded-2xl flex-1 min-w-[100px] flex flex-col items-center text-center gap-2 transition-transform hover:scale-105">
          <CheckCircle2 className="text-green-500" size={20} />
          <span className="text-lg sm:text-xl font-black text-[var(--text)]">{completedEvents}</span>
          <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-[var(--muted)]">Done</span>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-3 rounded-2xl flex-1 min-w-[100px] flex flex-col items-center text-center gap-2 transition-transform hover:scale-105">
          <Flame className="text-orange-500" size={20} />
          <span className="text-lg sm:text-xl font-black text-[var(--text)]">{totalEvents - completedEvents}</span>
          <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-[var(--muted)]">Pending</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
