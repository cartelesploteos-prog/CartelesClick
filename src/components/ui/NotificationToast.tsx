import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Sparkles, BookOpen, Bell, X, ArrowRight } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';

interface NotificationToastProps {
  onNavigate?: (tab: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onNavigate }) => {
  const { activeToast, clearToast } = useNotificationStore();

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast, clearToast]);

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
      case 'order_status':
        return <Package className="w-5 h-5 text-emerald-400" strokeWidth={1.85} />;
      case 'promotion':
        return <Sparkles className="w-5 h-5 text-amber-400" strokeWidth={1.85} />;
      case 'blog':
        return <BookOpen className="w-5 h-5 text-blue-400" strokeWidth={1.85} />;
      default:
        return <Bell className="w-5 h-5 text-primary" strokeWidth={1.85} />;
    }
  };

  const handleAction = () => {
    if (activeToast.link && onNavigate) {
      onNavigate(activeToast.link);
    }
    clearToast();
  };

  return (
    <AnimatePresence>
      <div className="fixed bottom-20 right-4 sm:right-6 z-50 max-w-sm w-full pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="pointer-events-auto bg-[#14151B]/95 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shadow-2xl shadow-black/80 flex items-start gap-3 text-white"
        >
          <div className="w-10 h-10 rounded-[7px] bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7744]">
                Nueva Notificación
              </span>
              <button
                onClick={clearToast}
                className="text-zinc-400 hover:text-white p-1 rounded-[5px] hover:bg-white/10 transition-colors"
                aria-label="Cerrar notificación"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>

            <h4 className="text-xs font-semibold text-white leading-tight">
              {activeToast.title}
            </h4>

            <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
              {activeToast.message}
            </p>

            {activeToast.link && (
              <button
                onClick={handleAction}
                className="pt-1 text-xs text-[#FF7744] font-medium flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Ver detalles</span>
                <ArrowRight className="w-3 h-3" strokeWidth={2} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
