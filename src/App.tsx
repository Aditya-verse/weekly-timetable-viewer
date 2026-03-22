import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Sparkles, ArrowRight, Calendar, Clock, Layout, Sun, Moon, Star, X, ChevronDown, HelpCircle, AlertCircle, Check, ChevronLeft, ChevronRight, Download, Calendar as CalendarIcon, List, Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Event {
  id: number | string;
  task: string;
  day: string;
  time: string;
  priority: boolean;
  isExternal?: boolean;
}

interface GoogleEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

const TimetableApp = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'timetable' | 'calendar'>('timetable');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
   const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('orbit-theme');
    return saved || 'dark';
  });
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('orbit-timetable');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState({ task: '', day: 'Monday', time: '09:00', priority: false });
  const [googleEvents, setGoogleEvents] = useState<Event[]>([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Dynamic Dates Calculation
  const getWeekDates = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return {
        name: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
        date: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }),
        fullDate: date
      };
    });
  };

  const weekDates = getWeekDates();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsGoogleConnected(true);
        fetchGoogleEvents();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchGoogleEvents = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/calendar/events');
      if (response.ok) {
        const data: GoogleEvent[] = await response.json();
        const mappedEvents: Event[] = data.map(ge => {
          const startDate = new Date(ge.start.dateTime || ge.start.date || '');
          const dayName = startDate.toLocaleDateString('en-US', { weekday: 'long' });
          const timeStr = startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          
          return {
            id: ge.id,
            task: ge.summary,
            day: dayName,
            time: timeStr,
            priority: false,
            isExternal: true
          };
        });
        setGoogleEvents(mappedEvents);
        setIsGoogleConnected(true);
      }
    } catch (error) {
      console.error("Failed to fetch Google events", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const connectGoogle = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      const { url } = await response.json();
      window.open(url, 'google_oauth', 'width=600,height=700');
    } catch (error) {
      console.error("Failed to get auth URL", error);
    }
  };

  useEffect(() => {
    fetchGoogleEvents();
  }, []);

  useEffect(() => {
    localStorage.setItem('orbit-timetable', JSON.stringify(events));
  }, [events]);

   useEffect(() => {
    localStorage.setItem('orbit-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const addEvent = () => {
    if (!input.task.trim()) {
      setValidationError('Please fill the objective');
      return;
    }
    if (!input.time) {
      setValidationError('Please set a time');
      return;
    }

    setEvents([...events, { ...input, id: Date.now() }]);
    setInput({ ...input, task: '', priority: false });
    setValidationError(null);
    setIsModalOpen(false);
    if (tutorialStep === 4) setTutorialStep(null);
  };

  const confirmDelete = (id: number) => {
    setEvents(events.filter(e => e.id !== id));
    setDeleteConfirmId(null);
  };
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const sortedEvents = (day: string) => {
    const allEvents = [...events, ...googleEvents];
    return allEvents
      .filter(e => e.day === day)
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority ? -1 : 1;
        return a.time.localeCompare(b.time);
      });
  };

  const startTutorial = () => {
    setIsStarted(true);
    setTutorialStep(0);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Weekly Orbit Timetable', 14, 22);
    
    const tableData = days.map(day => {
      const dayEvents = sortedEvents(day);
      return dayEvents.map(e => [day, e.time, e.task, e.priority ? 'High' : 'Normal']);
    }).flat();

    autoTable(doc, {
      startY: 30,
      head: [['Day', 'Time', 'Task', 'Priority']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save('weekly-orbit.pdf');
  };

  const tutorialSteps = [
    { title: "Welcome to Orbit", text: "Let's align your life with precision. This is your mission control.", target: "header" },
    { title: "The Mission", text: "Start by defining your next objective here.", target: "input-task" },
    { title: "Crazy Timing", text: "Use our orbital selectors to set the perfect time and day.", target: "input-selectors" },
    { title: "Priority Orbit", text: "Mark critical missions with a star to keep them in focus.", target: "input-priority" },
    { title: "Launch", text: "Add it to your weekly orbit and watch your productivity soar.", target: "input-add" }
  ];

  return (
<div 
  className={`min-h-[100dvh] bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-blue-500/30 overflow-x-hidden relative flex flex-col transition-colors duration-300 ${theme}`}
  style={{ paddingTop: 'max(env(safe-area-inset-top), 32px)' }}
>
  <style>{`
        :root {
          --bg: #0a0e27;
          --text: #ffffff;
          --muted: #8b92b6;
          --card-bg: #1a2456;
          --card-border: #2a3f7f;
          --item-bg: #111d3d;
          --item-border: #1a2a5a;
          --glass-bg: rgba(26, 36, 86, 0.4);
        }
        
        :root.light {
          --bg: #f8f9ff;
          --text: #1a1f3a;
          --muted: #6b7494;
          --card-bg: #e8ecf8;
          --card-border: #d0d9f0;
          --item-bg: #f0f3fb;
          --item-border: #dce4f0;
          --glass-bg: rgba(232, 236, 248, 0.4);
        }

        .atmosphere {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 80%, rgba(30, 144, 255, 0.03) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .glass-card {
          background: var(--glass-bg);
          border: 1px solid var(--card-border);
          backdrop-filter: blur(10px);
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          letter-spacing: 0.5em;
        }

        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }

        @keyframes pulse-border {
          0%, 100% { border-color: rgb(59, 130, 246); }
          50% { border-color: rgb(147, 197, 253); }
        }

        @media (max-width: 768px) {
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>

      <div className="atmosphere" />
      
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center relative z-10"
          >
               <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
              <button 
                onClick={toggleTheme}
                className="p-3 rounded-2xl glass-card hover:scale-110 transition-all active:scale-95 shadow-sm"
              >
                {theme === 'light' ? <Moon size={20} className="text-slate-600" /> : <Sun size={20} className="text-yellow-400" />}
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl w-full"
            >
             <div className="mt-6 sm:mt-10 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 sm:mb-8">
  <Sparkles className="w-3 h-3 text-blue-500" />
  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-blue-500">
    The Modern Standard
  </span>
</div>

              <h1 className="text-4xl sm:text-6xl lg:text-9xl font-black tracking-tight leading-[0.9] mb-6 sm:mb-8 px-2">
                Weekly<span className="text-blue-500">Orbit.</span>
              </h1>

              <p className="max-w-xl mx-auto text-base sm:text-lg lg:text-xl text-[var(--muted)] leading-relaxed mb-8 sm:mb-12 px-4">
                Align your life with precision. A high-performance 
                timetable engine built for the modern architect of time.
              </p>

             <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 w-full">

  {/* Get Started Button */}
  <button
    onClick={() => setIsStarted(true)}
    className="w-full sm:w-auto group relative px-6 sm:px-10 py-3 sm:py-4 bg-[var(--text)] text-[var(--bg)] rounded-2xl font-bold text-sm sm:text-base overflow-hidden transition-all hover:opacity-90 active:scale-95 shadow-xl hover:shadow-2xl"
  >
    <span className="relative z-10 flex items-center justify-center sm:justify-start gap-3">
      Get Started 
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform hidden sm:inline" />
    </span>
  </button>

  {/* Quick Tour Button (Glow Effect) */}
  <button
    onClick={startTutorial}
    className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base border border-blue-400/30 bg-blue-500/5 hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]"
  >
    <HelpCircle size={18} /> Quick Tour
  </button>
  {/* NEW: Download APK Button */}
<a
  href="/WeeklyOrb.apk"
  download="WeeklyOrb.apk"
  className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base border border-green-400/30 bg-green-500/5 hover:bg-green-500/10 text-green-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]"
>
  <Download size={18} /> Get App
</a>
</div>
</motion.div>


{/* ===== FEATURES SECTION (NO OVERLAP FIXED) ===== */}

<div className="mt-10 sm:mt-14 flex flex-wrap justify-center items-center gap-4 sm:gap-8 md:gap-16 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] px-4 text-center">

  <div className="flex items-center gap-2 hover:text-blue-500 transition-all duration-300">
    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" /> Weekly
  </div>

  <div className="flex items-center gap-2 hover:text-blue-500 transition-all duration-300">
    <Clock className="w-3 h-3 sm:w-4 sm:h-4" /> Precise
  </div>

  <div className="flex items-center gap-2 hover:text-blue-500 transition-all duration-300">
    <Layout className="w-3 h-3 sm:w-4 sm:h-4" /> Focused
  </div>

</div>
          </motion.div>
        ) : (
          <motion.div
  key="app"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="p-4 pt-10 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex-1 flex flex-col relative z-10 w-full pb-32 sm:pb-0"
>
            {/* Minimal Header */}
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

                <button 
                  onClick={addEvent}
                  className={`bg-blue-600 text-white hover:bg-blue-500 font-bold px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-blue-600/20 ${tutorialStep === 4 ? 'tutorial-highlight' : ''}`}
                >
                  <Plus size={16} />
                  <span className="text-xs uppercase tracking-widest">Add</span>
                </button>
              </div>

              {/* Mobile Add Button */}
{/* Mobile Add Button */}
<div className="lg:hidden fixed bottom-24 right-6 z-[90]">                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/40 active:scale-90 transition-transform"
                >
                  <Plus size={28} />
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

            {/* Content Area */}
            <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
              <AnimatePresence mode="wait">
                {viewMode === 'timetable' ? (
                  <motion.main 
                    key="timetable"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex lg:grid lg:grid-cols-7 gap-3 sm:gap-4 min-w-full lg:min-w-0"
                  >
                    {weekDates.map((dayInfo) => (
                      <div key={dayInfo.name} className="flex flex-col min-w-[260px] sm:min-w-[280px] lg:min-w-0 gap-3 sm:gap-4 group/day">
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
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className={`group/item p-3 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                                  event.priority 
                                  ? 'bg-amber-500/5 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]' 
                                  : event.isExternal
                                    ? 'bg-blue-500/5 border-blue-500/20'
                                    : 'bg-[var(--item-bg)] border-[var(--item-border)] hover:border-blue-500/30'
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
                                        'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                      }`} />
                                      <span className={`text-[8px] sm:text-[10px] font-black tracking-widest uppercase flex-shrink-0 ${
                                        event.priority ? 'text-amber-500' : 
                                        event.isExternal ? 'text-green-500' :
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
                                    <button 
                                      onClick={() => setDeleteConfirmId(event.id as number)}
                                      className="p-1.5 rounded-lg bg-red-500/0 hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500 transition-all opacity-0 group-hover/item:opacity-100 flex-shrink-0"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                                <div className="text-xs sm:text-sm font-semibold leading-relaxed text-[var(--text)] group-hover/item:translate-x-1 transition-transform break-words">
                                  {event.task}
                                </div>
                                
                                <div className="absolute -right-4 -bottom-4 w-12 h-12 rounded-full border border-white/5 group-hover/item:scale-150 transition-transform duration-700" />
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
                ) : (
                  <motion.main
                    key="calendar"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 min-h-[400px] sm:min-h-[600px] w-full"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8 mb-6 sm:mb-8">
                      <h2 className="text-lg sm:text-2xl font-black uppercase tracking-widest">Weekly Calendar</h2>
                      <div className="flex gap-3 sm:gap-4 text-[7px] sm:text-xs font-bold text-[var(--muted)]">
                        <div className="flex items-center gap-2">
                          <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-blue-500" /> Normal
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-amber-500" /> High Priority
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
                                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border text-[7px] sm:text-[10px] font-bold transition-all hover:scale-105 active:scale-95 cursor-default group/cal-item relative overflow-hidden ${
                                  event.priority 
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' 
                                  : event.isExternal
                                    ? 'bg-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400'
                                    : 'bg-[var(--item-bg)] border-[var(--item-border)] text-[var(--muted)] hover:text-[var(--text)]'
                                }`}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <div className={`w-1 h-1 rounded-full flex-shrink-0 ${
                                    event.priority ? 'bg-amber-500' : 
                                    event.isExternal ? 'bg-green-500' :
                                    'bg-blue-500'
                                  }`} />
                                  <span className="opacity-60 flex-shrink-0">{event.time}</span>
                                </div>
                                <div className="truncate">{event.task}</div>
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
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Input Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-[var(--bg)] rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--card-border)]"
            >
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-widest">New Objective</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-[var(--muted)] hover:text-[var(--text)]">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
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

                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Orbital Time</label>
                  <input 
                    type="time" 
                    value={input.time}
                    onChange={(e) => {
                      setInput({...input, time: e.target.value});
                      if (validationError) setValidationError(null);
                    }}
                    className={`w-full bg-[var(--card-bg)] border p-3 sm:p-4 rounded-2xl outline-none text-base sm:text-lg font-bold transition-all ${
                      validationError && !input.time ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-[var(--card-border)] focus:border-blue-500'
                    } ${theme === 'dark' ? 'invert brightness-200' : ''}`}
                  />
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

                <button 
                  onClick={addEvent}
                  className="w-full bg-blue-600 text-white p-4 sm:p-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-transform text-sm sm:text-base"
                >
                  Confirm Objective
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-[var(--bg)] rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-500/20"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 sm:w-16 h-14 sm:h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                  <AlertCircle size={28} />
                </div>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-widest">Abort Mission?</h3>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  Are you sure you want to remove this objective from your orbit? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full mt-4">
                  <button 
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm border border-[var(--card-border)] hover:bg-[var(--card-bg)] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => confirmDelete(deleteConfirmId)}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {tutorialStep !== null && (
          <div className="fixed inset-0 z-[150] pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="pointer-events-auto w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-blue-500 animate-pulse-border"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-500 text-white text-[9px] sm:text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                    Step {tutorialStep + 1} of {tutorialSteps.length}
                  </div>
                  <button onClick={() => setTutorialStep(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                </div>
                <h3 className="text-lg sm:text-xl font-black mb-2 text-slate-900 dark:text-white">{tutorialSteps[tutorialStep].title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 sm:mb-8">
                  {tutorialSteps[tutorialStep].text}
                </p>
                <div className="flex justify-between items-center gap-3">
                  <button 
                    onClick={() => setTutorialStep(prev => prev! > 0 ? prev! - 1 : null)}
                    className="p-2 text-slate-400 hover:text-slate-600"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => {
                      if (tutorialStep < tutorialSteps.length - 1) {
                        setTutorialStep(prev => prev! + 1);
                      } else {
                        setTutorialStep(null);
                      }
                    }}
                    className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-blue-700 transition-all"
                  >
                    {tutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--card-border)] bg-[var(--glass-bg)] backdrop-blur-sm py-8 sm:py-12 px-4 sm:px-6 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8 sm:gap-12">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-black tracking-tighter">
              Orbit<span className="text-blue-500">.</span>
            </h3>
            <p className="text-[8px] sm:text-xs font-bold uppercase tracking-widest text-[var(--muted)] max-w-xs leading-relaxed">
              The high-performance engine for the modern architect of time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">Support</h4>
              <div className="space-y-2">
                <a href="mailto:support.mindcraft@gmail.com" className="block text-xs sm:text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                  support.mindcraft@gmail.com
                </a>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">Location</h4>
              <p className="text-xs sm:text-sm text-[var(--muted)]">
                Maharashtra, India
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[var(--card-border)] flex flex-col sm:flex-row justify-between items-center gap-4 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
          <div>© 2026 Weekly Orbit. All rights reserved.</div>
          <div className="flex gap-8">
            <span className="hover:text-[var(--text)] cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-[var(--text)] cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TimetableApp;