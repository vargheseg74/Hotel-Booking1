/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, X, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface NotificationProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function Notification({ toasts, onRemove }: NotificationProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl bg-white backdrop-blur-md ${
              toast.type === 'success'
                ? 'border-emerald-100 bg-white/95 text-emerald-950 shadow-emerald-100/30'
                : toast.type === 'error'
                ? 'border-rose-100 bg-white/95 text-rose-950 shadow-rose-100/30'
                : 'border-luxury-gold-light bg-stone-55/95 text-stone-900 shadow-stone-100/30'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#A88C52]" />}
            </div>
            
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {toast.text}
            </div>

            <button
              onClick={() => onRemove(toast.id)}
              className="shrink-0 p-0.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
