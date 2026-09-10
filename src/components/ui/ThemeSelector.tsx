import React from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useThemeStore } from "../../store/useThemeStore";

interface ThemeSelectorProps {
  className?: string;
  id?: string;
  showLabel?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = "",
  id = "btn-theme-toggle",
  showLabel = false,
}) => {
  const { resolvedTheme, toggleTheme } = useThemeStore();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      className={`relative h-10 px-3 sm:h-11 sm:px-3.5 flex items-center justify-center gap-2 rounded-full bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-primary)] transition-all active:scale-95 cursor-pointer overflow-hidden shadow-xs select-none ${className}`}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Activar Modo Claro" : "Activar Modo Oscuro"}
    >
      <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="theme-sun"
              initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center justify-center"
            >
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            </motion.div>
          ) : (
            <motion.div
              key="theme-moon"
              initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center justify-center"
            >
              <Moon className="w-4.5 h-4.5 text-[var(--text-primary)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="text-xs font-medium tracking-tight">
          {isDark ? "Modo Claro" : "Modo Oscuro"}
        </span>
      )}
    </button>
  );
};

