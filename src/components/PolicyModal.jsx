import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, FileText, Users } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const PolicyModal = () => {
  const { policyType, setPolicyType } = useContext(AppContext);

  if (!policyType) return null;

  const getTitle = () => {
    if (policyType === 'terms') return 'Terms & Conditions';
    if (policyType === 'privacy') return 'Privacy Policy';
    return 'Meet the Crew';
  };

  const getIcon = () => {
    if (policyType === 'terms') return <FileText className="text-blue-500" />;
    if (policyType === 'privacy') return <ShieldCheck className="text-green-500" />;
    return <Users className="text-amber-500" />;
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setPolicyType(null)}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-[var(--bg)] rounded-3xl shadow-2xl border border-[var(--card-border)] overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)] bg-[var(--card-bg)]">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest">
              {getTitle()}
            </h2>
          </div>
          <button 
            onClick={() => setPolicyType(null)} 
            className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors rounded-xl hover:bg-[var(--card-bg)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-[var(--text)]/80 leading-relaxed scrollbar-hide">
          {policyType === 'creators' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { role: 'Developer', name: 'Aditya Mane', color: 'blue' },
                { role: 'Developer', name: 'Aditya Kudalkar', color: 'purple' },
                { role: 'Tester', name: 'Aryan Bavkar', color: 'green' },
                { role: 'Tester', name: 'Prasad Khade', color: 'amber' }
              ].map((member, i) => (
                <div key={i} className={`flex flex-col items-center p-6 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] hover:border-${member.color}-500 transition-colors`}>
                  <div className={`w-12 h-12 rounded-full bg-[var(--bg)] flex items-center justify-center mb-4 border border-[var(--card-border)]`}>
                    <Users className={`text-${member.color}-500`} size={24} />
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--muted)] mb-1">{member.role}</span>
                  <span className="text-lg font-bold text-[var(--text)] text-center">{member.name}</span>
                </div>
              ))}
            </div>
          )}

          {policyType === 'terms' && (
            <>
              <section>
                <h3 className="font-bold text-[var(--text)] mb-2 uppercase tracking-widest text-xs border-b border-[var(--card-border)] pb-2">1. Acceptance of Terms</h3>
                <p>Welcome to Weekly Orbit. By accessing and using our application, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </section>
              <section>
                <h3 className="font-bold text-[var(--text)] mb-2 uppercase tracking-widest text-xs border-b border-[var(--card-border)] pb-2">2. User Data and Local Storage</h3>
                <p>Your data, including tasks, subtasks, and categories, is stored locally in your web browser. Weekly Orbit does not transmit your personal timetable data to external servers, unless explicitly integrated via the Google Calendar API.</p>
              </section>
              <section>
                <h3 className="font-bold text-[var(--text)] mb-2 uppercase tracking-widest text-xs border-b border-[var(--card-border)] pb-2">3. Google Calendar Integration</h3>
                <p>If you choose to sync with Google Calendar, you grant Weekly Orbit permission to read your calendar events strictly for the purpose of displaying them in your local timetable grid.</p>
              </section>
              <section>
                <h3 className="font-bold text-[var(--text)] mb-2 uppercase tracking-widest text-xs border-b border-[var(--card-border)] pb-2">4. Warranties & Liability</h3>
                <p>The application is provided "as is" without warranty of any kind. The development team (Aditya Mane, Aditya Kudalkar, Aryan Bavkar, and Prasad Khade) is not liable for missed appointments or data loss.</p>
              </section>
            </>
          )}

          {policyType === 'privacy' && (
            <>
              <section>
                <h3 className="font-bold text-[var(--text)] mb-2 uppercase tracking-widest text-xs border-b border-[var(--card-border)] pb-2">1. Information Collection</h3>
                <p>Weekly Orbit is a privacy-first application. We do NOT collect, harvest, or sell your personal data. All objective and timetable information resides strictly within your browser's HTML5 Local Storage.</p>
              </section>
              <section>
                <h3 className="font-bold text-[var(--text)] mb-2 uppercase tracking-widest text-xs border-b border-[var(--card-border)] pb-2">2. Third-Party Services</h3>
                <p>Our OAuth2 implementation connects to Google's API to render external events. This token is securely handled and is solely utilized to fetch calendar events matching the current week.</p>
              </section>
              <section>
                <h3 className="font-bold text-[var(--text)] mb-2 uppercase tracking-widest text-xs border-b border-[var(--card-border)] pb-2">3. Analytics and Tracking</h3>
                <p>We do not use embedded tracking pixels, Google Analytics, or third-party cookies. The Analytics Dashboard built into this app is computed 100% locally on your machine.</p>
              </section>
              <section>
                <h3 className="font-bold text-[var(--text)] mb-2 uppercase tracking-widest text-xs border-b border-[var(--card-border)] pb-2">4. Your Consent</h3>
                <p>By using our site and local storage infrastructure, you consent to our online privacy policy.</p>
              </section>
            </>
          )}
        </div>
        
        <div className="p-4 sm:p-6 border-t border-[var(--card-border)] bg-[var(--card-bg)] text-center">
          <button onClick={() => setPolicyType(null)} className="w-full max-w-xs mx-auto py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            {policyType === 'creators' ? 'Awesome' : 'Acknowledge'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PolicyModal;
