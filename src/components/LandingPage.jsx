import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, HelpCircle, Download, Sun, Moon, Calendar, Clock, Layout } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const LandingPage = () => {
  const { setIsStarted, theme, toggleTheme, startTutorial } = useContext(AppContext);

  return (
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
          <button
            onClick={() => setIsStarted(true)}
            className="w-full sm:w-auto group relative px-6 sm:px-10 py-3 sm:py-4 bg-[var(--text)] text-[var(--bg)] rounded-2xl font-bold text-sm sm:text-base overflow-hidden transition-all hover:opacity-90 active:scale-95 shadow-xl hover:shadow-2xl"
          >
            <span className="relative z-10 flex items-center justify-center sm:justify-start gap-3">
              Get Started 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform hidden sm:inline" />
            </span>
          </button>

          <button
            onClick={startTutorial}
            className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base border border-blue-400/30 bg-blue-500/5 hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]"
          >
            <HelpCircle size={18} /> Quick Tour
          </button>
          
          <a
            href="/WeeklyOrb.apk"
            download="WeeklyOrb.apk"
            className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base border border-green-400/30 bg-green-500/5 hover:bg-green-500/10 text-green-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]"
          >
            <Download size={18} /> Get App
          </a>
        </div>
      </motion.div>

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
  );
};

export default LandingPage;
