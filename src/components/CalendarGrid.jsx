import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppContext } from '../context/AppContext';

const CalendarGrid = () => {
  const { weekDates, sortedEvents } = useContext(AppContext);

  return (
    <motion.main
      key="calendar"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 min-h-[400px] sm:min-h-[600px] w-full"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-2xl font-black uppercase tracking-widest">Weekly Calendar</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3 text-[7px] sm:text-xs font-bold text-[var(--muted)] border border-[var(--card-border)] p-2 rounded-xl">
          <div className="flex items-center gap-1.5">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-blue-500" /> Work
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-purple-500" /> Personal
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-green-500" /> Health
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-500" /> Study
          </div>
          <div className="ml-2 pl-2 border-l border-[var(--card-border)] flex items-center gap-1.5">
            <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded bg-amber-500" /> Priority
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3 lg:gap-4">
        {weekDates.map(dayInfo => (
          <div key={dayInfo.name} className="space-y-2 sm:space-y-3 lg:space-y-4">
            <div className="text-center py-2 border-b border-[var(--card-border)] flex flex-col">
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">{dayInfo.name.slice(0, 3)}</span>
              <span className="text-[7px] sm:text-[8px] font-bold text-[var(--muted)] opacity-40">{dayInfo.date}</span>
            </div>
            <div className="space-y-1 sm:space-y-2">
              {sortedEvents(dayInfo.name).slice(0, 5).map(event => (
                <div 
                  key={event.id}
                  className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border text-[7px] sm:text-[10px] font-bold transition-all cursor-default group/cal-item relative overflow-hidden ${
                    event.priority 
                    ? 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                    : 'border-[var(--item-border)]'
                  } ${
                    event.category === 'Work' ? 'bg-blue-500/5 text-blue-600 dark:text-blue-400' :
                    event.category === 'Personal' ? 'bg-purple-500/5 text-purple-600 dark:text-purple-400' :
                    event.category === 'Health' ? 'bg-green-500/5 text-green-600 dark:text-green-400' :
                    event.category === 'Study' ? 'bg-amber-500/5 text-amber-600 dark:text-amber-400' :
                    'bg-[var(--item-bg)] text-[var(--muted)]'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      event.priority ? 'bg-amber-500' : 
                      event.isExternal ? 'bg-green-500' :
                      event.category === 'Personal' ? 'bg-purple-500' :
                      event.category === 'Health' ? 'bg-green-500' :
                      event.category === 'Study' ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`} />
                    <span className="opacity-70 flex-shrink-0">{event.time}</span>
                  </div>
                  <div className="truncate">{event.task}</div>
                  
                  {/* Calendar view mini-progress bar for subtasks */}
                  {event.subtasks && event.subtasks.length > 0 && (
                    <div className="w-full bg-[var(--bg)] h-0.5 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${(event.subtasks.filter(s => s.completed).length / event.subtasks.length) * 100}%` }}
                      />
                    </div>
                  )}
                  {event.priority && (
                    <div className="absolute -right-2 -bottom-2 w-6 h-6 rounded-full bg-amber-500/10 blur-sm" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.main>
  );
};

export default CalendarGrid;
