import React from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useThemeStore } from "../../store/useThemeStore";

export const ThemeSelector: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { resolvedTheme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-11 h-11 flex items-center justify-center rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.09] dark:hover:bg-white/[0.14] border border-black/10 dark:border-white/15 text-zinc-800 dark:text-zinc-200 transition-all active:scale-95 cursor-pointer overflow-hidden ${className}`}
      aria-label={resolvedTheme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={resolvedTheme === "dark" ? "Modo Claro" : "Modo Oscuro"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {resolvedTheme === "dark" ? (
          <motion.div
            key="theme-sun"
            initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center justify-center"
          >
            <Sun className="w-5 h-5 text-amber-400" />
          </motion.div>
        ) : (
          <motion.div
            key="theme-moon"
            initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center justify-center"
          >
            <Moon className="w-5 h-5 text-zinc-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};
