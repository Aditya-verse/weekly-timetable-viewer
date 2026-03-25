import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, Star, Pencil, Plus } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const EventModal = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    input,
    setInput,
    validationError,
    setValidationError,
    days,
    theme,
    addEvent,
    editingId,
    cancelEdit
  } = useContext(AppContext);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => editingId ? cancelEdit() : setIsModalOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg bg-[var(--bg)] rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--card-border)] overflow-y-auto max-h-[90vh] scrollbar-hide"
      >
        <div className="flex justify-between items-center mb-6 sm:mb-8 sticky top-0 bg-[var(--bg)] z-10 pt-2 pb-4 border-b border-[var(--card-border)]">
          <h3 className="text-lg sm:text-xl font-black uppercase tracking-widest">{editingId ? 'Edit Objective' : 'New Objective'}</h3>
          <button onClick={() => editingId ? cancelEdit() : setIsModalOpen(false)} className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 sm:space-y-8 pb-4">
          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Task Description</label>
            <input 
              type="text" 
              value={input.task}
              onChange={(e) => {
                setInput({...input, task: e.target.value});
                if (validationError) setValidationError(null);
              }}
              placeholder="What needs to be done?"
              className={`w-full bg-[var(--card-bg)] border p-3 sm:p-4 rounded-2xl text-base sm:text-lg outline-none transition-all ${
                validationError && !input.task.trim() ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-[var(--card-border)] focus:border-blue-500'
              }`}
            />
            <AnimatePresence>
              {validationError && !input.task.trim() && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[9px] sm:text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1 mt-1"
                >
                  <AlertCircle size={10} /> {validationError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Category Orbit</label>
            <div className="flex flex-wrap gap-2">
              {['Work', 'Personal', 'Health', 'Study'].map(cat => {
                const colors = {
                  Work: 'bg-blue-600 border-blue-600',
                  Personal: 'bg-purple-600 border-purple-600',
                  Health: 'bg-green-600 border-green-600',
                  Study: 'bg-amber-600 border-amber-600'
                };
                return (
                  <button
                    key={cat}
                    onClick={() => setInput({...input, category: cat})}
                    className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold transition-all border ${
                      input.category === cat 
                      ? `${colors[cat]} text-white scale-105 shadow-lg` 
                      : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--muted)]'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Orbital Day</label>
            <div className="flex flex-wrap gap-2">
              {days.map(d => (
                <button
                  key={d}
                  onClick={() => setInput({...input, day: d})}
                  className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold transition-all border ${input.day === d ? 'bg-blue-600 border-blue-600 text-white scale-105' : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)]'}`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Orbital Time</label>
            <div className="flex flex-col gap-2 sm:gap-3 bg-[var(--card-bg)] p-3 sm:p-4 rounded-2xl border border-[var(--card-border)]">
              <div className="flex gap-2 p-1 bg-[var(--bg)] rounded-xl border border-[var(--card-border)] overflow-x-auto scrollbar-hide snap-x">
                {Array.from({length: 24}).map((_, i) => {
                  const hourStr = i.toString().padStart(2, '0');
                  const currentHour = input.time ? input.time.split(':')[0] : '09';
                  const isSelected = currentHour === hourStr;
                  return (
                    <button
                      key={hourStr}
                      onClick={() => {
                        const min = input.time ? input.time.split(':')[1] : '00';
                        setInput({...input, time: `${hourStr}:${min}`});
                        if (validationError) setValidationError(null);
                      }}
                      className={`snap-center flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg' : 'text-[var(--muted)] hover:bg-[var(--card-bg)] hover:text-[var(--text)]'}`}
                    >
                      {hourStr}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2 p-1 bg-[var(--bg)] rounded-xl border border-[var(--card-border)]">
                {['00', '15', '30', '45'].map(minStr => {
                  const currentMin = input.time ? input.time.split(':')[1] : '00';
                  const isSelected = currentMin === minStr;
                  return (
                    <button
                      key={minStr}
                      onClick={() => {
                        const hr = input.time ? input.time.split(':')[0] : '09';
                        setInput({...input, time: `${hr}:${minStr}`});
                        if (validationError) setValidationError(null);
                      }}
                      className={`flex-1 py-2 sm:py-3 rounded-lg text-sm font-bold transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg' : 'text-[var(--muted)] hover:bg-[var(--card-bg)] hover:text-[var(--text)]'}`}
                    >
                      :{minStr}
                    </button>
                  )
                })}
              </div>
            </div>
            <AnimatePresence>
              {validationError && !input.time && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[9px] sm:text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1 mt-1"
                >
                  <AlertCircle size={10} /> {validationError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Sub-tasks (Optional)</label>
              <button 
                onClick={() => setInput({...input, subtasks: [...input.subtasks, { id: Date.now(), text: '', completed: false }] })}
                className="text-[10px] font-bold text-[var(--text)] hover:text-blue-500 flex items-center gap-1 bg-[var(--card-bg)] px-2 py-1 rounded border border-[var(--card-border)] transition-colors"
              >
                <Plus size={12} /> Add Step
              </button>
            </div>
            {input.subtasks.map((st, index) => (
              <div key={st.id} className="flex items-center gap-2">
                <input 
                  type="text"
                  value={st.text}
                  placeholder={`Step ${index + 1}`}
                  onChange={(e) => {
                    const newSub = [...input.subtasks];
                    newSub[index].text = e.target.value;
                    setInput({...input, subtasks: newSub});
                  }}
                  className="flex-1 bg-[var(--card-bg)] border border-[var(--card-border)] p-2 sm:p-3 rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500 transition-all text-[var(--text)]"
                />
                <button 
                  onClick={() => setInput({...input, subtasks: input.subtasks.filter(s => s.id !== st.id)})}
                  className="p-2 sm:p-3 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                   <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setInput({...input, priority: !input.priority})}
            className={`w-full p-3 sm:p-4 rounded-2xl border flex items-center justify-center gap-3 transition-all font-bold ${
              input.priority 
              ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
              : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)]'
            }`}
          >
            <Star size={20} fill={input.priority ? "currentColor" : "none"} />
            {input.priority ? 'High Priority' : 'Normal Priority'}
          </button>

          <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--card-border)]">
            {editingId && (
              <button 
                onClick={cancelEdit}
                className="flex-1 border border-[var(--card-border)] text-[var(--muted)] hover:bg-[var(--card-bg)] hover:text-[var(--text)] p-4 sm:p-5 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all text-sm sm:text-base cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button 
              onClick={addEvent}
              className="flex-[2] bg-blue-600 text-white p-4 sm:p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {editingId ? <Pencil size={18} /> : null}
              {editingId ? 'Update' : 'Confirm Objective'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventModal;
