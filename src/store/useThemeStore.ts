import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeStore {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

const STORAGE_KEYS = ["theme", "cc_theme"];

const getSavedTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  try {
    for (const key of STORAGE_KEYS) {
      const saved = localStorage.getItem(key);
      if (saved === "light" || saved === "dark" || saved === "system") {
        return saved as ThemeMode;
      }
    }
  } catch {
    // Storage access error handling (e.g. private mode)
  }
  return "light";
};

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyThemeToDOM = (resolved: "light" | "dark") => {
  if (typeof window === "undefined") return;
  const root = document.documentElement;

  if (resolved === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  }

  // Synchronize mobile status bar / browser theme color
  try {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]:not([media])');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", resolved === "dark" ? "#0B0F19" : "#FAFAFC");
    }
  } catch {
    // Ignore if meta tag cannot be updated
  }
};

let mediaQueryListenerAttached = false;
let storageListenerAttached = false;

export const useThemeStore = create<ThemeStore>((set, get) => {
  const initialSaved = getSavedTheme();
  const initialResolved =
    initialSaved === "system" ? getSystemTheme() : initialSaved;

  // Apply immediately on creation in browser
  if (typeof window !== "undefined") {
    applyThemeToDOM(initialResolved);
  }

  const setupListener = () => {
    if (typeof window === "undefined") return;

    if (!mediaQueryListenerAttached) {
      mediaQueryListenerAttached = true;
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
        if (get().theme === "system") {
          const newResolved = e.matches ? "dark" : "light";
          applyThemeToDOM(newResolved);
          set({ resolvedTheme: newResolved });
        }
      };

      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", handleSystemThemeChange);
      } else if (typeof (mediaQuery as any).addListener === "function") {
        (mediaQuery as any).addListener(handleSystemThemeChange);
      }
    }

    // Cross-tab synchronization
    if (!storageListenerAttached) {
      storageListenerAttached = true;
      window.addEventListener("storage", (e: StorageEvent) => {
        if (e.key && STORAGE_KEYS.includes(e.key) && e.newValue) {
          const newMode = e.newValue as ThemeMode;
          if (newMode === "light" || newMode === "dark" || newMode === "system") {
            const resolved = newMode === "system" ? getSystemTheme() : newMode;
            applyThemeToDOM(resolved);
            set({ theme: newMode, resolvedTheme: resolved });
          }
        }
      });
    }
  };

  // Attach listener right away if in browser
  if (typeof window !== "undefined") {
    setupListener();
  }

  return {
    theme: initialSaved,
    resolvedTheme: initialResolved,

    setTheme: (mode: ThemeMode) => {
      if (typeof window !== "undefined") {
        try {
          for (const key of STORAGE_KEYS) {
            localStorage.setItem(key, mode);
          }
        } catch {
          // Storage fallback
        }
      }

      const resolved = mode === "system" ? getSystemTheme() : mode;
      applyThemeToDOM(resolved);
      set({ theme: mode, resolvedTheme: resolved });
    },

    toggleTheme: () => {
      const current = get().resolvedTheme;
      const next: ThemeMode = current === "dark" ? "light" : "dark";
      get().setTheme(next);
    },

    initTheme: () => {
      setupListener();
      const currentMode = getSavedTheme();
      const resolved = currentMode === "system" ? getSystemTheme() : currentMode;
      applyThemeToDOM(resolved);
      set({ theme: currentMode, resolvedTheme: resolved });
    },
  };
});



