import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Check, Plus, Package } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useCurrencyStore } from "../../store/useCurrencyStore";
import { BorderBeam } from "./BorderBeam";

interface AddToCartButtonProps {
  onAddToCart: () => void | Promise<void>;
  itemDetails?: {
    name: string;
    quantity?: number;
    dimensions?: string;
    priceARS?: number;
  };
  label?: string;
  successLabel?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showPrice?: boolean;
  priceARS?: number;
  icon?: React.ReactNode;
  id?: string;
}

/**
 * Play subtle, elegant Web Audio chime for micro-feedback
 */
const playSuccessSound = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.12); // D6

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Graceful fallback for restricted environments
  }
};

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  onAddToCart,
  itemDetails,
  label = "Agregar al Carrito",
  successLabel = "¡Agregado con Éxito!",
  className = "",
  disabled = false,
  size = "md",
  showPrice = false,
  priceARS,
  icon,
  id = "btn-add-to-cart",
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRippling, setIsRippling] = useState(false);
  const { formatPrice } = useCurrencyStore();

  const sizeClasses = {
    sm: "min-h-[2.5rem] px-3.5 py-2 text-xs",
    md: "min-h-[2.75rem] px-5 py-2.5 text-xs sm:text-sm",
    lg: "min-h-[3.25rem] px-6 py-3.5 text-sm sm:text-base",
  }[size];

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isSuccess) return;

    // Trigger ripple & sound
    setIsRippling(true);
    playSuccessSound();

    // Call execution handler
    await onAddToCart();

    // Set success animation
    setIsSuccess(true);

    // Dynamic toast notification
    const itemName = itemDetails?.name || "Producto personalizado";
    const qty = itemDetails?.quantity || 1;
    const dim = itemDetails?.dimensions ? ` (${itemDetails.dimensions})` : "";

    useNotificationStore.getState().addNotification({
      type: "order_status",
      title: "🛒 Agregado al Carrito",
      message: `${qty}x ${itemName}${dim} listo en tu orden de producción.`,
      priority: "normal",
      link: "cotizador",
    });

    // Reset ripple
    setTimeout(() => setIsRippling(false), 600);

    // Reset success state after delay
    setTimeout(() => {
      setIsSuccess(false);
    }, 2800);
  };

  return (
    <motion.button
      id={id}
      type="button"
      whileHover={disabled ? {} : { scale: 1.015 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden rounded-xl font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer select-none shadow-md ${sizeClasses} ${
        isSuccess
          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 border border-emerald-400/40"
          : "bg-primary hover:bg-primary-hover text-white shadow-primary/25 border border-primary/40"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {/* EXPANDING RIPPLE / PULSE RING */}
      {isRippling && (
        <motion.span
          initial={{ scale: 0.3, opacity: 0.8 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0 rounded-xl bg-white/30 pointer-events-none"
        />
      )}

      {/* FLOATING +1 PARTICLES */}
      <AnimatePresence>
        {isSuccess && (
          <motion.span
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -24, scale: 1 }}
            exit={{ opacity: 0, y: -36 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -top-1 right-4 font-mono font-bold text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-lg pointer-events-none z-20 border border-white/40"
          >
            +{itemDetails?.quantity || 1}
          </motion.span>
        )}
      </AnimatePresence>

      {/* ICON MORPH */}
      <AnimatePresence mode="wait" initial={false}>
        {isSuccess ? (
          <motion.div
            key="success-icon"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="shrink-0"
          >
            <Check className="w-4 h-4 text-white" strokeWidth={2.4} />
          </motion.div>
        ) : (
          <motion.div
            key="default-icon"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="shrink-0"
          >
            {icon || <ShoppingBag className="w-4 h-4 text-white" strokeWidth={1.85} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LABEL WITH SMOOTH CROSS-FADE */}
      <div className="relative flex items-center gap-1.5 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isSuccess ? (
            <motion.span
              key="success-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="font-bold tracking-tight"
            >
              {successLabel}
            </motion.span>
          ) : (
            <motion.span
              key="default-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="tracking-tight"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {showPrice && priceARS !== undefined && !isSuccess && (
          <span className="font-mono font-bold opacity-90 text-[11px] sm:text-xs ml-1 border-l border-white/20 pl-2">
            {formatPrice(priceARS)}
          </span>
        )}
      </div>

      {/* BORDER BEAM SHIMMER ACCENT */}
      {!isSuccess && !disabled && (
        <BorderBeam size={36} initialOffset={15} />
      )}
    </motion.button>
  );
};
