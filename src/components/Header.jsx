import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Plus, Star, List, Calendar as CalendarIcon, Shield, RefreshCw, Download, Moon, Sun, Layout, Pencil, X } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Header = () => {
  const {
    setIsStarted,
    tutorialStep,
    input,
    setInput,
    validationError,
    setValidationError,
    days,
    addEvent,
    setIsModalOpen,
    viewMode,
    setViewMode,
    isGoogleConnected,
    fetchGoogleEvents,
    connectGoogle,
    isSyncing,
    exportToPDF,
    theme,
    toggleTheme,
    editingId,
    cancelEdit
  } = useContext(AppContext);

  return (
    <header className={`mb-6 sm:mb-8 lg:mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 lg:gap-8 ${tutorialStep === 0 ? 'tutorial-highlight p-4 bg-[var(--bg)]' : ''}`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div 
          onClick={() => setIsStarted(false)}
          className="cursor-pointer group"
        >
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter group-hover:text-blue-500 transition-colors">
            Orbit<span className="text-blue-500">.</span>
          </h1>
        </div>
        <div className="h-6 w-[1px] bg-[var(--card-border)]" />
        <div className="flex flex-col">
          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">System Active</span>
          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-blue-500">v2.1.0</span>
        </div>
      </div>
      
      {/* Desktop Input Bar */}
      <div className="hidden lg:flex glass-card p-1.5 rounded-2xl gap-2 items-center flex-1 max-w-4xl">
        <div className={`flex-1 flex flex-col relative ${tutorialStep === 1 ? 'tutorial-highlight bg-[var(--bg)] p-2' : ''}`}>
          <input 
            type="text" 
            value={input.task}
            onChange={(e) => {
              setInput({...input, task: e.target.value});
              if (validationError) setValidationError(null);
            }}
            placeholder="What's the next objective?"
            className="w-full bg-transparent py-2.5 px-4 text-[var(--text)] placeholder-[var(--muted)] outline-none text-sm font-medium"
          />
          <AnimatePresence>
            {validationError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-4 mt-1 text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1"
              >
                <AlertCircle size={10} /> {validationError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className={`flex items-center gap-2 px-2 ${tutorialStep === 2 ? 'tutorial-highlight bg-[var(--bg)] p-2' : ''}`}>
          <div className="flex gap-1 bg-[var(--bg)] p-1 rounded-xl border border-[var(--card-border)]">
            {days.map(d => (
              <button
                key={d}
                onClick={() => setInput({...input, day: d})}
                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${input.day === d ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-600/30' : 'text-[var(--muted)] hover:bg-[var(--card-bg)]'}`}
              >
                {d[0]}
              </button>
            ))}
          </div>

          <input 
            type="time" 
            value={input.time}
            onChange={(e) => setInput({...input, time: e.target.value})}
            className={`bg-[var(--bg)] border border-[var(--card-border)] text-[var(--muted)] px-3 py-2 rounded-xl outline-none text-xs font-bold ${theme === 'dark' ? 'invert brightness-200' : ''}`}
          />

          <button 
            onClick={() => setInput({...input, priority: !input.priority})}
            className={`p-2 rounded-xl border transition-all ${tutorialStep === 3 ? 'tutorial-highlight bg-[var(--bg)]' : ''} ${input.priority ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-[var(--bg)] border-[var(--card-border)] text-[var(--muted)]'}`}
          >
            <Star size={16} fill={input.priority ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={addEvent}
            className={`bg-blue-600 text-white hover:bg-blue-500 font-bold px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-blue-600/20 ${tutorialStep === 4 ? 'tutorial-highlight' : ''}`}
          >
            {editingId ? <Pencil size={16} /> : <Plus size={16} />}
            <span className="text-xs uppercase tracking-widest">{editingId ? 'Save' : 'Add'}</span>
          </button>
          
          {editingId && (
            <button 
              onClick={cancelEdit}
              className="p-2.5 rounded-xl border border-[var(--card-border)] text-red-500 hover:bg-red-500/10 transition-all font-bold group"
              title="Cancel Edit"
            >
              <X size={16} className="group-hover:scale-110 transition-transform"/>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Add Button */}
      <div className="lg:hidden fixed bottom-24 right-6 z-[90]">                
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/40 active:scale-90 transition-transform"
        >
          {editingId ? <Pencil size={28} /> : <Plus size={28} />}
        </button>
      </div>

      {/* Tablet/Desktop Controls */}
      <div className="hidden lg:flex items-center gap-3 xl:gap-4">
        <div className="flex items-center gap-1 glass-card p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('timetable')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'timetable' ? 'bg-blue-600 text-white' : 'text-[var(--muted)] hover:bg-white/10'}`}
            title="Timetable View"
          >
            <List size={18} />
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-[var(--muted)] hover:bg-white/10'}`}
            title="Calendar View"
          >
            <CalendarIcon size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 glass-card p-1 rounded-xl">
          <button 
            onClick={isGoogleConnected ? fetchGoogleEvents : connectGoogle}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 ${isGoogleConnected ? 'text-green-500' : 'text-[var(--muted)] hover:text-blue-500'}`}
            title={isGoogleConnected ? "Sync Google Calendar" : "Connect Google Calendar"}
          >
            {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <Shield size={18} />}
            <span className="text-[10px] font-bold uppercase tracking-widest hidden xl:inline">
              {isGoogleConnected ? "Synced" : "Sync"}
            </span>
          </button>
          <div className="w-[1px] h-4 bg-[var(--card-border)]" />
          <button 
            onClick={exportToPDF}
            className="p-2 text-[var(--muted)] hover:text-blue-500 transition-colors"
            title="Export PDF"
          >
            <Download size={18} />
          </button>
        </div>

        <div className="hidden xl:block text-right">
          <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">Current Session</div>
          <div className="text-[10px] font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2 sm:p-3 rounded-xl glass-card hover:scale-110 transition-all active:scale-95"
        >
          {theme === 'light' ? <Moon size={18} className="text-slate-600" /> : <Sun size={18} className="text-yellow-400" />}
        </button>
        <button 
          onClick={() => setIsStarted(false)}
          className="p-2 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <Layout size={18} />
        </button>
      </div>

      {/* Mobile Controls */}
      <div className="lg:hidden flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg glass-card hover:scale-110 transition-all active:scale-95"
          >
            {theme === 'light' ? <Moon size={16} className="text-slate-600" /> : <Sun size={16} className="text-yellow-400" />}
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'timetable' ? 'calendar' : 'timetable')}
            className="p-2 rounded-lg glass-card text-[var(--muted)] hover:text-blue-500 transition-colors"
            title="Toggle View"
          >
            {viewMode === 'timetable' ? <CalendarIcon size={16} /> : <List size={16} />}
          </button>
          <button 
            onClick={isGoogleConnected ? fetchGoogleEvents : connectGoogle}
            className={`p-2 rounded-lg glass-card transition-all ${isGoogleConnected ? 'text-green-500' : 'text-[var(--muted)] hover:text-blue-500'}`}
            title={isGoogleConnected ? "Sync Calendar" : "Connect"}
          >
            {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Shield size={16} />}
          </button>
        </div>
        <button 
          onClick={exportToPDF}
          className="p-2 rounded-lg glass-card text-[var(--muted)] hover:text-blue-500 transition-colors"
          title="Export PDF"
        >
          <Download size={16} />
        </button>
      </div>
    </header>
  );
};

export default Header;
