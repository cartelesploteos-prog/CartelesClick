import * as React from "react";
import { BorderBeam, type BorderBeamProps } from "./BorderBeam";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "beam";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  /**
   * Automatically adds a glowing animated BorderBeam to this button.
   * Can be boolean or custom BorderBeamProps configuration.
   */
  borderBeam?: boolean | Partial<BorderBeamProps>;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      borderBeam = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isBeamVariant = variant === "beam" || Boolean(borderBeam);

    const baseStyles =
      "relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium font-sans transition-all duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none rounded-[7px] cursor-pointer active:scale-[0.98]";

    const variantStyles = {
      primary: "bg-primary text-white hover:bg-[#D6681E] border border-transparent shadow-none",
      secondary:
        "bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]",
      outline:
        "border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-primary hover:text-primary bg-transparent",
      ghost:
        "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-transparent",
      beam:
        "border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-primary bg-[var(--bg-surface-elevated)] overflow-hidden shadow-md hover:shadow-lg",
    };

    const sizeStyles = {
      sm: "h-9 px-3 text-xs min-h-[2.25rem]",
      md: "h-11 px-5 text-sm min-h-[2.75rem]",
      lg: "h-13 px-7 text-base font-semibold min-h-[3.25rem]",
      icon: "h-11 w-11 p-0 min-h-[2.75rem] min-w-[2.75rem]",
    };

    const overflowStyle = isBeamVariant || className.includes("overflow-hidden") ? "overflow-hidden" : "";

    const beamConfig: Partial<BorderBeamProps> =
      typeof borderBeam === "object" ? borderBeam : {};

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${overflowStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Procesando...</span>
          </span>
        ) : (
          <>
            {children}
            {isBeamVariant && (
              <BorderBeam
                size={beamConfig.size ?? 44}
                initialOffset={beamConfig.initialOffset ?? 20}
                duration={beamConfig.duration}
                colorFrom={beamConfig.colorFrom}
                colorTo={beamConfig.colorTo}
                className={beamConfig.className}
                transition={beamConfig.transition}
                {...beamConfig}
              />
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

