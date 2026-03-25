import React, { useContext } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { AppProvider, AppContext } from './context/AppContext';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import AnalyticsPanel from './components/AnalyticsPanel';
import TimetableGrid from './components/TimetableGrid';
import CalendarGrid from './components/CalendarGrid';
import EventModal from './components/EventModal';
import DeleteModal from './components/DeleteModal';
import TutorialOverlay from './components/TutorialOverlay';
import PolicyModal from './components/PolicyModal';
import Footer from './components/Footer';

const AppContent = () => {
  const { isStarted, theme, viewMode } = useContext(AppContext);

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
          <LandingPage />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 pt-10 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex-1 flex flex-col relative z-10 w-full pb-32 sm:pb-0"
          >
            <Header />
            <AnalyticsPanel />

            <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
              <AnimatePresence mode="wait">
                {viewMode === 'timetable' ? (
                  <TimetableGrid />
                ) : (
                  <CalendarGrid />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EventModal />
      <DeleteModal />
      <TutorialOverlay />
      <PolicyModal />
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
