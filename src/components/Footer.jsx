import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Footer = () => {
  const { setPolicyType } = useContext(AppContext);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-[var(--card-border)] bg-[var(--bg)]/80 backdrop-blur-md relative z-10 w-full">
      <div className="max-w-[1600px] mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="font-black tracking-tighter text-xl">
            Orbit<span className="text-blue-500">.</span>
          </div>
          <div className="flex flex-col gap-1 items-center md:items-start text-[10px] sm:text-xs text-[var(--muted)] font-medium bg-[var(--card-bg)] px-4 py-2 rounded-xl border border-[var(--card-border)]">
            <span>© {currentYear} Mindcraft. All rights reserved.</span>
            <a href="mailto:support.mindcraft@gmail.com" className="hover:text-blue-500 transition-colors">
              support.mindcraft@gmail.com
            </a>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 bg-[var(--card-bg)] px-6 py-3 rounded-2xl border border-[var(--card-border)]">
          <button onClick={() => setPolicyType('terms')} className="text-[10px] sm:text-xs uppercase font-bold text-[var(--muted)] hover:text-blue-500 transition-colors tracking-widest">
            Terms
          </button>
          <div className="w-[1px] bg-[var(--card-border)]" />
          <button onClick={() => setPolicyType('privacy')} className="text-[10px] sm:text-xs uppercase font-bold text-[var(--muted)] hover:text-blue-500 transition-colors tracking-widest">
            Privacy
          </button>
          <div className="w-[1px] bg-[var(--card-border)]" />
          <button onClick={() => setPolicyType('creators')} className="text-[10px] sm:text-xs uppercase font-bold text-[var(--muted)] hover:text-blue-500 transition-colors tracking-widest">
            The Crew
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
