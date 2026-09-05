import React from "react";
import { LucideIcon } from "lucide-react";

export type IconSize = "micro" | "compact" | "sm" | "md" | "lg" | "xl" | "display";
export type IconVariant = "primary" | "accent" | "neutral" | "success" | "warning" | "error" | "info" | "white";
export type IconContainerStyle = "subtle" | "ghost" | "solid" | "glass" | "bordered" | "none";

interface IconBadgeProps {
  icon: LucideIcon;
  size?: IconSize;
  variant?: IconVariant;
  containerStyle?: IconContainerStyle;
  className?: string;
  iconClassName?: string;
  ariaLabel?: string;
  title?: string;
  animateOnHover?: boolean;
}

const SIZE_MAP: Record<IconSize, { iconClass: string; containerClass: string; strokeWidth: number }> = {
  micro: {
    iconClass: "w-3 h-3",
    containerClass: "w-5 h-5 rounded-[5px]",
    strokeWidth: 2,
  },
  compact: {
    iconClass: "w-3.5 h-3.5",
    containerClass: "w-7 h-7 rounded-[7px]",
    strokeWidth: 2,
  },
  sm: {
    iconClass: "w-4 h-4",
    containerClass: "w-8 h-8 sm:w-9 sm:h-9 rounded-[7px]",
    strokeWidth: 2,
  },
  md: {
    iconClass: "w-5 h-5",
    containerClass: "w-10 h-10 rounded-[8px]",
    strokeWidth: 2,
  },
  lg: {
    iconClass: "w-6 h-6",
    containerClass: "w-12 h-12 rounded-[10px]",
    strokeWidth: 1.85,
  },
  xl: {
    iconClass: "w-8 h-8",
    containerClass: "w-16 h-16 rounded-[14px]",
    strokeWidth: 1.75,
  },
  display: {
    iconClass: "w-11 h-11",
    containerClass: "w-20 h-20 rounded-[18px]",
    strokeWidth: 1.5,
  },
};

const VARIANT_MAP: Record<
  IconVariant,
  Record<IconContainerStyle, { container: string; icon: string }>
> = {
  primary: {
    subtle: {
      container: "bg-[#C8380A]/10 dark:bg-[#FF5520]/15 border border-[#C8380A]/20 dark:border-[#FF5520]/30",
      icon: "text-[#C8380A] dark:text-[#FF5520]",
    },
    ghost: {
      container: "bg-transparent",
      icon: "text-[#C8380A] dark:text-[#FF5520]",
    },
    solid: {
      container: "bg-[#C8380A] dark:bg-[#FF5520] text-white shadow-xs",
      icon: "text-white",
    },
    glass: {
      container: "bg-[#C8380A]/10 dark:bg-[#FF5520]/15 backdrop-blur-md border border-[#C8380A]/25 dark:border-[#FF5520]/35",
      icon: "text-[#C8380A] dark:text-[#FF5520]",
    },
    bordered: {
      container: "border border-[#C8380A]/40 dark:border-[#FF5520]/40 bg-transparent",
      icon: "text-[#C8380A] dark:text-[#FF5520]",
    },
    none: {
      container: "",
      icon: "text-[#C8380A] dark:text-[#FF5520]",
    },
  },
  accent: {
    subtle: {
      container: "bg-[#B45309]/10 dark:bg-[#FFA048]/15 border border-[#B45309]/20 dark:border-[#FFA048]/30",
      icon: "text-[#B45309] dark:text-[#FFA048]",
    },
    ghost: {
      container: "bg-transparent",
      icon: "text-[#B45309] dark:text-[#FFA048]",
    },
    solid: {
      container: "bg-[#B45309] dark:bg-[#FFA048] text-white dark:text-black shadow-xs",
      icon: "text-white dark:text-black",
    },
    glass: {
      container: "bg-[#B45309]/10 dark:bg-[#FFA048]/15 backdrop-blur-md border border-[#B45309]/25 dark:border-[#FFA048]/35",
      icon: "text-[#B45309] dark:text-[#FFA048]",
    },
    bordered: {
      container: "border border-[#B45309]/40 dark:border-[#FFA048]/40 bg-transparent",
      icon: "text-[#B45309] dark:text-[#FFA048]",
    },
    none: {
      container: "",
      icon: "text-[#B45309] dark:text-[#FFA048]",
    },
  },
  neutral: {
    subtle: {
      container: "bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12]",
      icon: "text-zinc-800 dark:text-zinc-200",
    },
    ghost: {
      container: "bg-transparent",
      icon: "text-zinc-700 dark:text-zinc-300",
    },
    solid: {
      container: "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs",
      icon: "text-white dark:text-zinc-900",
    },
    glass: {
      container: "bg-black/[0.03] dark:bg-white/[0.05] backdrop-blur-md border border-black/[0.08] dark:border-white/[0.12]",
      icon: "text-zinc-800 dark:text-zinc-200",
    },
    bordered: {
      container: "border border-black/15 dark:border-white/20 bg-transparent",
      icon: "text-zinc-800 dark:text-zinc-200",
    },
    none: {
      container: "",
      icon: "text-zinc-700 dark:text-zinc-300",
    },
  },
  success: {
    subtle: {
      container: "bg-emerald-500/10 dark:bg-emerald-400/15 border border-emerald-500/20 dark:border-emerald-400/30",
      icon: "text-emerald-700 dark:text-emerald-400",
    },
    ghost: {
      container: "bg-transparent",
      icon: "text-emerald-700 dark:text-emerald-400",
    },
    solid: {
      container: "bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs",
      icon: "text-white",
    },
    glass: {
      container: "bg-emerald-500/10 dark:bg-emerald-400/15 backdrop-blur-md border border-emerald-500/25 dark:border-emerald-400/35",
      icon: "text-emerald-700 dark:text-emerald-400",
    },
    bordered: {
      container: "border border-emerald-600/30 dark:border-emerald-400/30 bg-transparent",
      icon: "text-emerald-700 dark:text-emerald-400",
    },
    none: {
      container: "",
      icon: "text-emerald-700 dark:text-emerald-400",
    },
  },
  warning: {
    subtle: {
      container: "bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/20 dark:border-amber-400/30",
      icon: "text-amber-700 dark:text-amber-400",
    },
    ghost: {
      container: "bg-transparent",
      icon: "text-amber-700 dark:text-amber-400",
    },
    solid: {
      container: "bg-amber-600 dark:bg-amber-500 text-white shadow-xs",
      icon: "text-white",
    },
    glass: {
      container: "bg-amber-500/10 dark:bg-amber-400/15 backdrop-blur-md border border-amber-500/25 dark:border-amber-400/35",
      icon: "text-amber-700 dark:text-amber-400",
    },
    bordered: {
      container: "border border-amber-600/30 dark:border-amber-400/30 bg-transparent",
      icon: "text-amber-700 dark:text-amber-400",
    },
    none: {
      container: "",
      icon: "text-amber-700 dark:text-amber-400",
    },
  },
  error: {
    subtle: {
      container: "bg-red-500/10 dark:bg-red-400/15 border border-red-500/20 dark:border-red-400/30",
      icon: "text-red-700 dark:text-red-400",
    },
    ghost: {
      container: "bg-transparent",
      icon: "text-red-700 dark:text-red-400",
    },
    solid: {
      container: "bg-red-600 dark:bg-red-500 text-white shadow-xs",
      icon: "text-white",
    },
    glass: {
      container: "bg-red-500/10 dark:bg-red-400/15 backdrop-blur-md border border-red-500/25 dark:border-red-400/35",
      icon: "text-red-700 dark:text-red-400",
    },
    bordered: {
      container: "border border-red-600/30 dark:border-red-400/30 bg-transparent",
      icon: "text-red-700 dark:text-red-400",
    },
    none: {
      container: "",
      icon: "text-red-700 dark:text-red-400",
    },
  },
  info: {
    subtle: {
      container: "bg-blue-500/10 dark:bg-blue-400/15 border border-blue-500/20 dark:border-blue-400/30",
      icon: "text-blue-700 dark:text-blue-400",
    },
    ghost: {
      container: "bg-transparent",
      icon: "text-blue-700 dark:text-blue-400",
    },
    solid: {
      container: "bg-blue-600 dark:bg-blue-500 text-white shadow-xs",
      icon: "text-white",
    },
    glass: {
      container: "bg-blue-500/10 dark:bg-blue-400/15 backdrop-blur-md border border-blue-500/25 dark:border-blue-400/35",
      icon: "text-blue-700 dark:text-blue-400",
    },
    bordered: {
      container: "border border-blue-600/30 dark:border-blue-400/30 bg-transparent",
      icon: "text-blue-700 dark:text-blue-400",
    },
    none: {
      container: "",
      icon: "text-blue-700 dark:text-blue-400",
    },
  },
  white: {
    subtle: {
      container: "bg-white/15 border border-white/25",
      icon: "text-white",
    },
    ghost: {
      container: "bg-transparent",
      icon: "text-white",
    },
    solid: {
      container: "bg-white text-zinc-900 shadow-xs",
      icon: "text-zinc-900",
    },
    glass: {
      container: "bg-white/20 backdrop-blur-md border border-white/30",
      icon: "text-white",
    },
    bordered: {
      container: "border border-white/40 bg-transparent",
      icon: "text-white",
    },
    none: {
      container: "",
      icon: "text-white",
    },
  },
};

/**
 * Standardized Accessible Icon Badge for Carteles Click 3D
 * Enforces Lucide stroke width, WCAG AA contrast (light/dark mode) and 7px CAD invariant radius.
 */
export const IconBadge: React.FC<IconBadgeProps> = ({
  icon: Icon,
  size = "md",
  variant = "primary",
  containerStyle = "subtle",
  className = "",
  iconClassName = "",
  ariaLabel,
  title,
  animateOnHover = true,
}) => {
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const variantConfig = (VARIANT_MAP[variant] || VARIANT_MAP.primary)[containerStyle];

  const isStandalone = containerStyle === "none";

  if (isStandalone) {
    if (title || ariaLabel) {
      return (
        <span
          className="inline-flex shrink-0"
          title={title}
          aria-label={ariaLabel}
          role={ariaLabel ? "img" : undefined}
        >
          <Icon
            strokeWidth={sizeConfig.strokeWidth}
            className={`${sizeConfig.iconClass} ${variantConfig.icon} shrink-0 transition-colors ${
              animateOnHover ? "group-hover:scale-105 transition-transform" : ""
            } ${iconClassName}`}
            aria-hidden={true}
          />
        </span>
      );
    }

    return (
      <Icon
        strokeWidth={sizeConfig.strokeWidth}
        className={`${sizeConfig.iconClass} ${variantConfig.icon} shrink-0 transition-colors ${
          animateOnHover ? "group-hover:scale-105 transition-transform" : ""
        } ${iconClassName}`}
        aria-hidden={true}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 transition-all ${
        sizeConfig.containerClass
      } ${variantConfig.container} ${
        animateOnHover ? "group-hover:scale-[1.03]" : ""
      } ${className}`}
      aria-label={ariaLabel}
      title={title}
      role={ariaLabel ? "img" : undefined}
      aria-hidden={!ariaLabel}
    >
      <Icon
        strokeWidth={sizeConfig.strokeWidth}
        className={`${sizeConfig.iconClass} ${variantConfig.icon} shrink-0 ${iconClassName}`}
      />
    </div>
  );
};

export default IconBadge;
