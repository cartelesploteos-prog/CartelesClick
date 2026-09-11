import confetti from "canvas-confetti";
import { useNotificationStore } from "../../store/useNotificationStore";

/**
 * High-impact celebration sound synthesis using Web Audio API
 */
const playCelebrationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a delightful two-tone champagne clink chime
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    osc1.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6 (crisp glass clink)
    osc1.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.12); // E6
    
    osc2.frequency.setValueAtTime(2093.0, ctx.currentTime); // C7 harmonic
    osc2.frequency.exponentialRampToValueAtTime(2637.02, ctx.currentTime + 0.15); // E7

    gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 0.6);
  } catch {
    // AudioContext blocked or not supported in restricted iframe
  }
};

// Palette of system blues, celestes, and electric cyans matching the UI
const SYSTEM_CONFETTI_COLORS = [
  "#0284C7", // Sky 600 / Primario de sistema
  "#0EA5E9", // Sky 500
  "#38BDF8", // Sky 400 celeste claro
  "#06B6D4", // Cyan 500
  "#22D3EE", // Cyan 400 celeste cian
  "#3B82F6", // Blue 500 eléctrico
  "#FFFFFF", // Blanco puro
];

const SYSTEM_SPARKLE_COLORS = [
  "#38BDF8", // Celeste cielo
  "#22D3EE", // Celeste cian brillante
  "#67E8F9", // Cian claro
  "#0EA5E9", // Azul cielo
  "#FFFFFF", // Brillo blanco
];

/**
 * Triggers order placement celebration (checkout completed)
 */
export const triggerOrderCelebration = () => {
  try {
    playCelebrationChime();

    // 1. Confetti burst from both sides in system blue & cyan tones
    confetti({
      particleCount: 75,
      spread: 75,
      origin: { y: 0.6, x: 0.2 },
      colors: SYSTEM_CONFETTI_COLORS,
    });
    confetti({
      particleCount: 75,
      spread: 75,
      origin: { y: 0.6, x: 0.8 },
      colors: SYSTEM_CONFETTI_COLORS,
    });
  } catch {
    // Graceful fallback
  }
};

/**
 * Triggers a "Brindis" celebration with confetti & toast feedback
 * when clicking CTAs or entering Click Mode
 */
export const triggerBrindisCelebration = (
  optionsOrTitle?:
    | string
    | {
        title?: string;
        message?: string;
        x?: number;
        y?: number;
      }
) => {
  const options =
    typeof optionsOrTitle === "string"
      ? { title: optionsOrTitle }
      : optionsOrTitle;

  const originX = options?.x !== undefined ? Math.max(0.1, Math.min(0.9, options.x)) : 0.5;
  const originY = options?.y !== undefined ? Math.max(0.1, Math.min(0.9, options.y)) : 0.65;

  try {
    playCelebrationChime();

    // Confetti cannon blast in system blue & cyan tones
    confetti({
      particleCount: 50,
      angle: 90,
      spread: 65,
      startVelocity: 35,
      origin: { x: originX, y: originY },
      colors: SYSTEM_CONFETTI_COLORS,
      shapes: ["circle", "square"],
      ticks: 200,
    });

    // Secondary sparkle burst
    setTimeout(() => {
      confetti({
        particleCount: 28,
        angle: 60,
        spread: 45,
        origin: { x: Math.max(0.1, originX - 0.15), y: originY },
        colors: SYSTEM_SPARKLE_COLORS,
      });
      confetti({
        particleCount: 28,
        angle: 120,
        spread: 45,
        origin: { x: Math.min(0.9, originX + 0.15), y: originY },
        colors: SYSTEM_SPARKLE_COLORS,
      });
    }, 120);

    // Toast notification for user
    if (options?.title || options?.message) {
      useNotificationStore.getState().addNotification({
        type: "promotion",
        title: options.title || "🥂 ¡Salud por tu proyecto!",
        message: options.message || "Cotización calculada en vivo y lista para imprimir.",
        priority: "normal",
      });
    }
  } catch {
    // Canvas fallback
  }
};
