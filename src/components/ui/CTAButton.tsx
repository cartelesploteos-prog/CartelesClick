import React from "react";
import confetti from "canvas-confetti";
import { Button, ButtonProps } from "./Button";
import { triggerBrindisCelebration } from "./ToastCelebration";

export interface CTAButtonProps extends Omit<ButtonProps, "onClick"> {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  celebrationMessage?: string;
  hideBorderBeam?: boolean;
  borderWidth?: number;
  colorTo?: string;
  borderColor?: string;
  colorFrom?: string;
  duration?: number;
  enableConfetti?: boolean;
  className?: string;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  children,
  onClick,
  celebrationMessage = "¡Acción completada con éxito! 🥂✨",
  hideBorderBeam = false,
  borderWidth = 2,
  colorTo,
  borderColor,
  colorFrom = "#FFE600",
  duration = 3.5,
  enableConfetti = true,
  className = "",
  ...props
}) => {
  const resolvedColorTo = colorTo || borderColor || "#FCD34D";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (enableConfetti) {
      try {
        confetti({
          particleCount: 65,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["[var(--brand-brick)]", "#FCD34D", "#FFE600", "#FF7744", "#FFFFFF"],
        });
      } catch (err) {
        console.warn("Canvas confetti effect unavailable:", err);
      }
    }

    if (celebrationMessage) {
      triggerBrindisCelebration(celebrationMessage);
    }

    if (onClick) onClick(e);
  };

  return (
    <Button
      onClick={handleClick}
      className={`cta-border-beam px-8 py-3.5 min-h-[3rem] rounded-full bg-[var(--brand-brick)] hover:bg-[#FF6B38] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(255,85,32,0.35)] transition-all cursor-pointer ${className}`}
      borderBeam={
        hideBorderBeam
          ? false
          : {
              borderWidth,
              colorTo: resolvedColorTo,
              colorFrom,
              duration,
              size: 60,
            }
      }
      {...props}
    >
      {children}
    </Button>
  );
};

export default CTAButton;


