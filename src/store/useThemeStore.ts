import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeStore {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
  initTheme: () => void;
}

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
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
};

let mediaQueryListenerAttached = false;

export const useThemeStore = create<ThemeStore>((set, get) => {
  const initialSaved =
    (typeof window !== "undefined"
      ? (localStorage.getItem("cc_theme") as ThemeMode)
      : null) || "light";

  const initialResolved =
    initialSaved === "system" ? getSystemTheme() : initialSaved;

  // Apply immediately on creation in browser
  if (typeof window !== "undefined") {
    applyThemeToDOM(initialResolved);
  }

  const setupListener = () => {
    if (typeof window === "undefined" || mediaQueryListenerAttached) return;
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
          localStorage.setItem("cc_theme", mode);
        } catch {
          // Storage fallback
        }
      }

      const resolved = mode === "system" ? getSystemTheme() : mode;
      applyThemeToDOM(resolved);
      set({ theme: mode, resolvedTheme: resolved });
    },

    initTheme: () => {
      setupListener();
      const currentMode = get().theme;
      const resolved = currentMode === "system" ? getSystemTheme() : currentMode;
      applyThemeToDOM(resolved);
      set({ resolvedTheme: resolved });
    },
  };
});


