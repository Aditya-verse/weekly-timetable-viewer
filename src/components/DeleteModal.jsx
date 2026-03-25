import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const DeleteModal = () => {
  const { deleteConfirmId, setDeleteConfirmId, confirmDelete } = useContext(AppContext);

  if (deleteConfirmId === null) return null;

  return (
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
  );
};

export default DeleteModal;
