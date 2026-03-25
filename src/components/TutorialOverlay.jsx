import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const TutorialOverlay = () => {
  const { tutorialStep, setTutorialStep, tutorialSteps } = useContext(AppContext);

  if (tutorialStep === null) return null;

  return (
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
              onClick={() => setTutorialStep(prev => prev > 0 ? prev - 1 : null)}
              className="p-2 text-slate-400 hover:text-slate-600"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => {
                if (tutorialStep < tutorialSteps.length - 1) {
                  setTutorialStep(prev => prev + 1);
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
  );
};

export default TutorialOverlay;
