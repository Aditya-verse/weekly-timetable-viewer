import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Pencil, CheckCircle2, Circle } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const TimetableGrid = () => {
  const { weekDates, sortedEvents, events, googleEvents, setDeleteConfirmId, startEdit, toggleSubtask, toggleEventCompletion, updateEventDay } = useContext(AppContext);

  return (
    <motion.main 
      key="timetable"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex lg:grid lg:grid-cols-7 gap-3 sm:gap-4 min-w-full lg:min-w-0"
    >
      {weekDates.map((dayInfo) => (
        <div 
          key={dayInfo.name} 
          className="flex flex-col min-w-[260px] sm:min-w-[280px] lg:min-w-0 gap-3 sm:gap-4 group/day"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(e) => {
            e.preventDefault();
            const eventId = e.dataTransfer.getData('text/plain');
            if (eventId) {
              updateEventDay(Number(eventId), dayInfo.name);
            }
          }}
        >
          <div className="px-2 sm:px-3 flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] ${
                new Date().toLocaleDateString('en-US', { weekday: 'long' }) === dayInfo.name 
                ? 'text-blue-500' : 'text-[var(--muted)]'
              }`}>
                {dayInfo.name}
              </h2>
              <span className="text-[8px] sm:text-[10px] font-bold text-[var(--muted)] opacity-50">
                {dayInfo.month} {dayInfo.date}
              </span>
            </div>
            {new Date().toLocaleDateString('en-US', { weekday: 'long' }) === dayInfo.name && 
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            }
          </div>

          <div className="flex-1 p-2 sm:p-3 space-y-2 sm:space-y-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] group-hover/day:bg-[var(--card-bg)]/80 transition-colors">
            <AnimatePresence mode="popLayout">
              {sortedEvents(dayInfo.name).map(event => (
                <motion.div 
                  key={event.id} 
                  layout
                  draggable={!event.isExternal}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', event.id.toString());
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`group/item p-3 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                    event.priority 
                    ? 'shadow-[0_0_20px_rgba(245,158,11,0.05)] ' 
                    : ''
                  } ${
                    event.isExternal ? 'bg-blue-500/5 border-blue-500/20' :
                    event.category === 'Work' ? 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40' :
                    event.category === 'Personal' ? 'bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40' :
                    event.category === 'Health' ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40' :
                    event.category === 'Study' ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' :
                    'bg-[var(--item-bg)] border-[var(--item-border)] hover:border-[var(--muted)]'
                  }`}
                >
                  {event.priority && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-amber-600" />
                  )}
                  <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          event.priority ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
                          event.isExternal ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                          event.category === 'Work' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                          event.category === 'Personal' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' :
                          event.category === 'Health' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                          event.category === 'Study' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                          'bg-blue-500'
                        }`} />
                        <span className={`text-[8px] sm:text-[10px] font-black tracking-widest uppercase flex-shrink-0 ${
                          event.priority ? 'text-amber-500' : 
                          event.isExternal ? 'text-green-500' :
                          event.category === 'Personal' ? 'text-purple-500' :
                          event.category === 'Health' ? 'text-green-500' :
                          event.category === 'Study' ? 'text-amber-500' :
                          'text-blue-500'
                        }`}>
                          {event.time}
                        </span>
                      </div>
                      {event.priority && (
                        <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-widest text-amber-500/60">Priority Mission</span>
                      )}
                      {event.isExternal && (
                        <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-widest text-green-500/60">Google Calendar</span>
                      )}
                    </div>
                    {!event.isExternal && (
                      <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0 relative z-20">
                        <button 
                          onClick={(e) => { e.stopPropagation(); startEdit(event); }}
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 text-[var(--muted)] hover:text-blue-500 transition-all"
                          title="Edit Objective"
                        >
                          <Pencil size={12} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(event.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500 transition-all"
                          title="Delete Objective"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold leading-relaxed text-[var(--text)] group-hover/item:translate-x-1 transition-transform break-words relative z-20">
                    {event.task}
                  </div>
                  
                  {/* Subtasks Render */}
                  {event.subtasks && event.subtasks.length > 0 && (
                    <div className="mt-3 space-y-1.5 sm:space-y-2 relative z-20">
                      {event.subtasks.map(st => (
                        <div 
                          key={st.id} 
                          onClick={(e) => { e.stopPropagation(); toggleSubtask(event.id, st.id); }}
                          className={`flex items-start gap-2 p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all border border-transparent ${
                            st.completed ? 'opacity-50 hover:opacity-80' : 'bg-[var(--card-bg)] hover:border-[var(--card-border)]'
                          }`}
                        >
                          <div className={`mt-0.5 flex-shrink-0 transition-colors ${st.completed ? 'text-green-500' : 'text-blue-500'}`}>
                            {st.completed ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                          </div>
                          <span className={`text-[10px] sm:text-xs font-medium leading-tight ${st.completed ? 'line-through text-[var(--muted)]' : 'text-[var(--text)]'}`}>
                            {st.text}
                          </span>
                        </div>
                      ))}
                      <div className="w-full bg-[var(--bg)] h-1 rounded-full mt-2 overflow-hidden opacity-50">
                        <div 
                          className="h-full bg-green-500 transition-all duration-500"
                          style={{ width: `${(event.subtasks.filter(s => s.completed).length / event.subtasks.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className={`absolute -right-4 -bottom-4 w-12 h-12 rounded-full border opacity-20 group-hover/item:scale-150 transition-transform duration-700 z-0 ${
                    event.category === 'Work' ? 'border-blue-500 bg-blue-500/10' :
                    event.category === 'Personal' ? 'border-purple-500 bg-purple-500/10' :
                    event.category === 'Health' ? 'border-green-500 bg-green-500/10' :
                    event.category === 'Study' ? 'border-amber-500 bg-amber-500/10' :
                    'border-white/20'
                  }`} />
                </motion.div>
              ))}
            </AnimatePresence>
            {events.filter(e => e.day === dayInfo.name).length === 0 && googleEvents.filter(e => e.day === dayInfo.name).length === 0 && (
              <div className="h-full flex items-center justify-center opacity-10">
                <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-[1em] vertical-text text-[var(--muted)]">Empty</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </motion.main>
  );
};

export default TimetableGrid;
