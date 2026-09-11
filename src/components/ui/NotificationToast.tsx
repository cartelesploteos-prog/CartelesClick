import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Sparkles, BookOpen, Bell, X, ArrowRight } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { BorderBeam } from './BorderBeam';

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

  const getBadgeInfo = () => {
    switch (activeToast.type) {
      case 'order_status':
        return {
          label: 'Estado de Pedido',
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
      case 'promotion':
        return {
          label: 'Celebración & Taller',
          color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
        };
      case 'blog':
        return {
          label: 'Novedad de Taller',
          color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        };
      default:
        return {
          label: 'Notificación',
          color: 'text-primary bg-primary/10 border-primary/20',
        };
    }
  };

  const getIcon = () => {
    switch (activeToast.type) {
      case 'order_status':
        return <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.85} />;
      case 'promotion':
        return <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400 animate-pulse" strokeWidth={1.85} />;
      case 'blog':
        return <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" strokeWidth={1.85} />;
      default:
        return <Bell className="w-5 h-5 text-primary" strokeWidth={1.85} />;
    }
  };

  const badge = getBadgeInfo();

  const handleAction = () => {
    if (activeToast.link && onNavigate) {
      onNavigate(activeToast.link);
    }
    clearToast();
  };

  return (
    <AnimatePresence>
      <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-full pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto liquid-glass-dropdown relative p-4 rounded-2xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden flex items-start gap-3.5 text-[var(--text-primary)]"
        >
          {/* Subtle crisp white border beam matching UI */}
          <BorderBeam size={48} borderWidth={1.5} duration={4.5} />

          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
              <button
                onClick={clearToast}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-md hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
                aria-label="Cerrar notificación"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>

            <h4 className="text-xs font-semibold text-[var(--text-primary)] leading-tight pt-0.5">
              {activeToast.title}
            </h4>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
              {activeToast.message}
            </p>

            {activeToast.link && (
              <button
                onClick={handleAction}
                className="pt-1.5 text-xs text-primary font-medium flex items-center gap-1 hover:underline cursor-pointer group"
              >
                <span>Ver detalles</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
